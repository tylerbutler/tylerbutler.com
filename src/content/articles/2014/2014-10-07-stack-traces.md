---

title: Stack Traces
date: '2014-10-07T11:04:00-07:00'
link: http://rustyshelf.org/2014/08/07/thoughts-on-swift-from-an-idiot/
via: Brent Simmons
vialink: http://inessential.com/2014/08/27/a_rant_about_stack_traces
slug: stack-traces
engineer:
  slug: stack-traces
  url: /2014/10/stack-traces/

---

> Yes I know, ha ha Null Pointer, Java, LOL. But that’s an exact line number friends. What did the user do? They tapped the subscribe button. Which page where they on? The Podcast Dialog. Zero ambiguity. Guess how many of our Android crashes we get that for? 100%. In iOS we’d be lucky if even 30% of our crashes had stack traces we can line up to actual things we can then reproduce. So most iOS crashes today involve me becoming House MD and poking the code for hours, only to figure out that like always, it’s never Lupus.

It astounds me that iOS debugging is so... *medieval...* That said, JavaScript stack traces can be just as bad, depending on the browser. I think good stack traces are a *requirement* for actually shipping software. Here's hoping iOS, and browsers, catch up soon.