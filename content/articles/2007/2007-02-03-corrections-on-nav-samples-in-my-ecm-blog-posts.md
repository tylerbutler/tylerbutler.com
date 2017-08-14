---

title: Corrections on Nav Samples in my ECM Blog Posts
date: '2007-02-03T00:38:00-08:00'
tags:
- sharepoint
engineer:
  slug: corrections-on-nav-samples-in-my-ecm-blog-posts
  url: /2007/02/corrections-on-nav-samples-in-my-ecm-blog-posts/

guid: http://blog.tylerbutler.com/index.php/2007/02/corrections-on-nav-samples-in-my-ecm-blog-posts/

---

Way back when I wrote [part 1][1] of my series on building tylerbutler.com, I
mentioned that I was using a custom sitemap provider to drive my "recent
pages" section on my site. I was doing this with navigation because navigation
controls inherently know where they are in a site's structure, which meant I
only needed one control in my master page to drive the links in the right hand
section. I was using the `DynamicChildLimit` property to make sure I only got 15
links to show up in that section.

Unfortunately, I started having problems with the ordering of the links that
were showing up, so I started talking with Chris Richard, the nav maestro. It
turns out that the `DynamicChildLimit` isn't meant to be used for that purpose.
When you sort navigation, the sorting happens _after_ the nodes are returned
from the nav store. This means that if you have 50 navigation items sorted by
last modified time, and you set a `DynamicChildLimit="15"`, for example, you'll
get back 15 pseudo-random items, then those resulting 15 items will be sorted
by last modified time. I say a _pseudo-random_ set of items is returned
because even though items returned aren't really random -- there _is_ a
deterministic way nodes get returned from the nav store -- it's complicated
enough that you won't be able to tell what 15 items will be returned at any
given time.

Anyway, this means that `DynamicChildLimit` doesn't really work the way I
thought and it makes navigation unusable for my needs in this instance.
However, a helpful guy named Bram Kleverlaan left [a comment ][2]on my Part 6
post that he was able to use a SharePoint expression to make Content Query Web
Parts know where they are in the site hierarchy. The trick is to set
`WebUrl="<% $SPUrl:~Site/ %>"` in the web part's properties. This expression
will get expanded by SharePoint at runtime, and your CQWP will suddenly change
based on the location of the page that's loading it. I definitely had a "Why
didn't I think of that?" moment when I read Bram's comment.

Anyway, I am using this now on my site, and I can verify that it works for web
parts that live _outside_ of web part zones. I have not yet tried it on a web
part inside a zone, but I've heard reports that the property gets reset every
time you change properties on the web part in the browser, which you can't do
for parts that live outside zones.

   [1]: http://blogs.msdn.com/ecm/archive/2006/10/30/building-tylerbutler-com-part-1-planning-and-basic-branding.aspx
   [2]: http://blogs.msdn.com/ecm/archive/2007/01/16/building-tylerbutler-com-part-6-what-was-tough-and-what-s-to-come.aspx#1512810 ()

