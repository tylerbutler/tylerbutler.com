---
title: roost
date: 2026-05-13
description: Phoenix channel wire-protocol helpers for Gleam.
url: https://roost.tylerbutler.com/
github: https://github.com/tylerbutler/roost
logo: ../../assets/roost.webp
programmingLanguage: gleam
license: MIT
maturity: experimental
dependsOn:
  - trellis
---

Encode and decode Phoenix channel text and binary frames with typed payloads, reply correlation, and heartbeat helpers. Roost supports both Erlang and JavaScript; callers provide the transport and manage socket and channel lifecycles.

Roost is pre-1.0, with an unstable API and Git-only distribution. The project uses Trellis for releases.
