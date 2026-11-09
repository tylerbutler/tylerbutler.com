---
title: Gluegun
date: 2026-05-10
description: A typed Gleam wrapper for Erlang's Gun HTTP and WebSocket client.
url: https://gluegun.tylerbutler.com/
github: https://github.com/tylerbutler/gluegun
logo: ../../assets/gluegun.webp
programmingLanguage: gleam
license: MIT
maturity: experimental
dependsOn:
  - trellis
---

Use Gluegun to make HTTP/1.1 and HTTP/2 requests, stream responses, and open WebSocket connections from Gleam. It wraps Erlang's Gun client with typed connection, request, response, and message helpers while retaining Gun's stream-oriented API.

Gluegun targets Erlang only. It is pre-1.0 and distributed through Git rather than Hex. The project uses Trellis for releases.
