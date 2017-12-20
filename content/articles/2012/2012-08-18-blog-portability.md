---

title: Blog Portability
date: '2012-08-18T20:37:00-07:00'
teaser: true
link: http://www.macdrifter.com/2012/07/things-i-have-learned-about-blog-portability.html
via: Collin Donnell
vialink: http://collindonnell.com/2012/07/31/macdrifter-on-blog-portability/
tags:
- engineer
engineer:
  slug: blog-portability
  teaser: true
  url: /2012/08/blog-portability/

---

MacDrifter on blog portability:

> In my continuing efforts to migrate off of WordPress, I now understand some of my biggest mistakes and flaws.

I'm proud to point out that [Engineer](/projects/engineer/) helps avoid a number of these. Let's examine them.

<!--more--> 

**1. Always save the original Markdown in text files.**

Check. Engineer always keeps your raw post around -- the formatting is done during build time.


**2. Avoid plugins that appear to make life easier by reformatting content for viewing.**
    
Engineer doesn't require you to use any such plugins, but it doesn't prevent you either; it's your choice.


**3. Footnotes are hard to convert from HTML to MultiMarkdown.**
    
This simply isn't a problem in Engineer because the raw Markdown is stored, not just the HTML (see #1).


**4. Use HTML character codes for non-ASCII characters.**

Again, your call here. Engineer will happily handle unicode characters, but other systems might not, so the advice is sound.


**5. Choose a good URL structure up front.**

Engineer uses a date-based one (`.../2012/08/05/post_title.html`) by default, but it's not currently customizable. I'm considering adding that in a future version.


**6. Relative links are better than absolute links.**

Ummm, yeah. This shouldn't ever be a problem in Engineer. With the exception of the RSS feed, all links in Engineer are relative unless you specifically hard-code them.


**7. Don't go ape-shit with tags and categories.**

Because Engineer doesn't use tags for any primary navigation or organization, there's no pressure to add a bunch of tags. I always felt like I needed categories, and to a lesser extent, tags, in WordPress. Categories may eventually make their way into Engineer, but if they do, you should definitely follow this advice.


**8. Code should go in code blocks.**

When I wrote this originally, my response for this tip was simply, "There are systems that don't do this? WTF?" Before I hit 'publish,' though, I decided to double-check my assumption that [Pygments][] already did this. Unfortunately, I was wrong.

It looks like Pygments' [default HTML formatter](http://pygments.org/docs/formatters/) outputs `<pre>` tags with `<span>` tags inside -- not `<pre><code>` like I thought. However, on the bright side, there's a relatively simple way to write a customized formatter (there's even an example on the Pygments site), so assuming I can get it wired up properly to [Python-Markdown][], I should be able to add it. I've [put it on the (ever-growing) list](https://trello.com/c/QeelOqyG).


**9. Don't hard-code formatting into a post.**

This is another one of those "you're on your own" things. Often the formatting you might need in a post within Engineer is related to images, so there are some standard styles available for handling those common cases. But I have and will continue to generally try and avoid this. Themes should define the styles, not the post itself.


**10. Keep the comments in the comments.**

Since Engineer doesn't support comments, this doesn't really apply. If you add your own comments system, like Disqus, then the onus is on you.


All in all not too bad! Engineer sites should be very portable, and with some more compatibility work, you should be able to switch pretty easily to and from Jekyll if you want. Consider giving Engineer a try... you might like what you see!

[Pygments]: http://pygments.org/
[Python-Markdown]: http://packages.python.org/Markdown/index.html
