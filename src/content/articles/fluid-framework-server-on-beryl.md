---
title: 'A Fluid Framework server in Gleam with beryl'
date: '2026-11-25T13:07:31-08:00'
slug: fluid-framework-server-on-beryl
tags:
- gleam
- beryl
- fluid
---

In [What if we applied the Elm Architecture to Web Sockets?](/what-if-we-applied-the-elm-architecture-to-sockets/), I
described beryl's socket API. Each socket has its own private state. You handle an input and return the next state, plus
effects that describe what should go out over the wire.

What I didn't mention there is that beryl was a side quest. The real goal was
[Floodgate](https://github.com/tylerbutler/floodgate), a Fluid Framework server written in Gleam.

I already had a Fluid server, [Levee](https://github.com/tylerbutler/levee), but it was split between Gleam and Elixir.
Floodgate replaces it with a stack that's Gleam all the way down. (My Fluid projects all get water names, and if you're
replacing a levee, you might as well open the floodgates.) I think the BEAM fits Fluid's needs particularly well, and
Gleam is a fun language to work with.

A Fluid server lives on real-time sockets, though, and when I started, I couldn't find a solid Gleam WebSocket library
with an abstraction I liked. So I wrote beryl.

That left me with something to prove. The live poll in my earlier post was fine for explaining the API, but it couldn't
show whether beryl could handle everything Floodgate needs without turning into a Fluid library. If beryl can't stay out
of Floodgate's way, it probably won't stay out of yours either.

Floodgate started out speaking Phoenix Channels. Levee is built on Elixir and Phoenix, so its driver already spoke that
protocol, and beryl is modeled on Phoenix Channels -- Phoenix framing is its native wire format. But I also wanted to
explore compatibility with Fluid's official driver, and that one speaks Socket.IO. Now a Socket.IO client and a Phoenix
Channels client can edit the same document on one Floodgate server.

Floodgate does all of this through beryl's public API. I supply a channel handler, give each connection the right codec,
and return actions for beryl to deliver. Sequencing and storage belong to Floodgate. The socket library never has to
learn what a Fluid document is.

(The code below is trimmed from the server and its tests. I've dropped the setup and renamed a few things so they read
better out of context.)

## A little Fluid background

[Fluid Framework](https://fluidframework.com/) is Microsoft's set of JavaScript and TypeScript libraries for building
applications with shared, editable state. You work with distributed data structures -- maps, collaborative text, a
structured tree -- and Fluid handles the operations that keep everyone's copy in sync (including the common case where
people edit at the same time).

The application code can look like an ordinary local mutation. Floodgate's simplest example is a shared die; clicking
Roll writes a number into a Fluid `SharedMap`:

```typescript
import type { ISharedMap } from "@fluidframework/map/legacy";

function rollDice(diceMap: ISharedMap): void {
  diceMap.set("diceValue", Math.floor(Math.random() * 6) + 1);
}
```

If Alice rolls a five, Fluid sends an operation (an *op*) that means "set `diceValue` to 5." When Bob's client receives
that op, it uses Alice's five. It doesn't roll the die again.

The service has three responsibilities:

1. **Sequencing**: put incoming ops in one order.
2. **Broadcasting**: send the ordered ops to every client.
3. **Storing**: keep the ops so clients can catch up later.

Fluid calls the first two together *total order broadcast*. Every client applies the ops in that one order, so their
data structures end up agreeing.

Suppose Bob rolls a two at about the same time. Each of them sees their own roll right away, before the server weighs
in. If Alice's roll gets sequence number 41 and Bob's gets 42, both screens show two once they've processed both ops.
The server doesn't need to know the rules of the game. It just needs to decide the order.

That's the role Floodgate plays. It also checks access and stores the ops and summaries that clients need to load a
document.

Here's the wrinkle. Alice uses the official driver for Routerlicious, Fluid's reference server, so she connects to
Floodgate over Socket.IO. Bob uses Levee's driver, which speaks Phoenix Channels. The two drivers frame their messages
differently, but they still have to agree on one sequence for the die.

## Let beryl handle the sockets

Floodgate uses beryl's channel layer rather than raw dispatch, which gets it topic routing and private, typed state for
each accepted join. A document makes a natural topic, so I register a handler for `document:*:*`, and Alice and Bob both
join `document:fluid:shared-die`.

Once the document session and presence handles exist, the setup looks like this:

```gleam
let socket_configuration =
  beryl.config(wire.phoenix_codec())
  |> beryl.with_pubsub(publish_subscribe_handle)
  |> beryl.with_max_inbound_frame_bytes(maximum_frame_bytes)

let assert Ok(#(sockets, socket_child_specification)) =
  channel.child_spec(socket_configuration, handlers: [
    document_channel.new(
      document_session,
      document_registration,
      presence_worker.from_name(presence_worker_name),
      maximum_frame_bytes,
    ),
  ])
```

`document_channel.new` is Floodgate code; it returns a handler built with beryl's channel API. `channel.child_spec`
hands back a socket handle and a child spec that slots into Floodgate's OTP supervision tree. beryl's processes are
supervised like the rest of the application -- there's no separate server to babysit.

The handler makes the Fluid decisions: is this token valid, and should this op be accepted? beryl runs the channel
workers and takes care of subscriptions and delivery. The handler's state stays typed, and no Fluid types leak into
beryl's socket registry.

The default codec is Phoenix framing, and the same `sockets` handle goes to both transports. Which brings us to codecs.

## A codec for each connection

Alice and Bob connect through different endpoints:

| Endpoint | Client |
|---|---|
| `/socket.io/` | Official Fluid/Routerlicious drivers |
| `/socket/websocket` | Phoenix Channels clients, including `levee-driver` |

Bob's side is easy. The stock `beryl_mist` adapter inherits the runtime's codec, Phoenix V2 JSON framing. Alice's side
takes more work. Floodgate handles the Socket.IO handshake and pings itself, and it uses
[Dewdrop](https://github.com/tylerbutler/dewdrop) to translate Fluid events to and from beryl's channel format.

beryl's shared transport API does the rest. It enforces connection limits, registers the connection, and processes
frames. (Keeping those limits in force when the limiter crashes turned into its own project. More on that in a future
post.) Floodgate passes the Dewdrop codec when it registers the connection:

```gleam
let #(connection_state, message_selector) =
  transport_server.init_connection(
    sockets: sockets,
    seed: transport_server.connect_seed(request, metadata),
    connection_permit: connection_permit,
    base_selector: message_selector,
    config: transport_configuration,
    force_close: fn() { force_close(connection) },
    logger_name: "floodgate.socketio",
    telemetry: telemetry,
    codec: Some(fluid_server_codec.server_codec()),
  )
```

(`transport_server` is `beryl/transport/server`, and `fluid_server_codec` is `dewdrop/server`.) Most of that call is
plumbing. The last argument is the one that matters for our two players: **the codec belongs to the connection**. Alice
gets Socket.IO framing, Bob gets Phoenix framing, and they share one runtime.

The codec has real translating to do. The Routerlicious driver sends ops with a `submitOp` event, passing the client ID
and the op batches as separate arguments. Dewdrop folds those into one payload with named fields. It also works out the
document topic from the connection request and turns `connect_document` into a beryl join.

After decoding, both clients reach the same application handler:

```text
Alice: Socket.IO                 Bob: Phoenix Channels
        |                               |
  Dewdrop codec                    Phoenix codec
        |                               |
        +--------- beryl ---------------+
                      |
              document channel
                      |
            shared document actor
                      |
                    storage
```

The drivers don't even connect the same way. Alice's Routerlicious driver sends the full document connection request as
part of the join. Bob's Phoenix driver joins with just a token, then sends `connect_document` afterward.

This is where beryl's private channel state earns its keep. I pick its Gleam type, and beryl keeps a separate value on
the server for each accepted join. Bob's state comes back to my handler with his next message. It never goes to Bob's
browser, and Alice's channel can't see it, even though they're editing the same die.

Once Floodgate checks Bob's token, his channel state records that his document connection is still pending, and
Floodgate rejects his ops until `connect_document` succeeds. Alice reaches the same connected state during her join.
Both paths go through the same document connection function, so the codec doesn't have to keep track of where either
driver is.

## One action, two clients

Alice clicks Roll. Her Fluid runtime creates an operation, Dewdrop decodes the message, and beryl routes it to her
document channel.

Floodgate checks Alice's connection and hands her op to the document actor. Both players' channels talk to the same
actor, even if they opened the document at the same moment -- Floodgate's registry starts exactly one actor per
document. That actor reads one request at a time from its mailbox. For each accepted op, it bumps the document's
sequence number by one and stores the numbered op before replying. Alice gets 41 because the actor handled her roll when
the count was 40. Whose mouse clicked first doesn't enter into it.

Alice's channel gets the numbered op back and can return this action:

```gleam
channel.broadcast(
  events.op,
  json.preprocessed_array([
    session.stored_message_to_json(#(sequence_number, message)),
  ]),
)
```

`submitOp` was the driver asking for the edit to be sequenced. `op` is Floodgate's answer: the edit plus its sequence
number.

That call just builds an action for the channel to return. beryl finds the subscribers and encodes the event with each
recipient's codec. Alice gets a Socket.IO event. Bob gets a Phoenix frame. Neither of them knows the other one speaks a
different protocol.

There's no special case for Bob's protocol anywhere in the op handler, and the handler never touches his WebSocket. It
returns state and actions, Elm Architecture style, and beryl applies the actions in order for that channel.

Notice that `channel.broadcast` doesn't take a topic. Alice's handler can't send her roll to the wrong document because
of a typo. If I really wanted to broadcast somewhere else, I'd have to reach for `beryl.broadcast` and name the topic
explicitly. (This is the restriction I said I came around to last time. Here's a concrete case for it.)

The callback isn't pure, I'll admit. It verifies tokens and calls shared actors. But everything it wants to send to
clients comes back as a list of actions I can read, and that's the part I care about.

One actor per document is also why, for now, Alice and Bob need to be on the same Floodgate instance. Each instance has
its own actor registry and, by default, its own storage. If two instances both accepted rolls for the same die, they
could both hand out 41, and broadcasting both rolls wouldn't tell anyone which came first. beryl can already broadcast
and track presence across BEAM nodes, but Floodgate doesn't coordinate document edits across nodes yet.

## The server can send messages, too

Not everything Floodgate sends is a reply. A presence worker needs to give Bob the current roster. A targeted signal
needs to reach exactly one document connection.

beryl gives each accepted join a typed sender. I can hang on to that sender and call `channel.notify` from another
process to deliver a value to the join's `on_info` callback. Floodgate's notification type looks like this:

```gleam
pub type DocumentNotification {
  SignalPush(payload: json.Json)
  EventPush(event: String, payload: json.Json)
}
```

And the callback turns the notification into an action:

```gleam
channel.accept(channel_state)
|> channel.on_info(fn(state, notification) {
  case notification {
    SignalPush(payload) ->
      channel.next(state, [channel.push(events.signal, payload)])
    EventPush(event, payload) ->
      channel.next(state, [channel.push(event, payload)])
  }
})
```

The presence worker sends a plain Floodgate value and doesn't care how Bob connected. The compiler checks every message
this callback handles. (Incoming JSON from clients still needs runtime validation -- types only get you so far.) beryl
also keeps each sender bound to the join that created it, so a stale sender can't start talking to a later join of the
same topic.

From Bob's side, a roster update or signal arrives on the same connection as his ops. On the server, it goes through the
same state-and-actions loop. That's what channels give me that a thin frame-sending wrapper couldn't: typed application
messages and lifecycle callbacks, not just delivery.

## Bob closes the tab

Eventually Bob gets bored and closes the tab. Alice should stop seeing him in the audience, but the die should keep its
value.

Floodgate's membership and presence cleanup lives in `channel.on_terminate`, which beryl calls when the channel ends. If
Bob's connection goes half-open instead of closing cleanly (thanks, hotel Wi-Fi), heartbeat eviction eventually lands in
the same callback.

The socket library notices the loss; the application decides what it means. Floodgate removes Bob's membership and, if
he was a writer, sequences a leave op. That's not just about the audience list. Every writer reports how far through the
op history it has read, and the lowest of those positions is the document's minimum sequence number. Every connected
writer has seen every op up to that number, so clients can drop the extra bookkeeping they keep for older ops. If Bob's
stale position stuck around, the minimum would stop moving, and that bookkeeping would pile up indefinitely.

The stored history belongs to the document, so Bob leaving doesn't delete it. Someone can open the document later, load
a stored summary, and replay the ops that came after it.

And there's no separate cleanup path for Socket.IO and Phoenix. Both transports go through beryl's lifecycle, so one
callback handles the document work for both.

## Checking the claim

Two endpoints answering connections would be a weak test of this design. They could still be maintaining separate
document state, which would be an unfortunate discovery after publishing a post about sharing it.

The [cross-mode
tests](https://github.com/tylerbutler/floodgate/blob/main/client/test/conformance/floodgate-phoenix.test.ts) connect
both drivers to one document. Once they're connected, the core assertion is small:

```typescript
const marker = `cross-${Date.now()}`;
const receivedOperation = waitForOperation(
  routerliciousConnection,
  (contents) => contents === marker,
);

submitOperation(phoenixConnection, marker);
await expect(receivedOperation).resolves.toBe(marker);
```

That sends an op through Phoenix and waits for the Routerlicious client to receive it. Another test goes the other
direction. Same channel handler, same document state, two different codecs.

There are Gleam tests for the channel lifecycle too, including heartbeat eviction and presence cleanup. But the
cross-mode tests use the real drivers, and that's where a plausible-looking frame has to agree with someone else's idea
of the protocol.

## What's next

The poll in the last post was a tidy little example of the state-transition loop. Floodgate gives the same loop a lot
more to do -- two wire protocols, server-originated messages, cleanup that changes shared state -- and all of it fits
through beryl's public API. That means I can keep chasing Fluid compatibility in Floodgate without turning beryl into a
Fluid library, which is what I set out to prove.

There's plenty left to do. Floodgate only sequences a document on one node today. If you want to poke at Floodgate, the
[README](https://github.com/tylerbutler/floodgate#readme) covers running it locally or in Docker. And if you're building
something real-time in Gleam, give [beryl](https://beryl.tylerbutler.com) a look and let me know whether it stays out of
your way.
