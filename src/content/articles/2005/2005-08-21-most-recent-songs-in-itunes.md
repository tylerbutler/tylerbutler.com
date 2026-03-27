---

title: Most Recent Songs in iTunes
date: '2005-08-21T23:19:00-07:00'
slug: most-recent-songs-in-itunes
engineer:
  slug: most-recent-songs-in-itunes
  url: /2005/08/most-recent-songs-in-itunes/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2005/08/most-recent-songs-in-itunes/

---

I decided this morning that I was going to try and learn XSLT today. I think I
succeeded somewhat. I decided that my tutorial application would be an iTunes
XML feed transformed into a page on my site with the most recent songs I've
listened to in iTunes. I created my own iTunes XML schema (a really really
simple one), though in retropect, I probably should have just tried to use the
built-in iTunes XML stuff (though I don't know if this capability is exposed
in the SDK). Anyway, once I had the XML (created by my program in C# and the
iTunes COM SDK), I started fooling with the XSLT. It still needs a lot of
style work, but I managed to get it formatting the data the right way and
everything.

  
The album art is actually taken directly from the metadata on the audio files
in my collection, not from another source like Amazon. I think this is a
better solution because I have some crazy stuff that Amazon simply doesn't
know about. Besides, I spent a long time trying to clean up the album art in
my music collection, and though there are still a lot of gaps, I might as well
get some reward for all my hard work.

  
As far as the XSLT is concerned, it's pretty easy stuff, I guess, but there
are a lot of "gotchas." For example, I couldn't get things to render in
Firefox until I added the "" line. It was working fine in IE and I couldn't
figure out what the heck was wrong. Plus, if you're not careful about dividing
your templates for different elements up properly, things come out pretty
wierd. Also, my Apache web server isn't configured right, I guess, because it
messes up the MIME types on *.xslt files, so for awhile, Firefox complained it
couldn't attach the stylesheet. Rather than fool with Apache, I just changed
the extension of the stylesheet. How's that for lazy?

  
Anyway, here's the xml file with attached stylesheet: [nowplaying.xml][1].
Obviously, you'll need at least IE 6.0 or Firefox (or another XSLT-ready
browser)to see it right. And here's the [XSLT itself][2]. Like I said, I want
to do a lot more styling, but I have been doing this stuff all day, so I'm
calling it quits for now.

   [1]: /SiteCollectionDocuments/Post%20Content/nowplaying.xml ()
   [2]: /SiteCollectionDocuments/Post%20Content/fullview.xsl ()

