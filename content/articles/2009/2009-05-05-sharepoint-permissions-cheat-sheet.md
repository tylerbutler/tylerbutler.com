---

title: SharePoint Permissions &ldquo;Cheat Sheet&rdquo;
date: '2009-05-05T21:28:00-07:00'
slug: sharepoint-permissions-cheat-sheet
tags:
- sharepoint
engineer:
  slug: sharepoint-permissions-cheat-sheet
  url: /2009/05/sharepoint-permissions-cheat-sheet/

# Custom Properties
guid: http://www.tylerbutler.com/?p=396

---

Back when we were building SharePoint 2007, a member of our Program Management
team left Microsoft, and I inherited the permissions-related features for the
then Content Management Server team, which was responsible for all of the web
publishing features in SharePoint. Essentially, this meant that I has to
figure out what the correct set of permission levels were for our features,
and what lists/libraries should have unique (non-inherited) permissions.

Now, if you've used SharePoint for any length of time, you've no doubt been
frustrated with permissions management. It's definitely a sore point.
Unfortunately, I don't have any magic bullets or golden hammers. When I
started trying to figure everything out so that I could make educated
decisions for our designs, I realized that I needed to write stuff down.
People always asked questions like, “What rights do Designers have by
default?” Sure, you can find out by going to the site itself and checking, but
the UI isn't the easiest to navigate, and oftentimes what you really want to
do is compare multiple permissions levels. “What rights do Designers have that
Contributors don't?”, for example. To help keep it all straight in my mind
(and so I could point people to the info rather than answer 100 emails a day
with the same question!), the SharePoint Permissions “Cheat Sheet” was born.

It's nothing fancy, and it's certainly not anything that no one else could
have created. But still, it has proven useful over the past few years. I still
keep a copy of it pinned to my office wall. It's pretty self-explanatory. The
first sheet has a table of the default publishing permission levels and what
fine-grain permissions each of them has. The second sheet is just the
descriptions of each of the fine-grain permissions so I didn't have to go
hunting through the UI to find them whenever I was wondering what the
differences were. Finally, the third sheet is a list of “securable objects”
(which what I decided to call a list/library that had broken away permissions
inheritance and was independently secured) and what default groups had what
rights to those locations by default. This was particularly important since in
general, you want to avoid breaking permissions inheritance if you can, and we
wanted to be very deliberate about where we did, and also track them to ensure
they made sense over time.

So how exactly do you use this? Well, it can be a
handy reference as-is, but chances are that you have your own permissions
level or have modified the existing ones to suit your needs, so you can modify
this sheet to reflect your own custom permissions and keep track of
everything. It really is helpful to have a centralized reference of all of the
various permissions levels. If you go through and put in your own levels, you
might realize that there's a lot of needless duplication in the custom
permission level you might have created. When it comes to SharePoint
permissions, less is better, so this can be a helpful auditing tool as well as
a reference.

**A couple of disclaimers...** This was created based on the RTM
version. As far as I know, nothing has been changed in SP1 or SP2 that would
impact it, but I haven't been checking to keep it up to date. If you do notice
errors you can let me know and I'll try to correct it. Also, this obviously
won't take into account any customizations that you may do that would alter
the default permission levels. If you use this for any of the purposes listed
or for additional things, leave a comment! I'd love to hear how it's working
for you and if it's been helpful.

<iframe width="100%" height="800" frameborder="0" scrolling="no" src="https://skydrive.live.com/embed?cid=016388EDBC1188FA&resid=16388EDBC1188FA%211657&authkey=AO9sXmDvE0c07ZA&em=2&wdHideGridlines=True&wdHideHeaders=True&wdDownloadButton=True"></iframe>
