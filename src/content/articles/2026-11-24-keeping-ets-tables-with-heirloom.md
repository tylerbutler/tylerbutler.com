---
title: 'Keeping ETS tables through a crash with Heirloom'
date: '2026-11-24T16:05:19-08:00'
slug: keeping-ets-tables-with-heirloom
---

I've been exploring OTP through [Gleam][], and one of the things I've found interesting is ETS. That stands for
*Erlang Term Storage*, which doesn't tell me much about why I'd want to use it. I think of it as a fast, in-memory
store for Erlang values.

<!--more-->

You store tuples in an ETS table, and those tuples can contain Erlang terms: numbers, strings, maps, or more complex
values. With the default `set` table type, you get constant-time inserts and lookups. You can also let several
processes access the same table, subject to its access settings.

Those processes run inside the Erlang virtual machine, the BEAM. They're lightweight runtime processes, rather than
OS processes. An Erlang node is an instance of that runtime, and you can only access an ETS table from processes on
the same node. If you want data on another node, you need to arrange that communication yourself. ETS doesn't
replicate it for you.

So far, so useful. But there's an ownership detail that made me stop and think.

## The process that owns the table

When you create an ETS table, the calling process owns it. By default, when that process exits, the runtime deletes
the table, including its data. Other processes might still want to use it, but that doesn't keep it around.

Suppose I have a process that owns a table, and I use a supervisor to restart that process if it crashes. The
supervisor can start a replacement process, but by then I've lost the table. I have to create a new one and restore
whatever data I need.

I'd rather keep the existing table. The process crashed; that doesn't mean I want to throw away everything it
stored.

I wanted a second process that could take ownership while the supervisor restarted the first one, then give
the table to the replacement. I wouldn't need to reload the data because I'd still have it in memory.

Erlang has a mechanism for this: **ETS heirs**.

## Inheriting a table

You can designate another local process as a table's heir. If the owner exits while the heir is alive, the runtime
transfers ownership to the heir instead of deleting the table. With the `heir` option that includes transfer data,
the heir also receives an `ETS-TRANSFER` message.

Then, when the supervisor starts a replacement worker, that worker can ask the heir for the table. The heir calls
[`ets:give_away/3`][give_away] to transfer ownership to the new worker.

The runtime handles the inheritance, but I have to write the request and handback logic. The replacement worker is a
new process with a new process ID; the runtime doesn't know that I intend it to take over the old worker's job.

I also need to arrange supervision so the heir survives the worker's crash. If I restart both processes and lose the
table along the way, I haven't gained much.

This protects the table through an owner-process crash. If the whole Erlang node stops, I still lose the in-memory
data. For recovery across node restarts, I need disk storage or another copy elsewhere.

## Heirloom

I created Heirloom to make these ETS operations easier to use from Gleam. In the [beryl][] workspace, the package and
module name is [`beryl_heirloom`][Heirloom]. It provides typed table handles, heir configuration, and ownership
transfers, including a way to receive transfer messages through a Gleam process selector.

The distinction matters: Heirloom gives me the operations to implement recovery. It doesn't start an heir process or
decide how my application should recover. I still own those decisions.

That's the part of ETS I wanted to explore. I can let a supervisor replace a failed worker and keep the worker's
table in memory while it does so. With Heirloom, I can work with that ownership model from Gleam.

[Gleam]: https://gleam.run/
[beryl]: https://beryl.tylerbutler.com/
[Heirloom]: https://github.com/tylerbutler/beryl/tree/main/packages/beryl_heirloom
[give_away]: https://www.erlang.org/doc/apps/stdlib/ets.html#give_away/3
