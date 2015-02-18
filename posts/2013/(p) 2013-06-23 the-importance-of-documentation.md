---

title: The Importance of Documentation
timestamp: 02:26 AM Sunday, June 23, 2013 PDT
status: published
slug: the-importance-of-documentation
url: /2013/06/the-importance-of-documentation/
tags: documentation

---

Some free advice for anyone writing software:

***Providing excellent documentation is the single most important thing you can do to improve your project.***

I've used the Python flavor of [html5lib][] in a couple of different projects now ([xkcd2][] and [Engineer][]) and there's really one thing that stands out to me: it has absolutely horrendous documentation. Well, it's really just that it has none to speak of, and to be fair, it *could* be worse... It *could* be voluminous yet misleading or poorly organized, but instead there just isn't any.

Of course, it'd be understandable for you to think otherwise. If you visit the Github repo, you're provided with some simple examples of creating a parser and parsing some documents. These examples are pretty standard fare -- they give you a taste of what to expect but don't give you enough to actually use the library.

You're happily informed that "More documentation is available at [http://html5lib.readthedocs.org/](http://html5lib.readthedocs.org/)" but if you head over there you'll notice that there isn't really much more there. The "more documentation" they speak of is a *single page* with information about "the moving parts" which just doesn't do much to help you know how to actually use the API to do anything really meaningful.

<!-- more -->

The only reason I cared at all about html5lib this evening was because I set up a fresh virtualenv and installed Engineer, only to be greeted by an exception when I tried to build my site. Ugh. Turns out html5lib has pushed out a couple of new versions since I last installed Engineer, and one of those updates broke my code.[^docs1] It didn't take long to narrow things down to my simple `html5lib.parseFragment()` call, which was now throwing an exception. Fixing that was relatively straightforward, though it was pretty much me just trying random arguments in the method call. Going further down the rabbit hole, though, it's become clear that the fix is not as simple as I'd hoped, so I'm just [cauterizing things](https://github.com/tylerbutler/engineer/issues/63) for now. This actually turns out to be pretty important since right now anyone trying out Engineer 0.4.3 (the most recent version) will see an exception on their first build. Not exactly the first impression quality software should make, eh?


## Documentation is incredibly important

The number one comment I've received from people trying out Engineer is, "Thanks, this is one of the best-documented systems I've looked at!" I'm very proud of that. One of the major contributing factors to me building Engineer in the first place was that I couldn't get [Hyde](http://hyde.github.io/) to actually work for my purposes, and the docs were either out of date or non-existent (and [still are](https://github.com/hyde/hyde/issues/209), apparently). I decided if I was going to build something I was going to at least write down how to use it. It took -- and still takes -- a lot of time, but it is totally worth it.

[James Hague][], in his recent post *Organizational Skills Beat Algorithmic Wizardry*, writes:

> When it comes to writing code, the number one most important skill is how to keep a tangle of features from collapsing under the weight of its own complexity. I've worked on large telecommunications systems, console games, blogging software, a bunch of personal tools, and very rarely is there some tricky data structure or algorithm that casts a looming shadow over everything else. But there's always lots of state to keep track of, rearranging of values, handling special cases, and carefully working out how all the pieces of a system interact. To a great extent the act of coding is one of organization. Refactoring. Simplifying. Figuring out how to remove extraneous manipulations here and there.

I couldn't agree more, and one of the reasons I think documentation is important is that it's a way of forcing yourself to explain what you've built. Much like [rubber ducking][] can help you debug problems in code, attempting to document what you've written will inevitably help you find design flaws and unnecessary complexity. This is why I think it's incredibly important for the documentation to be written largely by the people building the thing, and that it should be written *alongside* the actual code as much as possible.[^docs2]


## Comments aren't documentation

But what about comments? Where do they fit in? Aren't comments the place where a developer attempts to explain to us why she's doing things the way she is or how to call this API she's written? While I think most of us would agree that commented code is preferable to uncommented code, the difference between comments and documentation is one of *scope.*

In a comment, you're sitting right there in the source code explaining it. First of all, in many cases comments just aren't going to be something people passing by your Github page will see. Sure, you might be using something like Sphinx that pulls comments out into actual docs, but even in that case, you still have a scope issue. At the lowest level, you might be commenting a specific piece of logic in a function that may confuse later maintainers of the code. Even zooming out a bit, you're likely only documenting a class, or maybe a module, but fundamentally comments don't ever really force you to explain *the big picture.*

[Peter Fein][] writes:

> Great documentation tells a story. Narrative docs explain *why* to a hypothetical reader who not only has never seen our code before, but has never seen anything *like* our code. Unfortunately, programmers are generally bad at narrative –- that's why we write code instead of fiction. Writing these docs requires getting outside your head and thinking like a total newbie. That's tough when we've just spent weeks or months working with the code –- we've got no perspective.

When I think about good documentation, narrative docs are what I imagine. Narrative docs help me develop the mental framework I need to use your stuff, and the better it is, the more likely I am to use your project and have fun doing it. You remember the story of [Scheherazade][]? You know, the queen who saved her own life by telling stories to the King that were so compelling he'd spare her life each day so she could continue to tell them? Documentation gives you a chance to do the same thing -- tell a great story, and you'll keep people who just wander by your project engaged enough that they actually try it out.


That's what I consider *real* documentation. Organizing docs in an intelligent and manageable way is surprisingly difficult, and I suggest diving into some other examples before trying to put your own stuff together. Luckily there are a number of great examples to check out for inspiration. Some good places to start:

- [Celery](http://docs.celeryproject.org/en/latest/index.html#)
- [Flask](http://flask.pocoo.org/docs/) (frankly pretty much anything from Armin Ronacher is solid)
- [Engineer][] (yeah, I'm shameless)

My basic policy is pretty simple: I assume the quality of your code is at best no better than the quality of your documentation, and I don't invest in learning to use anything that's not reasonably documented. No more excuses, people. Take the time to write quality documentation.



[^docs1]: Yeah, I suppose it serves me right for using `>=` in my `requirements.txt` file instead of `==`.

[^docs2]: I've heard some people argue that documentation should even be written *before* any code, but I don't think that's necessary and frankly can wind up being detrimental.



[Engineer]: http://engineer.readthedocs.org
[xkcd2]: http://xkcd2.com
[James Hague]: http://prog21.dadgum.com/177.html
[Peter Fein]: http://i.wearpants.org/blog/from-good-code-to-great/
[rubber ducking]: http://en.wikipedia.org/wiki/Rubber_duck_debugging
[Scheherazade]: http://en.wikipedia.org/wiki/Scheherazade
[html5lib]: https://github.com/html5lib/html5lib-python
