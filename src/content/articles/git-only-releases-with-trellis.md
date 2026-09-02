---

title: 'Git-only releases with Trellis'
date: '2026-09-01T17:44:00-07:00'
slug: git-only-releases-with-trellis
tags:
- gleam
- trellis
- git

---

One challenge with modern software distribution, especially for libraries, is that you need to get feedback on an API before stabilizing it, but some publishing platforms reasonably discourage publishing pre-1.0 packages, because such packages cannot adhere strictly to Semantic Versioning.

But you still need to distribute such software in _some_ way if you want to get feedback. In Gleam, the answer is to ask users to take a dependency on your source in git. In Gleam 1.18, this received a major upgrade with support for paths within a git repository, making git dependencies on monorepos a real thing. I rely on it heavily.

But just because the pre-1.0 world is technically the Wild West doesn't mean we can't get in the habit of following a release process prior to 1.0. However, because "doing a release" is so often synonymous with "publishing to a registry" oftentimes the first time you're exercising the release machinery is during a 1.0. Not fun!

With my Gleam monorepo tool, [Trellis](https://trellis.tylerbutler.com), I added support for a [git-only release style](https://trellis.tylerbutler.com/docs/configuration/#release-lifecycle), which allows you to use the same change tracking and release mechanism you use to eventually publish your work to a registry without actually doing that. But you can still do every other part, including using change tracking to determine release types, tagging each package individually in a monorepo, and create a rolling tag that moves as minor or patch versions are released.

The rolling tags are the flagship feature, because they give your users something closer to a version range like they would have on a registry. They can depend on a moving series tag like `v0`, and get updates automatically every time they re-resolve.

That is useful, but it creates a second problem: a moving ref is not a pin. It is great when you deliberately want to
pick up whatever the latest compatible release is supposed to be, but less so when a routine dependency operation moves you from one
commit to another before you have looked at what changed.

So the workflow needs two refs, not one. The series tag is the update target. The commit is the thing you actually trust. When you want updates, you resolve against a tag like `v0`, inspect what you got, and then run `trellis pin` to rewrite the moving ref to the exact commit you accepted.

That is the scenario `trellis pin` is built for. Library authors can publish git-only releases with useful series tags. Library users can start from those tags without leaving a floating dependency in their project. If you've used [ratchet](https://github.com/sethvargo/ratchet) or similar tools to pin GitHub actions, then this will be very familiar.

With repository series tags and `trellis pin`, you can support users taking git deps on your projects while still giving them a clean path to intentional updates for security fixes, new features, etc.

And worry not -- you can use `trellis pin` on its own without adopting anything else. If you already depend on git refs and just want to turn them into commits, that's fine. Trellis remains modular. Use what you need and ignore what you don't.

Note that Trellis doesn't make any claims about breaking changes or where they'll show up. You should still pin
according to the amount of change you can absorb. In general, pinning to a major version is safe after 1.0, but for 0.x
be sure to check the compatibility promises the library in question provides.

Some may follow a sort of "pre-1.0 SemVer"
where breaking changes are promised to come only in minor releases, never in patches. (For what it's worth,this is what I
strongly recommend libraries follow pre-1.0.) In such cases it may be safe to
take a minor version-series pin. When in doubt, though, use an exact ref.