---
title: 'Keeping ETS tables through a crash with Heirloom'
date: '2026-11-24T16:05:19-08:00'
slug: keeping-ets-tables-with-heirloom
tags:
- gleam
- beryl
---

I've been building [beryl][] in [Gleam][] for a while now -- it's the socket library behind [Floodgate][floodgate], my
Fluid Framework server -- and it's turned into my crash course in OTP. One thing I keep running into is ETS. It stands
for *Erlang Term Storage*, a name that tells you approximately nothing about why you'd want it. I think of it as a fast,
in-memory key-value store that ships with the BEAM.

<!--more-->

You put tuples in a table and get them back out by key. Those tuples can hold any Erlang *term*, which is Erlang's word
for a value of any kind: a number, a string, a list, a map, even a process ID. With the default `set` table type,
inserts and lookups are constant-time, and lots of processes can read the same table at once. They can write to it too,
if you make the table public. The catch is that a table stays on one node. If you want the data somewhere else, you have
to send it there yourself.

## Every table has an owner

The process that creates an ETS table owns it. (That's a BEAM process, not an OS process. They're much lighter, and the
VM manages them.) When that process dies, the runtime deletes the table and everything in it. Other processes might
still hold a reference and want to keep using it. Doesn't matter.

That's usually fine, but in beryl, it presented a problem.

## Why beryl cares

beryl has a connection limiter. It's a single actor that decides whether a new socket connection gets in, and it tracks
three things:

- how many connections each IP has open,
- how many connections the whole system has open, and
- a token bucket per IP, so a client can't dodge the limits by disconnecting and reconnecting over and over.

The limiter runs under a supervisor, so if it crashes, the supervisor starts a new one. That's OTP doing its job. But
the new limiter starts with empty state. As far as it knows, nobody is connected and every IP has a full bucket.

Meanwhile, every connection the old limiter let in is still open. The totals are wrong, the per-IP counts are wrong, and
anyone who was being rate limited just got a fresh allowance. A crash in the limiter turns into a "no limits" window.
That's... not what you want from the thing that protects you from too many connections.

I couldn't rebuild the state from anywhere else, either. The limiter *was* the source of truth. I needed that state to
outlive the process.

## Enter the heir

Erlang already has an answer for this: when you create a table, you can name an **heir**. If the owner dies and the heir
is still alive, the runtime hands the table to the heir instead of deleting it. The heir also gets an `'ETS-TRANSFER'`
message, so it knows it just inherited something.

Here's how beryl uses it:

1. The limiter creates an ETS table and names a small checkpoint process as the heir.
2. Every time the limiter lets a connection in, it writes a copy of its state to the table.
3. If the limiter crashes, the heir inherits the table, and the data stays in memory.
4. The supervisor starts a new limiter. It finds the existing table and reads the last checkpoint. Connections that
   closed in the meantime give their slots back, and the new limiter monitors the ones that are still open, so it picks
   up where the old one left off.

This isn't the textbook version. Steve Vinoski describes that one in [Don't Lose Your ets Tables][vinoski], which (funny
enough) starts with a crash in code that tracked how much video each subscriber was streaming. That's a close cousin of
beryl's limiter. In his version, a manager process names itself as the heir and gives the table to the worker. When the
worker dies, the manager inherits the table, waits for the supervisor to start a new worker, and gives the table back
with [`ets:give_away/3`][give_away]. The worker owns the table whenever it's running, so the table can stay protected or
private.

beryl skips the handback. The heir keeps the table, and beryl makes the table public so the new limiter can read and
write it anyway. There's no handoff protocol to get wrong, and the new limiter never has to wait for the table to come
back. The cost is that any process on the node with a reference to the table could write to it. The table isn't named,
though, and Heirloom's handle is typed, so nothing outside beryl gets one by accident. (Code that goes looking could
still find it with `ets:all()`.) After the first crash, beryl's setup looks a lot like Vinoski's other suggestion, the
one he likes less: a simple process whose only job is to own the table.

The runtime only does the inheritance. The rest is up to you. The new limiter is just a new process with a new PID, and
the runtime has no idea it's replacing the old one, so beryl keeps a small registry the new limiter uses to find the
table. That registry is a `persistent_term` entry, which is a global variable by another name. Vinoski's complaint about
the simple-owner approach is that the table's name becomes a global variable, so I haven't really escaped that. I've
just made it harder to trip over.

The heir also has to survive the crash it's supposed to protect against. beryl's heir isn't linked to the limiter, so it
doesn't go down with it. It watches beryl's supervisor instead, and cleans up when beryl shuts down.

And this is all in memory. If the node goes down, the table goes with it. For connection counts, I'm OK with that: the
connections die with the node, too.

## Heirloom

Gleam's standard library doesn't wrap ETS. There are plenty of Gleam ETS packages ([bravo][], [carpenter][], and several
others), but none that I found lets you name an heir, and none gives you a typed way to receive `'ETS-TRANSFER'`. I
didn't want beryl full of untyped FFI calls, so I wrote **Heirloom** (an heir inherits an heirloom, and yes, I am very
proud of this name). It's a small Gleam package with typed table handles, heir configuration, ownership transfers, and a
way to receive `'ETS-TRANSFER'` messages through a normal Gleam process selector.

Here's roughly how the limiter creates its table:

```gleam
import beryl_heirloom as heirloom

let spec =
  heirloom.spec("beryl_connection_limit_state", heirloom.Set)
  |> heirloom.with_access(heirloom.Public)
  |> heirloom.with_heir(heir_pid, store_key)

let assert Ok(table) = heirloom.create(spec)
```

The table's type is `heirloom.Table(String, State)`, so the compiler checks what goes in and what comes out. ETS itself
doesn't care what you put in a table. Heirloom does.

Heirloom gives you the pieces, but it doesn't decide how your app recovers. It won't start an heir for you or tell you
what to do with a table after it moves. beryl owns those decisions, and I think that's the right split.

Heirloom is in the beryl repo as [`beryl_heirloom`][Heirloom], and it ships bundled with beryl rather than on its own.
It doesn't depend on beryl, though. If you have a process that shouldn't lose its table when it crashes, take a look.

[Gleam]: https://gleam.run/
[beryl]: https://beryl.tylerbutler.com/
[floodgate]: /fluid-framework-server-on-beryl/
[bravo]: https://hex.pm/packages/bravo
[carpenter]: https://hex.pm/packages/carpenter
[Heirloom]: https://github.com/tylerbutler/beryl/tree/main/packages/beryl_heirloom
[give_away]: https://www.erlang.org/doc/apps/stdlib/ets.html#give_away/3
[vinoski]: https://steve.vinoski.net/blog/2011/03/23/dont-lose-your-ets-tables/
