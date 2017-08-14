---

title: .Net Browser Integration Demos
date: '2007-04-30T20:38:00-07:00'
tags:
- mix07
engineer:
  slug: net-browser-integration-demos
  url: /2007/04/net-browser-integration-demos/

guid: http://blog.tylerbutler.com/index.php/2007/04/net-browser-integration-demos/

---

To expand on my post from earlier about .Net in the browser, here's some of
the more salient points from the demos that Scott Guthrie et. al. showed:

**Debugging in both Windows and Mac**

Yup, you can attach to a remote process running on the Mac, and step into
breakpoints in your managed code locally in VS. This must have been _really_
hard to build. Nonetheless, this is super useful.

**Code behind for Silverlight projects **

This is basically how you get your .Net code in the browser. As far as I can
tell, your XAML has an associated code-behind page that contains all of your
code, as in pretty much all of ASP.Net

**Integration between Expression and VS for inserting XAML into the Silverlight project from Expression **

You can easily use the best app for the specific job. Designers can crack open
the XAML in Expression and munge it, then developers can live in VS and just
write the code. Everybody wins.

**Add Silverlight projects to ASP.Net projects, get them built and deployed together **

Silverlight controls can be just like regular .Net controls, and get built as
part of the same development workflow. Sweeeeeet...

**http://silverlight.metaliq.com/topbanana/**

Really nifty light table app completely in the browser built in C# and XAML
and delivered via Silverlight. Apparently this will be a sample app that will
be part of the SDK or something, which is pretty sweet. I was hoping it'd be
live so everyone could play, but it's not. Built in a month with alpha
Silverlight 1.1 code.
