---

title: Patrick Has a Wii, or, Experimenting with Microformats
date: '2006-12-12T00:45:00-08:00'
slug: patrick-has-a-wii-or-experimenting-with-microformats
tags:
- games
engineer:
  slug: patrick-has-a-wii-or-experimenting-with-microformats
  url: /2006/12/patrick-has-a-wii-or-experimenting-with-microformats/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2006/12/patrick-has-a-wii-or-experimenting-with-microformats/

---

My friend [Patrick][1] managed to [get his hands on a Wii][2], and I am a bit
jealous, to say the least. My own weekend Wii hunt did not go well, but I plan
to persevere and head back out next weekend. Supposedly the Redmond
[Target][3] is getting a bunch in on December 17th, so I'll be standing in
line if you want to join me.

However, this post is _really_ meant to be about [Microformats][4], an
interesting little technology that allows you to add a bit more metadata to
existing markup, ostensibly to provide a better way to work with that data and
leverage it in unique ways. I learned about it at the Gilbane Conference a
couple weeks ago, and I wanted to do some checking to make sure you could
leverage them on your MOSS site if you wanted. Seems like you can, as this
post suggests.

If you view this post in Firefox you'll see a little icon next to Patrick's
picture above. This is done using CSS, but you won't see it in IE because [IE
doesn't support `:before` and `:after`][5]. But anyway, this isn't all that
interesting, because I could already do that using CSS. What _is _interesting,
however, is if you go to [http://inside.glnetworks.de/2006/06/05/microformats-
have-arrived-in-firefox-15-greasemonkey-06/][6] and download the [Greasemonkey
][7]script there. Then return to this page, and you'll see that miraculously
the following menu has been added above Patrick's name:

![This image has been lost to the sands of time](../../../assets/lost.png)

Nifty, huh? If you're using that same Greasemonkey script you'll also notice
that the text above about standing in line to get a Wii at Target is an event
that you can add to your calendar:

![This image has been lost to the sands of time](../../../assets/lost.png)

All of the data in the sentence I wrote is wrapped in some appropriate tags
that a compatible client reader (Firefox + Greasemonkey script in this case)
can parse out and act on. Plus, because it's well-known markup, there's a nice
backwards compatibility story for downlevel clients. For example, looking at
this page in IE is pretty boring, but stuff lights up when you use Firefox and
the script.

Anyway, this all goes to show that there is a lot of opportunity for
Microformats to take off if there's better client support. Just consider RSS -
now browsers inherently know how to read some markup in the header of the page
and automatically detect RSS feeds on a page. It's not hard to image a time
when Firefox will include the functionality currently offered through the
Greasemonkey script natively. Plus there's some great tools already out there
for dealing with this type of data. Just check out this link to Technorati,
which will [automatically parse out the hCards on this page][10] and let you
download them as vCards.

I could also write some code that runs on the server and outputs special
JavaScript and CSS when Microformats are encountered. Then no client side
support would be necesarry. I'll be looking into this in the next few weeks.
Anyway, I think there's a lot of potential to include Microformats in more
places on my site, so keep your eyes peeled.

   [1]: http://patrick.wagstrom.net/
   [2]: http://patrick.wagstrom.net/weblog/wii/wiik-wiith-wii.xml
   [3]: https://www.target.com/
   [4]: http://microformats.org/
   [5]: https://www.quirksmode.org/css/beforeafter.html
   [6]: http://inside.glnetworks.de/2006/06/05/microformats-have-arrived-in-firefox-15-greasemonkey-06/
   [7]: http://greasemonkey.mozdev.org/
   [10]: http://technorati.com/contacts/http://www.tylerbutler.com/geekdom/Pages/PatrickHasaWii,or,ExperimentingwithMicroformats.aspx
