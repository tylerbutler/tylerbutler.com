# Phoenix Channels and Cloudflare Durable Objects

You have a frontend that uses Phoenix Channels. It joins a topic, pushes commands, and handles replies through the Phoenix JavaScript client. To host that interaction on Cloudflare Durable Objects, you need a server that understands those channel messages, plus application code that fits the Durable Object runtime.

Beryl’s `portable_channels` example provides that server for a small match application. You can connect the official Phoenix client, join `match:demo`, and increment a counter that the host stores in a Durable Object. The client keeps its channel API. On the server, Gleam code handles channel lifecycle transitions, Roost handles Phoenix framing, and a JavaScript worker handles Cloudflare I/O and application state.

This demonstrates a compatible WebSocket endpoint for the example’s events. You still need to implement the events and policies that your own application expects. Cloudflare supplies the hosting platform; the example supplies the channel protocol integration.

## One match, one object

The worker routes connections through a concrete path:

```text
/matches/demo/socket/websocket
        → MATCHES.getByName("demo")
        → Match Durable Object
        → channel topic "match:demo"
```

The route accepts match codes with 1–32 letters, digits, underscores, or hyphens. The worker uses that code to select a named object. Inside the object, the host checks the channel topic against the match code. A connection to the `demo` object cannot join an unrelated match topic.

Each object owns its match’s counter, revision, roster, and command records. It also keeps a separate protocol state for each WebSocket. The bridge permits one channel per connection. Multiple connections for the same match share the application storage, but each connection has its own joins, references, and deadlines.

The Wrangler configuration binds `MATCHES` to the `Match` class and includes a migration for a SQLite-backed Durable Object. The example compiles Gleam to JavaScript and imports that output from `worker.mjs`. Its configuration describes a deployment target; the source does not establish a public deployment URL or measured capacity.

## Keep the Phoenix client

The README uses the official `phoenix` package. This adaptation waits for a successful join before sending the counter command:

```js
import { Socket } from "phoenix";

const socket = new Socket("ws://localhost:8787/matches/demo/socket");
const channel = socket.channel("match:demo", {
  token: "<your local JOIN_TOKEN>",
});
const command = { command_id: crypto.randomUUID() };

channel.on("snapshot", (snapshot) => console.log(snapshot));
socket.connect();
channel.join().receive("ok", ({ snapshot }) => {
  console.log(snapshot);
  channel.push("increment", command)
    .receive("ok", (updated) => console.log(updated));
});
```

The `Socket` constructor takes the base endpoint ending in `/socket`. Phoenix appends `/websocket` when it connects. A direct WebSocket client must use the full suffixed path. For a deployed host, use its actual secure WebSocket endpoint with the same route structure.

Keep credentials in the join payload. The worker accepts only `vsn` as a query parameter, so adding a token through socket URL parameters produces a rejection. The example compares the join token with `JOIN_TOKEN` and assigns the fixed principal `demo`. Production code needs credential validation that derives a user identity, plus authorization rules for that user.

The browser example uses the client’s normal WebSocket transport. Integration tests replace network dialing with `WorkerTransport` to connect inside Cloudflare’s local test runtime. They retain Phoenix’s serializer and channel implementation. You do not need that test transport in your frontend. The host implements WebSocket upgrades, with no long-poll endpoint.

## Separate the protocol from the host

Beryl’s portable component is `beryl_protocol`, a pure Gleam state machine that supports Erlang and JavaScript. Beryl’s BEAM runtime imports the same core. A host supplies connection identity, time, decoded messages, and completion results. The core returns new state and ordered actions.

In this example, Roost decodes Phoenix text frames and binary client pushes. The bridge maps `phx_join`, `phx_leave`, application messages, and Phoenix heartbeats into protocol inputs. It converts the resulting actions into authorization requests, application delivery, cleanup, socket sends, and deadline scheduling. The worker executes those actions and returns completion results to the core.

On a successful join, the host updates the roster and returns an authoritative snapshot. It sends the `phx_reply` before the initial `snapshot` event. An `increment` push receives an `ok` reply with the new state; invalid commands receive an `error` reply. Heartbeats receive replies on the `phoenix` topic with the original client reference.

The core tracks channel generations and single-use operation handles. The host returns those handles when it completes authorization or a reply. Client-supplied `ref` and `join_ref` values support wire correlation; they do not grant authority to complete a different operation.

The demonstrated reuse covers channel lifecycle logic. The counter, storage transactions, and authorization code remain in the Cloudflare worker. The example does not demonstrate moving a complete application between BEAM and JavaScript unchanged.

It also does not broadcast counter updates to every connected client. The host sends the initial snapshot to the joining socket and command replies to the sender. You would need to add fan-out, subscriber selection, and cross-object coordination for an application that requires them.

## Recover connections and retry commands

The worker uses Cloudflare’s hibernation WebSocket API. Cloudflare can remove an idle object from memory while keeping its WebSocket clients connected. An incoming event causes Cloudflare to construct the object again, so the host must restore connection state.

Before executing protocol actions, the example checkpoints state in each socket’s attachment. On reconstruction, it restores membership, generations, and correlation state, then accounts for elapsed time. It excludes credentials and callbacks from attachments. Unrecoverable pending application work requires an authorized rejoin; invalid attachments require a reconnect.

The host schedules one alarm for the earliest connection deadline. Heartbeats refresh a connection’s 60-second deadline. Application messages do not. Channel leave and disconnect do not remove the principal from the persistent roster, so that roster does not represent online presence.

For mutations, the host stores the updated counter and a record keyed by principal and `command_id` in one transaction. A retry with the same ID returns the recorded response. If you retry after a timeout, keep the original ID rather than generating another one.

This protects the counter against duplicate retries within the retained records. It does not guarantee exactly-once delivery: the host can commit a command and lose its reply. The example retains up to 256 command records per match and rejects new mutations at capacity. Your application must choose its own retention policy.

## Use the demonstrated boundary

The source includes tests for join ordering, unauthorized joins, heartbeat references, eviction recovery, and retries after lost replies. Framing tests cover shared Phoenix fixtures and binary headers. That evidence supports the example’s protocol integration, not full Phoenix server feature parity or arbitrary serializers. The counter application exchanges JSON responses; binary codec coverage does not establish a binary application API.

You can keep a Phoenix-speaking frontend and implement its server events in a Durable Object host. You also reuse Beryl’s channel lifecycle core across runtimes. Authentication, fan-out, presence, and storage policy still require application-specific work. Start with the example’s match boundary and check each event your frontend needs against the host you plan to build.

## Source notes

Inspected read-only at Beryl revision [`5337faba77529c40361bc80e2167fc0c638d1a94`](https://github.com/tylerbutler/beryl/commit/5337faba77529c40361bc80e2167fc0c638d1a94), with a clean working tree. No scripts, builds, tests, or deployments ran for this draft. Test descriptions above report assertions present in source, not a fresh passing run.

- [Example README and client setup](https://github.com/tylerbutler/beryl/blob/5337faba77529c40361bc80e2167fc0c638d1a94/examples/portable_channels/README.md). Code above adapts this setup using APIs also present in the host tests.
- [Worker routing, application storage, and recovery](https://github.com/tylerbutler/beryl/blob/5337faba77529c40361bc80e2167fc0c638d1a94/examples/portable_channels/worker.mjs); configuration: `examples/portable_channels/wrangler.jsonc`.
- [Portable bridge](https://github.com/tylerbutler/beryl/blob/5337faba77529c40361bc80e2167fc0c638d1a94/examples/portable_channels/src/portable_channels.gleam); framing: `examples/portable_channels/src/portable_channels/phoenix.gleam`.
- [Host integration tests](https://github.com/tylerbutler/beryl/blob/5337faba77529c40361bc80e2167fc0c638d1a94/examples/portable_channels/test/host.test.mjs); framing tests: `examples/portable_channels/test/phoenix_test.gleam`.
- [Portable host guide and runtime boundaries](https://github.com/tylerbutler/beryl/blob/5337faba77529c40361bc80e2167fc0c638d1a94/website/src/content/docs/guides/portable-host.md); shared-core imports: `packages/beryl/src/beryl/runtime.gleam`.
- [Cloudflare WebSocket and hibernation documentation](https://developers.cloudflare.com/durable-objects/best-practices/websockets/), consulted November 24, 2026.
