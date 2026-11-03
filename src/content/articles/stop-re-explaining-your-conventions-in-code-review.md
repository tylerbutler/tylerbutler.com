---
title: 'Stop re-explaining your conventions in code review'
subtitle: 'Keeping a codebase coherent with repopo'
date: '2026-11-02T17:39:16-08:00'
slug: stop-re-explaining-your-conventions-in-code-review
draft: true
tags:
- repopo
- agents
---

In her piece [Test Coverage Won't Save You][powerplant], Jenn Cooper argues that coding agents spread incoherence
across a codebase faster. One line stood out to me, because it's proven true in my own projects:

> Every merged PR becomes a precedent.

The natural outcome is a feedback loop. An agent copies whatever patterns it finds, and it can create and spread bad
patterns all on its own.

I've been building a tool called [repopo][repopo] that enforces repo policies: the conventions you'd otherwise explain
in code review, PR after PR. I think it could also be useful for exploring the just-in-time agent coaching Jenn talks
about: telling an agent what to fix, and what not to break, at the moment it's working.

## Origins

Repopo came out of my work on the [Fluid Framework][fluid]. We had a lot of rules we needed to enforce across the repo
that didn't belong to any particular linter. ESLint is great for code, but it's not great for questions like, "Is this
project set up properly?" "Does this package have a README?" "Does the README have the right sections?" Those rules are
about the repo itself.

So we built a [policy check tool][flub-policy] into our build tooling and made it flexible. It runs against files
in the repo that match a regex, and it can fix many problems automatically. It worked well enough in Fluid that I wanted
the same thing everywhere, but I didn't want to bring Fluid's build tools everywhere.

The result is repopo: a lint tool for any file in your Git repo, with a straightforward way to write your own policies.
It aims to be fast enough to run in your inner dev loop.

## Fitness functions

Jenn recommends *fitness functions*: checks that protect properties of a system's architecture rather than its behavior.
Her examples include forbidding certain service calls and capping bundle growth. She also stresses what you tell an
agent after a check fails -- how to fix the violation and what it shouldn't break.

Now, you can write architectural checks in a test runner. Nothing stops a test from asserting import
boundaries. But a passing test suite can't tell you about something you never took the time to write a test for, and
repo-wide tests take plumbing that most people won't bother to build.

Repopo makes those checks cheaper to write. Instead of writing a test that loads every file in the repo and checks each
one, you define policies and repopo handles the common plumbing. You can write your own policies or use the bundled
ones. A *file policy* matches paths with a regular expression and runs a handler for each matching file. The handler can
return an error with instructions for a manual fix, or, if the change is mechanical, it can fix it.

I use a bunch of the built-in policies for package metadata and scripts in my [tools monorepo][monorepo-config], but a
repo-specific rule shows the connection to Jenn's argument better.

## An example: one place for task config

In my monorepo, each package's `package.json` scripts hold the implementation commands, and `nx.json` holds shared Nx
orchestration. Package-specific target settings go in `package.json` under `nx.targets`. But Nx also supports
package-level `project.json` files, so a contributor -- human or otherwise -- could add one, configure a task, and pass
every test.

Sounds harmless, right? Except now there are two places to configure tasks, and the next person doesn't know which one
is right. With luck they'd follow the most common pattern, but they might follow the most recent one instead, and that
sends them down the `project.json` path again. That's the feedback loop I talked about earlier.

So I banned it. In *this* repo, we don't use `project.json`:

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
fix it.

You could also add a rule to your `AGENTS.md` that says, "Don't add `project.json`; do it this way instead." The problem
is that agents, just like humans, don't always follow the rules. You still need something deterministic to enforce
them. Ideally your agents rarely break the rule, just like your humans rarely break it -- but when they do, something
reliable catches it.

The manual fix steps describe what's wrong and what's right at the moment the contributor is paying attention, because
they just made the change and the check runs in their inner loop.

And don't skip that last manual fix step: "Preserve required tasks and caching settings when migrating; do not delete
functionality to pass this check." Deleting the new `project.json` without moving its behavior would satisfy the path
check and break the change. Jenn calls out this failure mode directly: an agent will optimize for a green check at the
expense of the feature you asked for.

## Repository policies

Some rules need more context than a single file. For those, repopo has *repository policies*, which run once after the
file policies finish.

The built-in `SharedDependencyVersions` policy is a good example -- it checks that members of a Cargo workspace agree on
dependency versions. It's a Rust-specific policy, but the same API is there for your own cross-file rules.

Could you use them for Jenn's example of tool handlers calling AI services? Sure, but it's harder than it sounds. Do you
care about direct imports only, or calls through intermediate modules? What about import aliases? Dynamic imports? A
text search for one import string will leave gaps. If your linter or a dependency-analysis tool already handles the
boundary you need, use that. Repopo is useful for checks that don't have a better home, but it's not a general-purpose replacement
for existing static analysis tools.

## Ratchets

Jenn also describes *ratchets* for measurable things like bundle size: set a ceiling at the current value, then fail the
check when a change increases it by too much.

I wouldn't use repopo for bundle size. You can't measure a bundle until you build it, and a full build is too slow for a
check you run in your inner loop. Bundle size checks should run in CI at minimum, and a dedicated bundle-size
tool will do the job better than anything you write yourself. Those tools already handle compression, per-entry-point
budgets, and reporting the change on each PR.

Ratchets on source files are a different story. Repopo already walks the files in your repo, so a custom policy can
count lines or find files that still use a deprecated pattern without waiting for a build. Have the policy compare the
result against a limit in committed config and report both numbers when it fails.

Pick the number with care, though. A file-length limit sounds reasonable until an agent splits one understandable module
into four awkward ones to get under it. Put that in the manual fix, too: a split has to leave each module easier to
read.

## What repopo won't do

There's a lot repopo leaves up to you:

- **No built-in ratchets.** There are no historical baselines. You write the measurement and comparison, and you own
  the review process.
- **It only sees what Git sees.** The default file inventory comes from Git, so ignored build output won't show up.
  That's one more reason to leave bundle size to a dedicated tool.
- **It's not a commit gate.** Repopo exits nonzero when there are unresolved violations. Wiring that into CI or a local
  build is up to you.
- **It can't judge design.** It can reject a forbidden file. It can't tell you whether two helpers express the same
  idea, or whether a new abstraction is worth the extra code.

That last one is where the agent-based reviews Jenn describes come in, including reviews that flag tests preserving
patterns the team wants to retire. I'd run those alongside deterministic checks. When a reviewer keeps flagging the same
problem, ask whether the rule is precise enough to become a policy. If it is, write the policy and stop leaving the same
review comment.

## Try it

To try it, [install repopo globally](https://repopo.tylerbutler.com/installation/#globally) or, if you're working on a
TypeScript/JavaScript project, into your project as a dependency.

Without a config file, repopo runs a small default set of policies. To use your own, create `repopo.config.ts` in the
root of your repo and register them with `makePolicy`:

```ts
import { type FilePolicyDefinition, makePolicy, type RepopoConfig } from "repopo";

const NoPackageProjectJson = {
	// The policy from earlier in this post
} satisfies FilePolicyDefinition;

const config: RepopoConfig = {
	policies: [makePolicy(NoPackageProjectJson)],
};

export default config;
```

Then run:

```sh
repopo check         # report violations
repopo check --fix   # fix what can be fixed automatically
```

If you installed repopo as a project dependency, prefix those commands with `npx`.

I'd put the read-only check in CI and ask agents to run it before they declare a task done. The [docs][repopo]
cover the rest, including partial checks.

If you've got a convention you're tired of re-explaining in code review, [give repopo a try][repopo]. If you write a
policy other people could use, send a PR, or export it from your own package like I do with
[sort-tsconfig](https://github.com/tylerbutler/tools-monorepo/blob/main/packages/sort-tsconfig/src/policy.ts).

[powerplant]: https://usepowerplant.com/blog/test-coverage-wont-save-you-from-incoherence/
[repopo]: https://repopo.tylerbutler.com/
[fluid]: https://fluidframework.com/
[flub-policy]: https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-cli/docs/check.md#flub-check-policy
[monorepo-config]: https://github.com/tylerbutler/tools-monorepo/blob/main/repopo.config.ts
