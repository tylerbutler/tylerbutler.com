---

title: Building MOSS Master Pages
timestamp: 10:57 PM Friday, February 02, 2007 PST
status: published
slug: building-moss-master-pages
tags:
- sharepoint
url: /2007/02/building-moss-master-pages/

guid: http://blog.tylerbutler.com/index.php/2007/02/building-moss-master-pages/

---

Now that MOSS is available to lots of people, and people are building lots of
sites that [don't][1] [look][2] [like][3] SharePoint, a lot of you might be
wondering how you should get started in building your own custom master page
for your site. I talked a little bit about this in my first post on building
tylerbutler.com, but I think it might be valuable to post some info about the
minimal master page and its role in helping you build a custom master page for
your site. But first, some background…

During the early betas, people heard that you could make SharePoint "not look
like SharePoint," and so they set off to do just that. People started cracking
open default.master and trying to understand it. The problem many people
reported was that the markup in default.master was ridiculously complicated,
and it wasn't clear what could be removed and what couldn't. The complexity is
somewhat necessary for that master page because of all the delegate controls
we have to put in place to support a bunch of different back-end SharePoint
stuff (I do believe, however, that there's plenty of things we could/can do in
that master page to make it clearer and easier to customize without removing
functionality, so this is not meant to be an excuse).

Anyway, there were customers that were trying to build internet facing sites
on top of SharePoint, because **a)** we told them that they could/should and
**b)** we rolled up a lot of web content management functionality from Content
Management Server 2002, and customers that were using that product were
investigating how they would move to MOSS. These customers did not want their
site to look anything like SharePoint. These customers also often had a site
design template that was coming from their design team, either in HTML or as
image mock-ups. Trying to fit that design into default.master was exceedingly
difficult because of all the unclear markup in that master page.
Default.master is designed for a SharePoint site -- one that looks and acts
like SharePoint. But people who wanted to build non-SharePoint looking sites
were getting tripped up by using it as a starting point.

We do have several master pages that we built that are much simpler than
default.master. When you provision a Publishing Portal site collection, for
example, we default to BlueBand.master, which has customized CSS and MOSS
navigation out of the box. It's a cleaner starting point, so we initially told
people to start there rather than with default.master. We still had problems,
though, because you never knew if a placeholder was absolutely necessary in
your master page. What would happen is you'd remove a seemingly innocuous
placeholder and your page would work fine until you browsed to some specific
page that was overriding that placeholder, then things would break.

What we needed was a sample master page that included only the markup that was
_absolutely necessary to get your pages to render._ Thus, the [minimal master
page][4] was born. This master page is purposely bare. It's just a bunch of
placeholders – those placeholders are necessary for things in your site to
work properly. With this master page, you can take your markup from your
designer, paste it into SharePoint Designer, and move markups into the
appropriate placeholders. If there's some pieces you need/want from
default.master or another page, you can always open them up and copy/paste the
appropriate markup.

So, should you start with `default.master`, `blueband.master`, or the minimal
master page example when building your own custom master page? Well, the
answer depends on what you're trying to do. If you're building out a site that
really should look and work like vanilla SharePoint, then maybe `default.master`
makes sense. If you're trying to do something more exotic, `blueband.master` and
its siblings have examples of different navigational structures and color
schemes, so maybe it makes sense to start from one of those that is close to
the navigation/color you're aiming for. But my personal recommendation is to
start with the minimal page and copy/paste the appropriate controls/markup
from other master pages as necessary. This ensures you get only what you need
and want in your page, rather than having to weed through a bunch of markup to
get rid of stuff that doesn't _look_ like it's needed. If you do want to go
the default.master route, then Heather Solomon has [a custom master page][5]
that she's tweaked from `default.master` to make things cleaner and more
straightforward.

I hope this helps you figure out how to get started building out your site
look and feel. There is a growing number of live custom sites on top of MOSS,
and it's exciting to see what people are able to build with this product!

   [1]: http://www.fifteen.net
   [2]: http://www.shareview.co.uk/
   [3]: http://www.hedkandi.com/
   [4]: http://msdn2.microsoft.com/en-us/library/aa660698.aspx
   [5]: http://heathersolomon.com/blog/archive/2007/01/26/6153.aspx

