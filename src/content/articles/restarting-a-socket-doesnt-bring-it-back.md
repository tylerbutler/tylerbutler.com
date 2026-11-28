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
limiter. For the rest of beryl, losing state in a crash is fine. When a socket crashes, I *want* its state gone, and I
want the client to build a new one. Working out which process should own which state, and what should happen when one of
them dies, took a rewrite of beryl's runtime.

<!--more-->

"Let it crash" is the most famous advice in Erlang (for a lot of people, it's the only Erlang advice they know). When a
process hits something it doesn't expect, it dies, and its supervisor -- a process whose job is to start other processes
and restart them when they die -- starts a fresh copy. The fresh part is easy to skip past. A restarted process comes
back with its initial state, and for most processes, that's what you want. For a WebSocket connection, the initial state
is wrong.

I'll use the live poll from the [beryl tutorial][tutorial] as an example, since you may have played with it in [an
earlier post][elm]. Alice and Bob both join `poll:demo` and vote. Then something goes wrong on Alice's connection. Her
vote should still count, Bob shouldn't notice, and her browser should get back to a working connection without her
doing anything.

## One actor for everything

After the [Elm Architecture redesign][elm], each beryl instance ran one runtime actor. (An actor is a process with a
mailbox that handles one message at a time.) That actor held Alice's and Bob's socket models, the state of every channel
they'd joined, every reply they were waiting on, and every topic subscription. Your `init` and `update` callbacks ran
inside it.

That meant beryl couldn't let a callback crash. If Alice's message handler panicked, the actor would die and take Bob's
connection with it. So the runtime caught each panic and turned it into the smallest protocol failure it could:

| Panic in | What happened |
|---|---|
| raw `init` | refuse the socket |
| `join` | reject the join |
| a topic message | close that topic |
| `on_info` | close the whole socket |
| a close callback | log it and keep cleaning up |

This works, and OTP has a name for it: [`gen_event`][gen_event], where one manager process hosts several handlers and
drops whichever one fails. Most OTP code uses processes to keep failures apart instead, and so does Phoenix. [Phoenix
Channels][phoenix-channels] starts a process for each client and each topic it joins, and the process boundaries contain
the damage. beryl copied Phoenix's API and wire format, but on the server, it handled failures differently.

The shared actor had other costs, too. If Alice's callback was slow, Bob waited along with her. And the panic handling
became part of beryl's correctness, since a bug in the rescue code was a bug for every connection.

## Picking the boundaries

I wrote down four options:

1. Keep the shared actor.
2. One process per socket.
3. One process per socket, plus one per joined topic.
4. A new process for each callback.

I ruled out option 4 first. It would copy state into a short-lived process for every event and wait for the answer,
which drags in timeouts and cancellation, and the runtime would still have to decide whether a late answer counted.

beryl ended up with both 2 and 3, because it has two APIs, and each one puts state in a different place. With [raw
dispatch][dispatch], your state is one model for the whole socket, so each socket gets a process that holds its model
and runs the callbacks that change it. With [channels][channels], each joined topic has its own state and callbacks, so
each joined topic gets its own process too, the way Phoenix does it.

The poll uses channels, so Alice's connection now involves three processes:

- Her **socket actor** owns the protocol: which topics she's joined, the replies she's waiting on, heartbeats, presence,
  and the order of outgoing frames.
- A **topic worker** for `poll:demo` owns her channel state and runs its callbacks: `join`, `on_message`, `on_info`, and
  `on_terminate`.
- A **transport process** owns her WebSocket and writes the frames.

Above them sits the **router**, one actor for the whole beryl instance. It keeps the list of sockets and the topics each
one has joined, and it sends broadcasts out to them.

The poll's vote handler runs in the topic worker. This is trimmed from the tutorial, with one helper inlined:

```gleam
channel.accept(room)
|> channel.on_decoded_message(
  decode: poll.decode_command,
  handle: fn(room, command, reply) {
    case command {
      poll.Vote(choice) ->
        case store.vote(polls, room, choice) {
          Ok(state) -> {
            let #(event, payload) = encode_event(StateChanged(state))
            channel.next(room, [
              channel.reply_ok(reply, poll.to_json(state)),
              channel.broadcast_from(event, payload),
            ])
          }
          // ...
        }
      // ...
    }
  },
  on_error: handle_invalid_message,
)
```

The channel's state is `room`, the name of the poll. The application's `store` actor holds the vote totals. When Alice
votes, her worker asks the store to record the vote, replies to her with the new totals, and broadcasts them to everyone
else on the topic.

## What one mailbox gave me for free

With one actor reading one message at a time, every reply, push, and broadcast went out in the order the runtime
produced it, and I never had to think about it. Once the work moved into separate processes, I had to decide which
orderings beryl still promises. It comes down to two rules:

- Within one topic, the order of your actions is the order on the wire. If a handler returns a reply and then a push,
  Alice's browser sees them in that order.
- Between two topics on the same socket, beryl promises no order, because each topic's worker runs its callbacks on its
  own schedule.

Some failures changed with the split, too. An `on_info` panic used to close Alice's whole socket, and now it closes only
that topic. If her `poll:demo` worker stops unexpectedly, the runtime closes the topic with `phx_error` (Phoenix's error
event for a channel), and her browser has to rejoin. Phoenix handles it the same way, and for the same reason: beryl
can't run `on_terminate` without the channel state, and the state died with the worker.

The panic handling didn't go away, either. A raw dispatch socket is one process, and if a panic killed it, every topic on
the socket would close. So beryl still catches a panic in a topic message and closes only that topic. Channel workers
catch their panics too, and keep the state from before the panic so `on_terminate` has something to clean up. Processes
keep a crash on Alice's connection away from Bob, and inside a process, the rescue code decides whether Alice loses a
topic or her whole connection.

## Restart is not recovery

With sockets and topics in their own processes, the next step seemed clear: supervise them and restart them when they
crash. That's what supervisors are for.

Look at what Alice's socket actor holds, though:

- the application's model for her connection,
- the topics she has joined,
- replies it still owes her, each tied to a `ref` her browser is waiting on,
- heartbeat and rate-limit state,
- presence entries, and
- the functions it uses to write to and close her WebSocket.

A supervisor can restart the process, but it can't put any of that back. A new socket actor could run `init` again,
except `init` needs Alice's connection request and token. It would have to rejoin `poll:demo` too, and `join` needs the
payload her browser sent. Without a new handshake from her browser, a restart could:

- run authorization or accounting a second time,
- send duplicate join-time messages,
- hand out new refs while her browser still holds the old ones,
- start from default state that contradicts what the application already stored, or
- accept a topic she already left.

The protocol already has a way to rebuild all of this: the client reconnects, which runs `init`, and rejoins each topic,
which runs `join` with fresh references. The [Phoenix JavaScript client][phoenix-js] does both on its own, with backoff,
so beryl leaves the recovery to the client.

OTP gives every supervised process a restart policy. `Permanent` processes always restart, `Transient` ones restart only
after a crash, and `Temporary` ones never restart. beryl makes socket actors and topic workers `Temporary`, so when one
stops, its supervisor cleans up after it and leaves it stopped.

When Alice's `poll:demo` worker crashes, her browser rejoins the topic and can ask for the current totals with
`get_state`. Her vote is still there, because the store recorded it. The store also monitors each worker (a monitor gets
a message when the process it watches dies), so it cleans up Alice's old join even though `on_terminate` never ran.

## Then why supervise sockets at all?

A supervisor helps even when it never restarts anything. OTP tools can list its children, and it handles shutdown
timeouts and kills the processes that won't stop. So beryl starts socket actors from a shared [factory
supervisor][factory], a supervisor that starts children on demand from one template.

The catch is that `factory_supervisor.start_child` is synchronous. The factory waits for each child to finish starting
before it handles the next request, so every new connection on the node goes through one mailbox. If Alice's socket ran
`init` while it started and her `init` was slow, Bob's connection would wait behind it.

So beryl admits a connection in two steps. First, the factory starts the socket actor in a `Booting` phase, and the
actor returns without running any of your code. Then the transport hands the actor to the router, which checks the
request, starts monitoring the actor, adds it to its tables, and tells it to go. Only then does the actor run your `init`
and answer the transport. The factory waits only for the quick part, and `init` runs for many connections at once.

A `Booting` actor gives up after a deadline, too. If its transport dies before reaching the router, nothing else would
tell the actor to stop, and orphans would pile up under the factory.

I set a pass mark before I benchmarked this: the factory had to keep at least 90% of the old startup throughput. At
2,000 new connections per second, it kept up with the old design, and I couldn't measure a cost. That's one rate on one
shared machine, though, so it doesn't tell you anything about capacity.

## The guardian

A socket actor monitors the router, so if the router dies, the actor gets a `DOWN` message and stops. But an actor reads
its mailbox only between callbacks. If Bob's `update` is stuck in a slow call when the router dies, his socket actor
won't see the message. (Your `update` won't block. Someone's will.) The factory survives the router restart, so the
factory won't stop the stuck actor either, and when `update` finally returns, the actor belongs to a router that no
longer exists.

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

All the guardian does is wait for one of two processes to die. If the router goes first, the guardian kills the socket,
whether or not a callback is stuck. If the socket goes first, the guardian exits. It watches the two exact process IDs
and never looks anything up by name or socket ID, so a cleanup that runs late can't kill a newer socket that reused the
old one's ID.

The guardian is also unlinked. A link ties two processes together so that when one crashes, the other does too. Without
one, a crash in Bob's socket can't spread through the guardian to anything else.

A socket killed this way doesn't get its `Closed` callbacks, but the router that would have handled them is already
gone, the presence actor cleans up through its own monitor, and the transport closes the WebSocket when it sees the
router go down. The guardian costs one extra process and two monitors per connection, which is cheap on the BEAM. It's
the most boring process in beryl, and I'd like to keep it that way.

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
- If the factory dies, every connection it owned closes. The router cleans up after them, and a new factory starts
  accepting connections.
- If the router dies, every connection closes, the router restarts with no sockets, and clients reconnect.
- If the internal supervisor sees three restarts in five seconds, it gives up and passes the failure to your
  application's supervisor.

The limiter is the exception, which is why it got [its own post][heirloom]. Its counts survive a limiter crash, so a
restart doesn't open a window with no limits.

Anything else that should survive belongs to your application. Alice's vote survived because the poll's store held it,
and neither her socket nor her topic worker ever did. The die in the [Floodgate post][floodgate] keeps its value when
Bob closes his tab for the same reason: the document actor holds it.

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
