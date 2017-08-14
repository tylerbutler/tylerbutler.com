---

title: Accessibility Insanity
date: '2009-03-23T01:32:00-07:00'
engineer:
  slug: accessibility-insanity
  url: /2009/03/accessibility-insanity/

guid: http://www.tylerbutler.com/?p=359

---

Part of my responsibilities for SharePoint these days involves markup
cleanliness and accessibility, so over the last couple of years I have
educated myself on the ins and outs of these issues, and have managed to learn
a lot about browser behavior, the history of markup, etc. I am far from an
expert, but I know a heck of a lot more than I did when I started.

One school of thought I come across quite frequently is that web content whose
markup is not well-formed or is missing required attributes or something just
fail to render completely, in order to ensure that all content on the web is
gorgeous, standards-compliant markup. This ridiculously draconian viewpoint
loses sight of the fact that the ultimate goal of delivering content over the
web is just that -- delivering content. It seems bad form for a browser to just
“give up” when markup is badly formed, because the end-goal of the person
building the page -- and the person consuming it -- is to deliver content. Much
of this debate has been chronicled by the IE team; they have a tough job –
bring the standards compliance of IE into this century without breaking their
customers/users pages. Hence compatibility mode, legacy rendering, etc. etc.

In the past, I've always heard this argument from the standards-compliance
standpoint. For example, if a page claims to be XHTML but isn't fully
compliant, it should fail to render in a browser. No “best-effort” rendering,
just fail. This of course ignores the fact that even the W3C [can't create a
parser][1] that can completely validate a page against the spec, but that's a
rant for another time… Assuming the browser can detect that a page is non-
compliant, it should just **stop**.

Anyway, this is a long and winding intro to [a post][2] Mark Pilgrim wrote
talking about this viewpoint as it applies to accessibility. I had never heard
these arguments before, but apparently they're out there. A choice quote from
Mark's rebuttal (emphasis mine):

> I think it would be wise for people who truly care about accessibility to
take a closer look at the so-called “experts” who are participating on their
behalf, and to understand exactly what these people are proposing. **It's true
that some of their proposals have not been adopted, but it's not because some
cartoonishly monocled villain enjoys being mean to them. It's because the
proposals are insane.**

Agreed.

   [1]: http://validator.w3.org/docs/help.html#validandconform
   [2]: http://diveintomark.org/archives/2009/03/18/if-it-fails-for-some

