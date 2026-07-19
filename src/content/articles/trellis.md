---

title: 'Trellis: workspace tooling for Gleam monorepos'
date: '2026-07-16T21:32:00-07:00'
slug: trellis
tags:
- gleam
- trellis

---

As I've been building more libraries in the Gleam ecosystem, I've taken advantage of Gleam's support for file system dependencies.
Path deps let you create local workspaces with multiple Gleam packages linked and built together. It's great!

The first workspace I set up was for my [lattice](https://lattice.tylerbutler.com) project, a collection of CRDT implementations.
Each data structure is packaged individually, so you can depend on just the counter or just the OR-set without pulling in everything else, and each package can version and release on its own schedule.
This is clearly the right shape for lattice.

It also surfaced two problems.

**Running things in the right order.** Within a single package, Gleam handles path deps well -- edit a dependency's source and the consumer's next build picks it up. But that's where the workspace awareness ends: `gleam build`, `gleam test`, and `gleam publish` each operate on one package directory at a time. Running tests across the whole workspace -- or just across the packages a change actually affected -- meant hand-maintaining the package list in topological order in a justfile and looping over it serially in bash. Every new package had to be added to the list by hand, and nothing verified the ordering as the dependency graph evolved. That's fine with two packages and increasingly not fine after that.

**Releasing.** Publishing a multi-package workspace to Hex meant a pile of bash glue: computing publish order by hand, and -- the worst part -- rewriting each package's path dependencies into valid Hex version requirements at publish time, then putting the originals back afterward. That step was the most annoying and error-prone thing to automate, because a half-failed release leaves your repo in a rewritten state.

I also initially struggled with how to handle versioning across the packages, which I believe should work a specific way: every user-facing change gets recorded as a small fragment file when it lands, and releases batch the accumulated fragments into version bumps and changelog entries. Fortunately there's an excellent tool called [Changie](https://changie.dev/) that automates exactly this workflow, and I highly recommend it. I use it for my Rust projects -- including, as it happens, this one.

After running into my third project that needed the same Gleam workspace infrastructure, I decided it was time to solve the problem properly.

## Enter trellis

I happen to have quite a bit of professional experience in this area, so I wrote down the scenarios and sketched the
CLI, then dispatched Fable 5 to put it together.
I was reasonably impressed with what it produced, and I'm already using it in my projects.

The result is [trellis](https://trellis.tylerbutler.com) -- a trellis being, of course, the frame a lattice grows on.

The design principle: **configure nothing that can be derived, verify anything that must be duplicated.** There's no separate workspace config file. A `[tools.trellis]` table in the root `gleam.toml` marks the workspace and lists member globs; everything else -- the dependency graph, build order, publish order, change impact, the path-dep rewrite map -- is computed from the members' own `gleam.toml` files, never declared.

```toml
# gleam.toml at the repo root
[tools.trellis]
members = ["packages/*", "examples/*"]
exclude = { "@release" = ["examples/*"] }
```

That's enough for the day-to-day commands:

```sh
trellis run test                     # graph-parallel: a package runs as soon
                                     # as its workspace deps have finished
trellis run test --since origin/main --with-dependents
                                     # only what a PR touched, plus dependents
trellis graph --format mermaid       # see the topology
trellis doctor                       # check every workspace invariant at once
```

And for releases, the part I actually built it for:

```sh
trellis changelog new --kind Added --body "..."   # record a fragment
trellis release pr                                # fragments -> release PR
trellis tag create --push --github-release        # tag merged versions
trellis publish --all-untagged                    # publish to Hex, in order
```

`publish` handles the path-dep rewrite that used to be my least favorite bash script: each workspace path dependency becomes a Hex requirement derived from that dep's current version, `gleam publish` runs, and the original `gleam.toml` is restored -- even on failure. Already-published versions are skipped, so re-running a partially failed release is safe.

## Opinionated but modular

Trellis is opinionated, but the pieces are modular, so you can adopt only the ones you want. If you just want `run` and
`graph`, use those and keep your existing release process. I also built the changelog engine in as a native,
Changie-compatible feature -- fragments in `.changes/unreleased/`, configurable kinds and bump rules -- because it's
nice to have a single binary that handles the whole workspace scenario end to end, in CI and locally alike. But if you
don't like how it works, sub it out.

I also welcome bug reports, feature requests, pull requests, etc. on the [trellis
repo](https://github.com/tylerbutler/trellis). It's MIT-licensed open source.

It ships as a single prebuilt binary (shell installer, Homebrew, mise, or `cargo install`), so it installs in CI in
about a second. There are comprehensive docs at [trellis.tylerbutler.com](https://trellis.tylerbutler.com). If you're building more than one Gleam package in a repo, take it for a spin.
