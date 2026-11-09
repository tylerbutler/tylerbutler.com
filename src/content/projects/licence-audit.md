---
title: licence_audit
date: 2026-05-24
description: Dependency licence auditing, SBOMs, and vulnerability reports for Gleam.
url: https://licence-audit.tylerbutler.com/
github: https://github.com/tylerbutler/licence_audit
logo: ../../assets/licence-audit.svg
programmingLanguage: gleam
license: Apache-2.0
maturity: experimental
dependsOn:
  - gluegun
  - tomlet
  - tty
  - spruce
  - trellis
---

Audit the locked dependencies in a Gleam project, preview or enforce a licence policy, generate CycloneDX SBOMs and third-party notices, and check known vulnerabilities through OSV.dev.

Licence_audit uses tomlet for configuration, tty and spruce for terminal output, and Gluegun for HTTP requests. The project uses Trellis for releases.

It is in release-candidate testing. GitHub releases provide self-contained executables that include the Erlang runtime, plus escripts that require Erlang/OTP 28 or newer. It is not published on Hex.
