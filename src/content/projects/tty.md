---
title: tty
date: 2026-05-24
description: TTY and ANSI color-support detection for Gleam on Erlang and JavaScript.
github: https://github.com/tylerbutler/tty
hex: tty
hexDocs: tty
programmingLanguage: gleam
license: MIT
maturity: stable
dependsOn:
  - trellis
---

Detect whether stdout or stderr connects to a terminal and determine its ANSI color support. Tty respects `NO_COLOR`, `FORCE_COLOR`, and terminal environment variables so CLI output can adapt to interactive terminals, pipes, and CI.

It also detects terminal background hints and returns an unknown result when the environment does not provide enough information. Both Erlang and JavaScript targets are supported.

Available under either the MIT or Apache-2.0 licence. The project uses Trellis for releases.
