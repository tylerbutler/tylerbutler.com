---

title: Outlook, Email, and CSS
timestamp: 05:11 PM Friday, June 26, 2009 PDT
status: published
slug: outlook-email-and-css
url: /2009/06/outlook-email-and-css/

guid: http://www.tylerbutler.com/2009/06/outlook-email-and-css/

---

_**Update July 13, 2009:** Thanks to some comments, I've got new links and
minor updates in the post now._

_Note: I work for Microsoft, in the Office division, but I don't work in or
with the Outlook team. I don't have any specific knowledge about their
decisions or plans, and this post is based only my own experience here at
Microsoft._

The web community has been up in arms the last day or so about a [campaign via
Twitter][1] pushing for Outlook 2010 to stop using the Word rendering engine
for HTML email. I engaged in a short friendly discussion with my buddy
[Vlad][2] on Twitter about the issue, and that got me thinking about the issue
a bit more deeply. And the more I thought about it, and read everything that
was being written, the more I realized that people aren't actually
communicating effectively, and that pisses me off…

The fixoutlook.org website says this: “Microsoft has confirmed they plan on
using the **Word rendering engine** to display HTML emails in Outlook 2010.”
(emphasis added) Based on that, and the rest of the text on the site, it seems
like the big beef they have is that Word's **rendering engine** for HTML is
not up to snuff. Fair point -- it isn't. But they contradict themselves in
[their updated response][3] to Microsoft's response when they say, “We're
asking that the **HTML produced by the Word engine be standards compliant**.
This in turn will ensure that the engine will correctly _render_ standards-
based emails.” (emphasis added)

Wait a second. Do they want an editor that produces HTML, or a rendering
engine that works properly? Doing the work to make sure the editor is
producing clean markup **might** produce a rendering engine that renders
nicely, perhaps it even **should** produce one, but that **doesn't mean it
will**. Those two pieces of work are **not** the same thing.

Lots of people have been pointing to [a post from Zeldman][4] about this.
Zeldman's a brilliant guy, but he completely misses the point when he
perpetuates a rumor about why Outlook chose Word's engine: “Rumor has it that
Microsoft chose the Word rendering engine because its Outlook division
“couldn't afford” to pay its browser division for IE8. And by “couldn't
afford” I don't mean Microsoft has no money; I mean someone at this fabulously
wealthy corporation must have neglected to budget for an internal cost.”

Ummmm… no. In my experience, the phrase “couldn't afford” at Microsoft R&D has
nothing to do with monetary cost. It has to do with engineering cost. Features
don't exist just because you want them to exist. (An aside: [Raymond Chen][5]
has a great quote about this that I can't find. If you have a link, please let
me know.) So I imagine that the rationale in the Outlook team went something
more like this:

_Well, we want Outlook to produce really rich emails, and we want it to have a
really familiar look and feel, so people already using our products will feel
at home. Hmmm, building an editor is extremely hard to get right, plus we,
being part of the Office suite, have several editing tools already. Emails
tend to be a lot like documents, so Word seems to be a reasonable choice. This
way we can leverage all the editor features Word already has, plus things
they're building this release, and focus on the Outlook-specific work we have
to do. We don't want to invest our engineering time in building an editor when
we already have one._

From this standpoint, it's easy to see why using Word for rendering as well is
the next logical step. You could argue that they should use IE (or Gecko, or
Webkit, as Zeldman does, but again, just because those engines are free
doesn't mean using them is without cost) to render email, and Word to author
it. That's a reasonable idea. In fact, the Outlook team seems to agree with
you, because if you get an HTML email that looks wrong, you see a link to open
it in a browser. In fact, even the [example image][6] at fixoutlook.org has
the “info bar” at the top that does this.

You can take issue with the implementation, certainly, because it sucks
mightily. The fact that I have to open the email in a browser separately
blows. I shouldn't have to do that. But don't kid yourself into thinking that
integrating an IE window into the message window is so stupidly simple that
Microsoft is maliciously avoiding doing it to somehow screw users. It might be
straightforward -- I honestly don't know. But do you? If you think you do,
please go read Steve Yegge's post “[Have you ever legalized marijuana?][7]”
and come back.

What really bugs me about this whole thing is that people immediately jumped
on the fact that Outlook uses Word for rendering, instead of sticking to the
real problem that Outlook's rendering of HTML sucks in some cases. The
rendering engine they're using is immaterial, really, because if the team goes
and fixes the rendering inadequacies, then the issue goes away. They can
choose how to fix the issues, should they choose to fix them at all, but at
this point, even if all the rendering issues are fixed, many people will still
be pissed because Word is used to render the email. The argument has shifted
from being about the support proper email display to being about Word used for
rendering, so there doesn't seem to be a path to redemption for Microsoft in
the court of public opinion that doesn't involve ripping out Word completely.

I completely agree, personally, that web standards serve as a reasonable basis
for email format standards even though there is no formal effort to
standardize email. But please argue about the right things. Spend your energy
trying to see those standards acknowledged rather than perpetuating this silly
argument about ripping out Word from Outlook. Hopefully this effort will have
the desired effect, and these rendering issues will get resolved prior to
Outlook 2010 RTM. But I can almost completely guarantee that if you want Word
completely ripped from Outlook, you're not going to get what you want.

_By the way, does anyone have a screenshot of what the email used in the
example image looks like in Outlook 2007, which also used Word for rendering?
That struck me as a strange omission. I'm wondering if the issues displayed in
that screenshot are just bugs in the 2010 beta. I doubt it, but would still
like to see it._

_**Update:** Turns out you can see this in the [Email Standards project's
review of Outlook 2007][8]. As I suspected, no real differences._

_Also -- is there any way to get a sample HTML email from the Email Standards
Project's [email acid test][9]? Seems ridiculous there's no “email me this
sample email” form on the acid test page. I can and will file a bug against
Outlook if I can get a copy mailed to me._

_**Update: **You can now mail yourself a copy of the email directly from the
[acid test page][9]._

* * *

This didn't really fit into the overall flow of the post above, but I still
think it's reasonable info to consider, so I'm including it here anyway. I'm
about to throw out a bunch of numbers and statistics that are not backed up by
any data. They are based only on my own logic and occasionally rational mind.
I think they're true and reasonable statements, but I welcome data that
contradicts them.

I think it's safe to say that a majority, say, 80%, of Outlook users use it
with Exchange. Also, a majority of Exchange users use Outlook, and Exchange is
primarily used in business settings. Since a large majority of email sent in a
business setting is sent to other people in your business, then they're
probably also using Exchange, and also probably using Outlook. Based on this
not-so-scientific reasoning, I argue that the number of emails received in
Outlook that didn't originate in Outlook is relatively small. That means,
practically speaking, that as long as Outlook can render email that started in
Outlook, you're hitting the majority of your users' needs.

Now, the idealist in you (and me, for the record) is screaming bloody murder,
because you want to see the "right thing" happen for all cases, not just the
majority case. But unfortunately, software is more about practicality than
idealism, and at some point some smart, but possibly naive people in Outlook
made a tradeoff. I'd say with 99% certainty that at some point a developer or
two in Outlook estimated the cost of different approaches and implementations,
and this one wound up cheaper. They made a cut. They made a tradeoff. And we
disagree with the tradeoff.

   [1]: http://fixoutlook.org
   [2]: http://twitter.com/vandrijevik
   [3]: http://www.email-standards.org/blog/entry/microsoft-respond-to-our-call-for-standards-support/
   [4]: http://www.zeldman.com/2009/06/24/sour-outlook/
   [5]: http://blogs.msdn.com/oldnewthing/
   [6]: http://farm4.static.flickr.com/3322/3637814200_a2aa59bc89_o.jpg
   [7]: http://steve-yegge.blogspot.com/2009/04/have-you-ever-legalized-marijuana.html
   [8]: http://www.email-standards.org/clients/microsoft-outlook-2007/
   [9]: http://www.email-standards.org/acid-test/

