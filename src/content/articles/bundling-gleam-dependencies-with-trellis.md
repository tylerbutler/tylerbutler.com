---

title: 'Bundling Gleam dependencies with trellis 1.1'
date: '2026-10-31T15:13:00-07:00'
slug: bundling-gleam-dependencies-with-trellis
tags:
- gleam
- trellis
- beryl

---

[Beryl](https://beryl.tylerbutler.com/) is my library for type-safe channels over websockets. I eventually want to
publish it to Hex so that others can find and use it with as little friction as possible. Beryl as a whole targets
the Erlang runtime, because it has hard dependencies on the BEAM infrastructure and is primarily a server-side library.

However, there is a piece of the beryl runtime that can target both JavaScript and Erlang -- the state machine of the
core protocol. I wanted to break that piece out so that I could find out whether a beryl-like runtime could run on
Cloudflare Durable Objects. Spoiler alert: it can, but more on that in a future post.

I broke out the core state machine into its own package, `beryl_protocol`, which you can think of as the pure rules for
a connection. It tracks things like: *Has this client joined this topic? Is a join still waiting for approval? Can this
reply still be sent? Has the connection timed out?*

The application ultimately decides what messages mean -- *send a chat message*, *update a document*, *cast a vote*. The
surrounding beryl runtime does the actual work: calls your code, sends data, and manages processes. All of that code
remains in the `beryl` package, which is tightly coupled to the BEAM.

This separation presented a decision, though. What should I do with the `beryl_protocol` package when it comes time to
publish to Hex? Right now, with [Git-only releases](/git-only-releases-with-trellis/), consumers can just use `beryl` directly without knowing that
`beryl_protocol` exists. It is an implementation detail of how the code is structured, not something users should think
about.

I could publish `beryl_protocol` as a separate library. Maybe someone else would use it! (Hubris!) But I don’t want to
create a separate release just because I found a useful separation within my project. Packages such as `beryl_mist` and
`beryl_ewe` give users a choice of transport, which makes separate releases useful. There’s no compelling reason to
offer the protocol package on its own, especially not just to satisfy an experiment with Durable Objects, which can use
a Git dependency instead.

I wanted to keep `beryl_protocol` as a separate package in the repository so I could build and test it on both Erlang
and JavaScript. For Hex, though, I wanted to ship its source inside `beryl`.

Since I already use [trellis](/trellis/) to manage releases, I added source bundling in trellis
1.1. It’s specifically designed around beryl’s needs, but I think it will suit other similar cases where the package
boundary makes sense inside a project but not outside it. My root `gleam.toml` includes:

```toml
[tools.trellis.publish.bundle]
beryl = ["beryl_protocol"]

[tools.trellis.publish.lifecycle]
default = "git_only"
packages = { "packages/beryl" = "hex", "packages/beryl_protocol" = "workspace" }
```

When I publish `beryl`, trellis creates a temporary package with both source trees. It preserves the module names and
imports, removes the separate `beryl_protocol` dependency, and includes its external runtime requirements. It then
validates and publishes the combined package without changing my checkout. Conflicts, such as duplicate module names or
differing dependency requirements, stop publication. Those checks only cover the package I’m publishing. A consumer who
installs `beryl` alongside a separate copy of `beryl_protocol` can still hit a module collision.

Consumers will install `beryl` without needing a separate protocol release, while I get the convenience of a separate
package boundary to help with development and keep the protocol honest about JavaScript support.

The [trellis source bundling docs](https://trellis.tylerbutler.com/docs/publishing/#bundling-private-dependencies) cover
the details, and the [beryl workspace configuration](https://github.com/tylerbutler/beryl/blob/main/gleam.toml) is a
working example.
