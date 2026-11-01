---
title: 'Stop re-explaining your conventions in code review'
subtitle: 'Keeping a codebase coherent with repopo'
date: '2026-10-21T11:58:45-07:00'
slug: stop-re-explaining-your-conventions-in-code-review
draft: true
---

In her piece [Test coverage won't save you from incoherence][powerplant], Jenn Cooper argues that coding agents speed up
incoherence across a codebase. One line stood out to me, because it's proven true in my own projects:

> Every merged PR becomes a precedent.

The natural outcome is a feedback loop. An agent copies whatever patterns it finds, and it can create and spread bad
patterns all on its own.

I've been building a tool called [repopo][repopo] that enforces repo policies, and I think it could be useful for
exploring some of the just-in-time agent opportunities Jenn talks about.

## Where repopo came from

Repopo came out of my work on the [Fluid Framework][fluid]. We had a lot of rules we needed to enforce across the repo
that didn't belong to any particular linter. ESLint is great for code, but it's not great for questions like "is this
project set up properly?" Does this package have a README? Does the README have the right sections? Those rules are
about the repo itself. Or maybe you have layers in your code, and you don't want certain layers to call into
other ones. That's another place a tool like this can be useful.

So we built a [policy check tool][flub-policy] into our build tooling and made it pretty flexible. It runs against files
in the repo that match a regex, and it can fix many problems automatically. It worked well enough in Fluid that I wanted
the same thing everywhere, but I didn't want to bring Fluid's build tools everywhere, and there were some other changes I
wanted to make.

That's repopo: a lint tool for any file in your Git repo, with a straightforward way to write your own policies. It aims
to be fast enough to run regularly as part of your inner loop.

## Fitness functions

Jenn recommends *fitness functions*: checks that protect properties of a system's architecture rather than its behavior.
Her examples include forbidding certain service calls and capping bundle growth. She also stresses what you tell an
agent after a check fails -- how to fix the violation and what it must not break along the way.

Now, you can absolutely write architectural checks in a test runner. Nothing stops a test from asserting import
boundaries. But a passing test suite can't tell you about something you never took the time to encode as a test.

That's where repopo comes in. Instead of writing a test that loads every file in the repo and checks each one, you
define policies and repopo handles the common plumbing. You can write your own or use the bundled ones. A *file policy*
matches paths with a regular expression and runs a handler for each matching file. The handler can return an error with
instructions for a manual fix, or, if the change is mechanical, it can just fix the thing.

I use a bunch of the built-in policies for package metadata and scripts in my [tools monorepo][monorepo-config], but a
repo-specific rule shows the connection to Jenn's argument better.

## One place for task config

In my monorepo, implementation commands live in each package's `package.json` scripts, and shared Nx orchestration lives
in `nx.json`. Package-specific target settings go in `package.json` under `nx.targets`. Unfortunately, Nx also supports
package-level `project.json` files, so a contributor -- human or otherwise -- could add one, configure a task, and pass
every test.

Sounds harmless, right? Except now there are two places to configure tasks, and the next person doesn't know which one
is right. With luck they'd follow the most common pattern, but they might follow the most recent one instead, and that
sends them down the `project.json` path again. That's the feedback loop I talked about earlier.

So I just banned it. In *this* repo, we don't use `project.json`:

```ts
const NoPackageProjectJson = {
	name: "NoPackageProjectJson",
	description:
		"Keeps Nx task orchestration centralized instead of adding package-level project.json files.",
	match: /^packages\/.*\/project\.json$/,
	handler: async () => [
		{
			message:
				"Package-level project.json files split task configuration across competing locations.",
			manualFix: [
				"Put implementation commands in the package's package.json scripts.",
				"Put shared orchestration and task defaults in root nx.json.",
				"Use package.json nx.targets for package-specific target settings.",
				"Follow packages/repopo/package.json and nx.json as examples.",
				"Preserve required tasks and caching settings when migrating; do not delete functionality to pass this check.",
			].join("\n"),
		},
	],
} satisfies FilePolicyDefinition;
```

There's no auto-fix here. If repopo finds one of these files, something went wrong, and a person (or an agent) needs to
fix it on purpose.

You could also add a rule to your `AGENTS.md` that says "don't add `project.json`; do it this way instead." The problem
is that agents, just like humans, don't always follow the rules. You still need something deterministic to enforce
them. Ideally your agents rarely break the rule, just like your humans rarely break it -- but when they do, something
reliable catches it.

The manual fix is the interesting part. It describes what's wrong and what's right at exactly the moment the
contributor is paying attention, because they just made the change and the check runs regularly.

And don't skip that last line. Deleting the new `project.json` without moving its behavior would satisfy the path check
and quietly break the work. Jenn calls out this failure mode directly: an agent will happily optimize for a green check
at the expense of the feature you actually asked for. The policy catches the unwanted file, but I still have to review
the migration.

## Repository policies

Some rules need more context than a single file. For those, repopo has *repository policies*, which run
once after the file policies finish.

The built-in `SharedDependencyVersions` policy is a good example -- it checks that members of a Cargo workspace agree on
dependency versions. It's a Rust-specific policy, but the same API is there for your own cross-file rules.

Could you use it for Jenn's example of tool handlers calling AI services? Sure, but it's harder than it sounds.
Do you care about direct imports only, or calls through intermediate modules? What about import aliases? Dynamic
imports? A text search for one import string will leave gaps. If your linter or a dependency-analysis tool already
handles the boundary you need, use that. Repopo is a home for repo-specific checks. Leave dependency analysis to
the tools built for it.

## Ratchets

Jenn also describes *ratchets* for measurable things like bundle size: set a ceiling at the current value, then
require review for any growth.

I wouldn't use repopo for bundle size. You can't measure a bundle until you build it, and a full build is too slow for a
check you run in your inner loop. Bundle size checks should run in CI at the very least, and a dedicated bundle-size
tool will do the job better than anything you write yourself. Those tools already handle compression, per-entry-point
budgets, and reporting the change on each PR. Those checks still need instructions that protect the product as well as
the number. Ripping out an accessibility label to save a few bytes is not a fix. If growth is intentional, raise the
limit in a reviewed change and say why it's worth it.

Ratchets on source files are a different story. Repopo already reads the files in your repo, so a custom policy can
count lines or find files that still use a deprecated pattern without waiting for a build. Have the policy compare the
result against a limit in committed config and report both numbers when it fails.

Pick the number with care, though. A file-length limit sounds reasonable until an agent splits one understandable module
into four awkward ones to get under it. A smaller number doesn't always mean a better design.

## What repopo won't do

To be fair to the problem, there's a lot repopo doesn't handle, and it's worth being clear about that:

- **No built-in ratchets.** There are no historical baselines. You write the measurement and comparison, and your team
  owns the review process.
- **It only sees what Git sees.** The default file inventory comes from Git, so ignored build output won't show up.
  That's one more reason to leave bundle size to a dedicated tool.
- **It's not a commit gate.** Repopo exits nonzero when there are unresolved violations. Wiring that into CI or a local
  hook is up to you.
- **It can't judge design.** It can reject a forbidden file. It can't tell you whether two helpers express the same idea,
  or whether a new abstraction earns its keep.

That last one is where the agent-based reviews Jenn describes come in, including reviews that flag tests preserving
patterns the team wants to retire. I'd run those alongside deterministic checks. When a reviewer keeps flagging the same
problem, that's your cue to ask whether it's precise enough to become a policy. Some decisions will always need a person
who actually understands the codebase.

## Try it

Install repopo as a dev dependency:

```sh
npm install --save-dev repopo
```

Then run:

```sh
npx repopo check         # report violations
npx repopo check --fix   # fix what can be fixed automatically
```

I'd put the read-only check in CI and ask coding agents to run it before they declare a task done. The [docs][repopo]
cover the rest, including partial checks.

For my monorepo, the task-config rule is one decision I've managed to write down where it can't be missed. Future
contributors get the reasoning right in the error message, and I spend less time in code review repeating myself about
where task config belongs.

If you've got a convention you're tired of re-explaining in code review, [give repopo a try][repopo] -- and let me know
what you end up encoding.

[powerplant]: https://usepowerplant.com/blog/test-coverage-wont-save-you-from-incoherence/
[repopo]: https://repopo.tylerbutler.com/
[fluid]: https://fluidframework.com/
[flub-policy]: https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-cli/docs/check.md#flub-check-policy
[monorepo-config]: https://github.com/tylerbutler/tools-monorepo/blob/main/repopo.config.ts
