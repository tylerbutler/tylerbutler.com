---

title: Follow Up On Outlook HTML+CSS Post
date: '2009-07-14T01:35:00-07:00'
engineer:
  slug: follow-up-on-outlook-htmlcss-post
  url: /2009/07/follow-up-on-outlook-htmlcss-post/

guid: http://www.tylerbutler.com/2009/07/follow-up-on-outlook-htmlcss-post/

---

_Note: I work for Microsoft, in the Office division, but I don't work in or
with the Outlook team. I don't have any specific knowledge about their
decisions or plans, and this post is based only my own experience here at
Microsoft._

My [post on Outlook's HTML+CSS rendering][1] generated a bit of buzz, due in
no small part, I'm sure, to [Zeldman linking to it][2] from his own post. I'm
finally getting some time to respond.

First of all, thanks to everyone for the responses; I am glad that this
alternative viewpoint at least sparked some discussion. Despite what you may
think, there are plenty of people on the “front lines” at Microsoft that
really care a lot about this stuff, and we try very very hard to make sure The
Right Thing (tm) happens whenever possible.

I have [responded][3] to the comments directly in the post, but I wanted to
also mention that I filed two separate bugs in our internal bug database. The
first covers the fact that we're apparently not obeying your browser
preference when you open an email in a browser, though this may have something
to do with the actual file type that the email message gets stored as
temporarily. Non-IE browsers might not register to open that file type.

The second covers the actual piss-poor rendering Outlook does of the acid test
email. Thanks to Dave Greiner from the Email Standards project for providing
links and addressing the questions I had in the original post. Once I had a
copy of the acid test email I was able to get the bugs officially filed.

I will not be posting any further details on the status of these or other
bugs, either now or after we ship, so please don't ask. I am sorry, but it
isn't standard practice at Microsoft to reveal publicly the status of bugs,
and I don't plan on starting a trend in this particular area. It's also
frankly not my place to comment on bugs on which I am not an expert,
especially those that are in areas completely separate from the ones I work
on. You'll have to take my word for it as an honest, standards-loving software
developer that I filed them.

Please continue to send feedback in any way you can to Microsoft, and
specifically the Outlook team. Here's hoping for some quality HTML+CSS email
rendering in the future.

   [1]: /2009/06/outlook-email-and-css/
   [2]: http://www.zeldman.com/2009/06/24/sour-outlook/#comment-43712
   [3]: /2009/06/outlook-email-and-css/comment-page-1/#comment-137

