---
title: 'Phoenix Channels in a Cloudflare Durable Object'
date: '2026-11-25T18:35:00-08:00'
slug: phoenix-channels-and-cloudflare-durable-objects
draft: true
tags:
- gleam
- beryl
---

In my post about [bundling Gleam dependencies with trellis](/bundling-gleam-dependencies-with-trellis/), I mentioned
that I'd split beryl's protocol state machine into its own package so I could find out whether something beryl-like
could run on Cloudflare Durable Objects. Spoiler alert: it can, and this is that future post.

I had a specific reason to want that. I've been building an outdoor multiplayer game for phones, and it runs on
Cloudflare. Each match is a Durable Object, and every phone in the match keeps a WebSocket open to it.

The game's connections used my own protocol. The first frame authenticated, the client backed off and reconnected when
the socket dropped, and it retried commands that never got an answer. There was no heartbeat, so the server couldn't
tell a quiet phone from one that had silently dropped off the network. And all of it was a second copy of rules beryl
already handled: joins, replies, heartbeats, and what to do with stale messages after a reconnect.

I wanted the game to speak Phoenix Channels instead. Then the phones could use the official Phoenix JavaScript client,
which handles refs, rejoins, and reconnect backoff for me, and the server could use beryl's rules. The catch is that
beryl is built out of OTP actors and supervisors, and a Cloudflare Worker has neither.

So I pulled out the part that doesn't need them. `beryl_protocol` is beryl's channel lifecycle with the I/O taken out,
and it compiles to both Erlang and JavaScript. Before wiring it into the game, I built a small example in the beryl repo
that hosts it in a Durable Object: [`portable_channels`][example]. It's a counter instead of a game, which makes it a
lot easier to talk about.

(I've trimmed the code below from the example, mostly by dropping error handling and a few branches.)

## Durable Objects 101

A Durable Object is an instance of a JavaScript class that Cloudflare runs for you. You address it by name, and every
request for that name reaches the same instance, wherever Cloudflare decided to put it. Each instance gets its own
storage, which in this example is SQLite-backed. If you read the [Floodgate post][floodgate], it's the same idea as one
actor per document: one owner for each piece of shared state.

In the example, the match code in the URL picks the object:

```text
/matches/demo/socket/websocket
        → MATCHES.getByName("demo")
        → Match Durable Object
        → channel topic "match:demo"
```

The object only lets a socket join the topic for its own match, so a connection to `demo` can't wander into
`match:other`.

Durable Objects get interesting for sockets because of hibernation. If a match goes quiet, Cloudflare can evict the
object from memory but keep its WebSockets connected, so you aren't paying for an idle object to sit around. The next
message makes Cloudflare construct a brand-new instance and hand it the sockets. Anything you kept in an instance field
is gone.

In the [Heirloom post][heirloom], losing in-memory state was something that happened when beryl's connection limiter
crashed. On Cloudflare, it happens every time a match gets quiet.

## A protocol that doesn't do anything

`beryl_protocol` is a pure Gleam state machine. It doesn't read the clock, write to a socket, check a token, or call
application code. You give it the current state, an input, and the time. It gives back the next state and a list of
actions to carry out in order. If that sounds familiar, it's the same loop as beryl's [socket API][elm], one level
further down. beryl's BEAM runtime runs its channel lifecycle through the same core now, so the Durable Object and the
BEAM follow one set of rules.

The example's Gleam bridge sits between the core and the wire. It decodes Phoenix frames with
[Roost](https://github.com/tylerbutler/roost), my Gleam library for the Phoenix wire format, and turns them into
protocol inputs:

```gleam
let decoded = case incoming.event, incoming.topic {
  "phx_join", _ ->
    protocol.Join(incoming.topic, incoming.payload, incoming.join_ref, incoming.ref)
  "phx_leave", _ ->
    protocol.Leave(incoming.topic, incoming.join_ref, incoming.ref)
  "heartbeat", "phoenix" -> protocol.Heartbeat(incoming.ref)
  event, topic ->
    protocol.Message(topic, event, incoming.payload, incoming.join_ref, incoming.ref)
}
```

Going the other way, the bridge turns the core's actions into a short list of things the worker knows how to do, like
"send this frame" or "authorize this join." The worker is a loop over that list:

```js
async apply(socket, result) {
  const transition = unwrap(result);
  const session = this.sessions.get(socket);
  session.state = transition.state;
  this.checkpoint(socket);
  for (const action of transition.actions) {
    if (action instanceof bridge.SendText) {
      socket.send(action.data);
    } else if (action instanceof bridge.Authorize) {
      await this.authorize(socket, action);
    } else if (action instanceof bridge.Deliver) {
      await this.deliver(socket, action);
    }
    // ...binary sends, cleanup, disconnects, and scheduling
  }
}
```

The worker makes the application decisions, and the core keeps track of whose turn it is. An `Authorize` action comes
with an operation handle, and the worker hands that handle back with its answer, `join_accepted` or `join_rejected`.
Replies work the same way. Each handle's type says what kind of operation it's for, so the compiler won't let me answer
a join with a reply handle.

Each join also starts a new channel *generation*. When a rejoin replaces a channel, handles from the old generation go
stale, and using one does nothing. Only the handle completes an operation. The client's `ref` and `join_ref` just label
the reply, so a client that reuses one can't finish someone else's operation.

## Joining a match

On the client, it's the stock `phoenix` package:

```js
import { Socket } from "phoenix";

const socket = new Socket("ws://localhost:8787/matches/demo/socket");
const channel = socket.channel("match:demo", { token: "<your local JOIN_TOKEN>" });

channel.on("snapshot", (snapshot) => console.log(snapshot));
socket.connect();
channel.join().receive("ok", ({ snapshot }) => console.log(snapshot));
channel
  .push("increment", { command_id: crypto.randomUUID() })
  .receive("ok", (game) => console.log(game));
```

`Socket` takes the endpoint ending in `/socket`, and Phoenix adds `/websocket` when it connects. If you connect with a
raw WebSocket, use the full path.

Credentials go in the join payload, and the worker refuses the connection if you put a token in the URL. The token check
itself is a placeholder. It compares against one shared `JOIN_TOKEN` and makes everyone the same principal, `demo`. A
real app needs to validate a real credential and work out who the user is.

A successful join adds the player to the stored roster and replies with a snapshot of the game. Heartbeats get answered
on the `phoenix` topic with the client's original `ref`. That matters, because the Phoenix client closes the socket and
reconnects if a heartbeat goes unanswered.

## Waking up with amnesia

The object can vanish between any two messages, so the worker saves protocol state before it runs an action list.
Cloudflare lets you attach a small serialized value to each hibernatable WebSocket, and the worker stores the core's
exported state there, along with a format version, the match code, the principal, and when it saved. No credentials or
callbacks go in. The worker caps the attachment at 16,000 bytes, a little under Cloudflare's 16 KiB limit.

The constructor of a new instance walks the connected sockets and restores each one:

```js
for (const socket of ctx.getWebSockets()) {
  const attachment = socket.deserializeAttachment();
  const now = Date.now();
  // ...validate the attachment, or close with "Reconnect required"
  this.sessions.set(socket, { principal: attachment.principal });
  await this.apply(
    socket,
    bridge.restore(attachment.protocol, now, now - attachment.savedAt),
  );
}
```

That brings back channel membership, channel generations, and the bookkeeping that matches replies to requests. The
elapsed time matters too. A heartbeat deadline keeps counting while the object sleeps, and `restore` moves the deadlines
onto the new instance's clock rather than comparing timestamps from two different runtimes. The object keeps one alarm
set for its earliest deadline. A heartbeat pushes its connection's deadline 60 seconds out -- application messages
don't. So if a phone stops sending heartbeats while the match is hibernating, it still gets dropped on time.

Some things can't come back. If the old instance had work in flight that the new one can't finish, the core asks the
client to rejoin, which means authorizing again and getting a fresh snapshot. If an attachment doesn't validate, the
worker closes the socket and lets the Phoenix client reconnect.

## Counting to one

Phones lose replies. The app sends `increment`, the worker bumps the counter and replies, and the reply goes nowhere
because the player just walked behind a building. The client retries, and without some care, the counter goes up twice.

Phoenix refs can't help with that -- they only match a reply to a request on one connection. So each command includes
its own `command_id`, and the worker stores the new counter and a record of the command in one transaction:

```js
increment(principal, commandId) {
  return this.ctx.storage.transaction(async (storage) => {
    const key = `command:${principal}:${commandId}`;
    const previous = await storage.get(key);
    if (previous) return { response: previous, succeeded: true };
    // ...capacity and sanity checks
    const game = await storage.get("game");
    const next = { ...game, value: game.value + 1, revision: game.revision + 1 };
    await storage.put({ game: next, [key]: next });
    return { response: next, succeeded: true };
  });
}
```

A retry with the same ID gets the recorded answer back, whether it comes after a timeout, a reconnect, or a nap. If you
retry, reuse the original ID. A new ID counts as a new command.

That still isn't exactly-once delivery. The worker can commit a command and then lose the reply, and it's up to the
client to ask again. The example also keeps only 256 command records per match. Once it's full, it rejects new commands
rather than forget old ones. A real app needs its own retention policy.

## What the counter leaves out

It's a counter, so it skips a lot:

- Increments go back to the sender only. Nobody else in the match hears about them.
- Leaving the channel doesn't take you off the roster, so the roster isn't presence.
- You get one channel per connection and no long-polling fallback.
- beryl's PubSub, presence, and supervision still exist only on the BEAM.

My game handles its own broadcasts and rules in its worker code. `beryl_protocol` handles the channel lifecycle and
nothing else.

## Testing it

The example's tests run in Cloudflare's local runtime with real hibernatable WebSockets and the official Phoenix client.
They force the object out of memory so the restore path runs, and they cover join ordering, rejected joins, heartbeat
refs, lost replies, and heartbeats that expire mid-nap. You don't need a Cloudflare account. Roost's framing gets
checked against a shared set of Phoenix fixtures, and the protocol core's own tests run on both Erlang and JavaScript.

The game's matches run on this same setup now: Roost and `beryl_protocol` in the Durable Object, the stock Phoenix
client on the phones, and none of my homemade protocol. If you have a frontend that already speaks Phoenix Channels and
you're curious about Cloudflare, the [example][example] is a decent place to start. Let me know how it goes.

[example]: https://github.com/tylerbutler/beryl/tree/main/examples/portable_channels
[floodgate]: /fluid-framework-server-on-beryl/#one-action-two-clients
[heirloom]: /keeping-ets-tables-with-heirloom/
[elm]: /what-if-we-applied-the-elm-architecture-to-sockets/
