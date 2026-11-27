---
title: "Restarting a socket doesn't bring it back"
date: '2026-11-27T12:53:00-08:00'
slug: restarting-a-socket-doesnt-bring-it-back
draft: true
tags:
- gleam
- beryl
---

The [Heirloom post][heirloom] was about the one process in [beryl][] whose state has to survive a crash: the connection
limiter. Every other process in beryl goes the opposite way. When a socket crashes, I *want* its state gone, and I want
the client to build a new one. Working out which process should own which state, and what a supervisor should do when
one of them dies, took a rewrite of the runtime.

<!--more-->

"Let it crash" is the most famous advice in Erlang. A process hits something it doesn't expect, dies, and its supervisor
starts a fresh copy. The fresh part is easy to skip past. A restarted process comes back with its initial state, and for
most processes that's what you want. For a WebSocket connection, the initial state is wrong.

## One actor for everything

After the [Elm Architecture redesign][elm], each beryl instance ran one runtime actor. That actor held every connected
socket's model, every joined channel's state, every pending reply, and every topic subscription. Your `init` and `update`
callbacks ran inside it.

So beryl couldn't let a callback crash. A panic in one client's message handler would have killed the actor and every
connection it held. Instead, the runtime caught each panic and turned it into the smallest protocol failure it could:

| Panic in | What happened |
|---|---|
| raw `init` | refuse the socket |
| `join` | reject the join |
| a topic message | close that topic |
| `on_info` | close the whole socket |
| a close callback | log it and keep cleaning up |

This works, and OTP has a name for it: [`gen_event`][gen_event], where one manager process hosts several handlers and
drops whichever one fails. Most OTP code isolates faults with processes instead, and so does Phoenix. [Phoenix
Channels][phoenix-channels] starts a process for each client and each topic it joins, and the process boundaries contain
the damage. beryl copied Phoenix's API and wire format, then failed differently on the server.

The shared actor cost more than that. A slow callback in one socket held up all the others. And the panic handling
became part of beryl's correctness: a bug in the rescue code was a bug for every connection.

## Picking the boundaries

I wrote down four options:

1. Keep the shared actor.
2. One process per socket.
3. One process per socket, plus one per joined topic.
4. A new process for each callback.

Option 4 went first. It would copy state into a short-lived process for every event and wait for the answer, which drags
in timeouts and cancellation. The runtime would still have to decide whether a late answer counted.

beryl ended up with both 2 and 3, because it has two APIs. [Raw dispatch][dispatch] gives you one model for the whole
socket, so one process per socket matches the code you already wrote. [Channels][channels] give each joined topic its
own state and callbacks, so each joined topic gets a process, the way Phoenix does it.

With channels, three processes split the work:

- The **socket actor** owns the protocol: which topics are joined, pending replies, heartbeats, presence, and the order
  of outgoing frames.
- A **topic worker** owns one join's channel state and runs its callbacks: `join`, `on_message`, `on_info`, and
  `on_terminate`.
- The **transport process** owns the WebSocket and writes the frames.

Channel state stays typed. beryl seals each handler's state and message types inside closures, so a worker's state
doesn't pass through `Dynamic`, even with a process boundary in the way.

## What one mailbox gave me for free

An actor handles one message at a time, so the old runtime got ordering without trying. Every reply, push, and broadcast
went out in the order the runtime produced it. Once the work moved into separate processes, I had to write the rules
down:

- Within one topic, the order of your actions is the order on the wire.
- Between two topics on the same socket, beryl promises no order. Workers run their callbacks at the same time.
- A worker runs `join` as it starts. The socket actor waits up to five seconds for the answer, then rejects the join.
- When a topic closes, the socket actor tells the worker, applies any results the worker had already computed, and waits
  for `on_terminate`. If the worker doesn't finish within five seconds, the socket actor kills it and drops any replies
  it still owed.

That last rule means a push your channel computed right before the client left still goes out. With one actor, the
question never came up.

Some behavior changed with the split. An `on_info` panic used to close the whole socket. Now it closes only its topic.
If a worker process stops unexpectedly, the runtime closes the topic with `phx_error` and the client has to rejoin.
beryl can't run `on_terminate` in that case, because the state it would pass in died with the worker. Phoenix does the
same thing.

The panic handling didn't go away, either. A raw dispatch socket is one process, and a panic that killed it would close
every topic on the socket, so beryl still catches a panic in a topic message and closes only that topic. Channel workers
catch their panics too, and keep the state from before the panic so `on_terminate` has something to clean up. Processes
keep one client's crash away from everyone else. Inside a process, the rescue code decides whether you lose a topic or a
whole socket.

## Restart is not recovery

Once sockets and topics had their own processes, the next step seemed clear: supervise them, and restart them when they
crash. That's what supervisors are for.

Look at what a socket actor holds, though:

- your application's model for that connection,
- the topics it has joined,
- replies it still owes the client, each tied to a `ref` the client is waiting on,
- heartbeat and rate-limit state,
- presence entries, and
- the functions it uses to write to and close the WebSocket.

A supervisor can restart the process, but it can't put any of that back. A new socket actor could run `init` again, but
`init` needs the client's connection request and token. It would have to rejoin every topic too, and `join` needs the
client's join payload. Without a new handshake from the client, a restart could:

- run authorization or accounting a second time,
- send duplicate join-time messages,
- hand out new refs while the client still holds the old ones,
- start from default state that contradicts what your application already stored, or
- accept a topic the client already left.

The protocol already has a way to rebuild all of this. The client reconnects, which runs `init`, and rejoins each topic,
which runs `join` with fresh references. The [Phoenix JavaScript client][phoenix-js] does both, with backoff. So beryl
makes socket actors and topic workers `Temporary`: when one stops, the supervisor cleans up after it and leaves it
stopped. The client does the recovery.

| Process | Restart policy | What recovers it |
|---|---|---|
| router | `Transient` | restarts with no connections |
| socket factory | `Permanent` | restarts and accepts new connections |
| socket actor | `Temporary` | the client reconnects |
| topic worker | `Temporary` | the client rejoins |

## Then why supervise sockets at all?

At first, beryl didn't. The transport process started each socket actor, and the router and socket actor watched each
other with monitors. If a socket died, the router removed its subscriptions and presence. If the router died, the
sockets stopped. Every process had something responsible for its failure, but no OTP supervisor owned the socket actors.

A supervisor helps even when it never restarts anything. OTP tools can list its children, and it handles shutdown
timeouts and kills the processes that won't stop. So beryl added a shared [factory supervisor][factory] for socket
actors.

The catch is that `factory_supervisor.start_child` is synchronous. The factory waits for each child to finish starting
before it handles the next request, so every new connection on the node goes through one mailbox. If a socket ran your
`init` while it started, one slow `init` would hold up every connection behind it.

So admission happens in two phases. First, the factory starts the socket actor in a `Booting` phase, and the actor
returns without running any of your code. Second, the transport hands the actor to the router. The router checks the
admission token, monitors the actor, adds it to its tables, and tells it to go. Only then does the actor run your
`init` and answer the transport. The factory's part stays small, and `init` runs in parallel across connections.

A `Booting` actor also gives up after a deadline. If its transport dies before reaching the router, nothing else would
tell the actor to stop, and orphans would pile up under the factory.

I set a pass mark before I ran the benchmark: the factory had to keep at least 90% of the old design's startup
throughput. With k6 opening 2,000 connections per second for 30 seconds, three runs each, the old design's median was
1,999.70 starts per second and the factory's was 1,999.90. The factory's median p99 was 5 ms, though one of its three
runs hit 56 ms. That's one start rate on one shared machine, so it says nothing about capacity. At that rate, I couldn't
measure a cost.

## The guardian

The monitors left a gap. A socket actor monitors the router, and if the router dies, the actor gets a `DOWN` message and
stops. But an actor reads its mailbox only between callbacks. If your `update` is stuck in a slow call when the router
dies, the actor doesn't see the message. The factory survives the router restart, so the factory won't stop the stuck
actor either. When `update` finally returns, the actor belongs to a router that no longer exists.

So each socket actor starts a small guardian process before it runs any of your code:

```gleam
fn guard_socket_owner(router_pid: Pid, socket_pid: Pid) -> Nil {
  let _guardian =
    process.spawn_unlinked(fn() {
      let router_monitor = process.monitor(router_pid)
      let socket_monitor = process.monitor(socket_pid)
      let exited =
        process.new_selector()
        |> process.select_specific_monitor(router_monitor, fn(_) {
          SocketOwnerRouterExited
        })
        |> process.select_specific_monitor(socket_monitor, fn(_) {
          SocketOwnerActorExited
        })
        |> process.selector_receive_forever
      case exited {
        SocketOwnerRouterExited -> process.kill(socket_pid)
        SocketOwnerActorExited -> Nil
      }
    })
  Nil
}
```

The guardian waits. If the router dies first, it kills the socket, blocked callback or not. If the socket dies first,
the guardian exits. It watches two exact PIDs and never looks anything up by name or socket ID, so a cleanup that runs
late can't kill a newer socket that reused the old one's ID. And because it's unlinked, a crash in the socket can't
travel through it to anything else.

A socket killed this way doesn't get its `Closed` callbacks. The router that would have handled them is already gone,
the presence actor cleans up through its own monitor, and the transport closes the WebSocket when it sees the router go
down. It costs one extra process and two monitors per connection, which is cheap on the BEAM.

## What survives what

The supervision tree today looks like this:

```text
beryl internal supervisor (one-for-one, 3 restarts / 5 seconds)
|- socket factory supervisor (Permanent)
|  `- socket actor (one per connection, Temporary)
|     `- topic worker supervisor (channel layer only)
|        `- topic worker (one per joined topic, Temporary)
|- router actor (Transient)
`- limiter supervisor (optional)
```

- If a topic worker dies, that topic closes and the client rejoins it.
- If a socket actor dies, that connection closes and the client reconnects.
- If the factory dies, every connection it owned closes. The router cleans up after them, and the replacement factory
  accepts new connections.
- If the router dies, every connection closes, the router restarts empty, and clients reconnect.
- If the internal supervisor sees three restarts in five seconds, it gives up and passes the failure to your
  application's supervisor.

The limiter is the exception, which is why it got [its own post][heirloom]. Its counts have to outlive a crash, so beryl
keeps them somewhere a crash can't reach.

Anything else that should survive belongs to your application. In the [Floodgate post][floodgate], the die keeps its
value when Bob closes his tab because the document actor holds it. Bob's socket only ever had his connection. The
[tutorial's][tutorial] live poll keeps its vote totals in a store actor for the same reason.

If you're building on beryl, that's the rule to plan around: put anything you can't afford to lose in a process you own,
and let the client rebuild the rest. The [supervision guide][supervision] covers shutdown order and restart limits in
more detail.

[beryl]: https://beryl.tylerbutler.com/
[heirloom]: /keeping-ets-tables-with-heirloom/
[elm]: /what-if-we-applied-the-elm-architecture-to-sockets/
[floodgate]: /fluid-framework-server-on-beryl/
[dispatch]: https://beryl.tylerbutler.com/guides/dispatch/
[channels]: https://beryl.tylerbutler.com/guides/channels/
[supervision]: https://beryl.tylerbutler.com/guides/supervision/
[tutorial]: https://beryl.tylerbutler.com/tutorial/
[gen_event]: https://www.erlang.org/doc/apps/stdlib/gen_event.html
[phoenix-channels]: https://hexdocs.pm/phoenix/channels.html
[phoenix-js]: https://hexdocs.pm/phoenix/js/
[factory]: https://hexdocs.pm/gleam_otp/gleam/otp/factory_supervisor.html
