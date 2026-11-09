---
title: santa
date: 2026-04-27
description: A package manager meta-tool for checking and installing packages across platforms.
github: https://github.com/tylerbutler/santa
programmingLanguage: rust
license: MIT
maturity: experimental
---

Check and manage packages across Homebrew, Cargo, APT, Pacman, AUR, Scoop, and Nix with a single tool. Santa tracks installed and missing packages and generates install scripts for bootstrapping machines.

By default, `santa install` writes a script for you to review and run; it does not run package-manager commands itself. Santa is pre-1.0, with releases available on GitHub.
