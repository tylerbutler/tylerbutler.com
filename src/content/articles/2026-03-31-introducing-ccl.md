---

title: 'Introducing CCL'
date: '2026-03-31T11:27:00-07:00'
tags:
- config

---

In [package.json considered harmful](./2026-03-26-package.json-considered-harmful.md), I made the case that JSON is a
poor config format and that JSONC and JSON5 don't actually fix the problem -- they just extend the lifespan of a bad bet.
If comments are a requirement (and I think they are), and if simplicity matters, then the JavaScript ecosystem's default
config story is genuinely broken.

But pointing out what's wrong is the easy part. What should you use instead?

I've been thinking about this for a while, and I want to tell you about a language I stumbled onto recently that I think
gets it right -- or at least, gets closer than anything else I've tried.

## The second criterion

I said in my earlier essay that comment support is the minimum bar for a config language. But there's a second criterion
I didn't spend much time on: **simplicity**. It needs to be simple to hand-author, simple to read, and simple to
understand.

This sounds obvious, but it's surprisingly easy to fail. Which brings me to my first encounter on the road to finding
something better.

## Discovering PKL (and rejecting it)

I've been using [mise][] for managing dev tools -- it's excellent for polyglot environments where you're juggling Rust
and Node.js toolchains simultaneously. The same author released a tool called HK, a Git hook manager. I tried it out,
and the way HK is configured is using a language called [PKL][].

I'd never heard of it. So I started researching, and wow -- PKL is *not* a configuration language. PKL is a programming
language *disguised* as a configuration language. It's far too complicated. It has far too many features.

PKL does support comments, so it clears the first bar. But it fails the second one badly. At the point where your config
language needs a runtime and an execution model, the honest question is: why aren't you just writing code? The
complexity cost is real; the benefit over simply using a programming language is not.

Machines are, in some ways, secondary to this conversation. We believe this about programming languages -- nobody designs
a language to make it easier for the computer. We design syntax and semantics to help the programmer, then do extra work
in the compiler. We go to all that trouble because we believe people are more productive in languages that are easier to
read and write.

Config languages carry the same obligation. They should be easy to read, easy to write by hand. PKL seems to have
forgotten this.

## Finding CCL

While I was working through PKL's documentation and finding new things to be frustrated by, I came across a [blog
post][CCL] by Dmitrii Kovanikov. I found myself nodding along, saying "yes, this all makes sense." It was about a
configuration language Dmitrii called *Categorical Configuration Language*.

## What makes CCL elegant

Consider how you'd jot down a list on paper. You'd probably write a heading, indent a bit underneath it, maybe use a
dash for items. If something belongs under another item, you'd indent further. Maybe it would look something like this:

```txt
Errands
- Groceries
  - Fruit
    - Apples - 2 lb
    - Bananas - 1 bunch
  - Crudite platter - 2
  - Cereal
  - Milk
- Vet - meds for Spot
```

Here's what a basic CCL config looks like:

```ccl
/= Errands
Groceries =
  = Fruit
    Apples = 2 lb
    Bananas = 1 bunch
  = Crudite platter - 2
  = Cereal
  = Milk
Vet = meds for Spot
```

That's it. Keys and values separated by `=`. Comments are just entries with `/` as the key -- not special syntax, just a
convention. Nested values are indented. Lists are create by empty keys -- much like the human-made list light use a dash
to denote a list item. There's nothing else to learn.

I know there's a cohort of programmers for whom significant indentation is an unforgivable sin. I have genuinely mixed feelings about YAML, which also uses indentation for structure, and I understand the frustration. But in CCL, the indentation is doing something different -- and the distinction matters.

The key insight is this: every time a language uses a special character to delimit structure -- `{`, `}`, `[`, `]`, `"`,
`|` -- it creates an escaping problem. What if your value *contains* that character? Now you need escape sequences. And
if your value is a shell command that already contains escaping, you end up double-escaping, which is a special kind of
misery.

Whitespace doesn't have this problem. You rarely need to escape a space. Nobody writes a shell command and worries it
contains too many leading spaces. Dmitrii calls whitespace "silent ninjas" -- they do structural work without being
visible characters anyone would ever need to include literally in a value. YAML uses indentation too, but pairs it with
a large surface area of other syntax. CCL uses indentation *instead* of that other syntax. That's a meaningful
distinction.

There's also a deeper mathematical elegance here that I'll only gesture at: CCL configs compose associatively, and an empty config is a valid identity element, which means the whole thing forms a monoid. If that means something to you, [Dmitrii's post][CCL] goes much further down that road -- it's one of the more satisfying things I've read about config design.

## Minimal syntax in practice

There's something else really powerful about CCL. The only characters that are processed in a special way are a newline
and an equals sign. And the equals sign is only special when it's the first one on a line -- every other equals is not
special.

This means you can use CCL to embed other languages quite easily. But it also happens to be really useful for apps that
need to store shell commands. Escaping is always a pain when you have a shell command that also needs to do escaping in
the shell -- double escaping is hard.

CCL solves that because there's no escaping. You get a string that represents the exact string you need to run in the
shell. I make heavy use of this in my app [Santa][], where every package source is essentially a set of shell commands.
It's very easy to configure in CCL with no weird escaping rules to explain.

## Building with LLMs

The other reason I found CCL interesting is that it's been a fun project to explore with LLMs and different programming
languages. I have an interest in lots of languages (being from Papua New Guinea may have something to do with that), but
I'm not fluent in all of them. I can read code and understand what the code does, but I couldn't necessarily write it
from scratch without a lot of references.

So I had fun creating a [library of test cases](), then a test harness, then instructions for how to build a test
harness in any language. I used that harness to build CCL parser implementations in Rust, Gleam, Go, and TypeScript.
Each one was a chance to learn something about the language while also building something genuinely useful.

## What's next

After spending time with this, I wanted to do more than just build parsers for my own use. I've created a GitHub
organization -- [CatConfLang](https://github.com/CatConfLang) -- to collect CCL implementations across languages and build
out the ecosystem a bit. The reference implementation is [Dmitrii's OCaml version](), but there are now parsers in Rust,
Go, TypeScript, and Gleam, each developed against a shared test suite so behavior stays consistent.

I also built a [comprehensive test suite]() that I continue to improve and a website,
[ccl.tylerbutler.com](https://ccl.tylerbutler.com) including LLM prompts for folks who want to explore LLM coding agents
on a "real project."

If you find CCL interesting, take a look. The spec is simple enough that you could implement a parser in an afternoon in whatever language you know best. That's kind of the point.

[CCL]: https://chshersh.com/blog/2025-01-06-the-most-elegant-configuration-language.html
[PKL]: https://pkl-lang.org
[TOML]: https://toml.io
[mise]: https://mise.jdx.dev
[Santa]: https://github.com/tylerbutler/santa
