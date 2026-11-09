---
title: Aquamarine
date: 2026-05-13
description: A protocol-agnostic channel client runtime for Gleam on the BEAM.
url: https://aquamarine.tylerbutler.com/
github: https://github.com/tylerbutler/aquamarine
logo: ../../assets/aquamarine.webp
programmingLanguage: gleam
license: MIT
maturity: experimental
dependsOn:
  - roost
  - trellis
---

Connect to channel servers from Gleam with a client runtime that separates channel behavior from protocol codecs. Aquamarine's Phoenix codec uses roost for Phoenix and Beryl compatibility, while custom codecs can support other protocols.

Aquamarine targets Erlang and is pre-1.0. The project uses Trellis for Git-only releases rather than publishing to Hex.
