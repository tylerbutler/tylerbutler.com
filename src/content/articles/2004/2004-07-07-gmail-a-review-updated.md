---

title: 'GMail: A Review (Updated)'
date: '2004-07-07T17:44:00-07:00'
slug: gmail-a-review-updated
engineer:
  slug: gmail-a-review-updated
  url: /2004/07/gmail-a-review-updated/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2004/07/gmail-a-review-updated/

---

When [Google][3] first announced their new GMail service, I was
relatively unimpressed. The big deal was the gigabyte of storage. Of course, a
gig is a lot of storage space, especially when compared to most quotas for
other web-based email services such as Yahoo and Hotmail (Yahoo has since
upped its quota to 100 MB) , but I have been using Outlook (I know - many
don't like this program, but I have never had any problems) as a
mail/contacts/calendar manager for a long time, and I tend to POP my mail.
That means I have lots and lots of gigs for mail, because everything just goes
to my hard drive.

  
After doing a little more reading, though, I discovered that GMail actually
had a really spiffy interface, was fast, and introduced some really cool ways
to categorize, sort, and store your email. It makes sense, really. If I am
Google, and I want to introduce a new service, I first stop and think, "What
do we do really well as a company?" Obviously, in Google's case, the answer is
searching. From there, I start thinking, "Email is the largest volume of
information most every person in the world has to try and keep organized." If
I am Google, and I want to introduce an email service, I'd better be able to
leverage my strength in the search department to make it exciting. To really
leverage search capabilities, I need a large volume of email - hence the 1GB
quota. You see, I think that Google only offers 1GB of space because that is
what is necessary to really make GMail's other features stand out. Other email
providers won't be able to compete with GMail solely by increasing their
quotas, because that large volume of information introduces an organizational
problem that Google is better suited to solve. I think Google started looking
at ways they could leverage their search engine on email, and realized that
they needed a large email base to be able to provide that, not the other way
around. All in all, I decided I definitely needed to check it out, so I asked
a guy at work to hook me up with an account.

    
### The Interface
  
Well, they weren't kidding. GMail is fast (though I have't tried it on a non-
broadband connection yet). GMail is spiffy-looking (very minimalistic, but
done well). GMail is useable. GMail is just **cool**. As you can see from the
screenshot, there really isn't a whole lot to the interface. Links on the left
to get to various classifications of email, emails displayed in the middle
with the standard checkbox to select them and a star to set them apart from
other emails (comparable to flags in Outlook), and some "action links" along
the top and bottom of the message display. Nothing terribly groundbreaking,
but this is email, not rocket science.

  
Before I could really take a look at things, though, I needed some emails.
That become my first problem. I first set up my @iit.edu account to forward to
both my @tylerbutler.com and @gmail.com accounts. I thought this was working -
but it wasn't. In fact, for an entire weekend, I got no emails forwarded from
my @iit.edu account, because the stupid webmail IIT uses didn't properly parse
the delimiter between the two addresses (I'll save that rant for another time,
I guess). I was confused at not getting any email (save the spam that came in
directly to my @tylerbutler.com account), but I just figured nobody loved me.
Stranger things have happened, after all.

  
Anyway, I finally managed to get some email into GMail, and was happy to see
that things looked like I expected - sort of. The most exciting thing to me
about GMail was the concept of conversations. Each email is displayed in the
context of other emails sent from you back to someone, or from them back to
you. For example, if Brad writes me an email, then I respond to him, our
emails will be grouped and displayed together as a conversation. This makes
sense, since many times emails follow a threaded conversational format. For
personal emails, conversations are great.

  
One of the quirks with conversations that I've noticed is that they're
displayed as "Brad, me(2)." This means, of course, that this conversation is
between Brad and me, and that there are two emails in the conversation. But
who is Brad? I would much prefer if the last names were listed. I know lots of
people, and to me, first names alone don't help a whole lot for descriptive
purposes. I have a conversation between myself and two other people, both
named Kyle. GMail displays the conversation as "Kyle, Kyle, me." It's
confusing which Kyle each is referring to. I imagine this could get even more
confusing as I get more and more email into my inbox. Also, some of my
professors use Dr. X as their outgoing name. Conversations with these people
are displayed as "Dr., me(3)." This particular quirk consistently makes me
laugh, so it's all good.

  
Another problem I have with the GMail interfce is that it doesn't display full
email addresses in the "from" field when a name isn't specified. In the case
of personal emails, this isn't usually a problem, but I get a lot of automated
emails from addresses like support@domain.com. These emails simply display as
from "support," while in Outlook they always displayed as
"support@domain.com." In this case, I think GMail should opt to display it the
way Outlook does, and display the email address when a name field isn't
specified.

    
### Contact Management
  
GMail does a decent job with its contacts/address book functionality. It
contains fields for name, email, and notes, and it provides an import utility
that can read Comma-Separated files. I exported my Outlook contacts to a CSV
file and easily imported them all into GMail. Interestingly, all the
extraneous fields were placed into the Notes field, so the data is still
visible. I definitely don't want to lose that information (addresses, instant
message names, even some birthdays), so I am glad that GMail tries to keep it
available in some format. Fortunately for me, [Plaxo][6] handles my address
book now, so it's all backed up and available online anyway.


### A Monumental Decision (a bit of a segue)
  
Initially, I thought GMail would be a great supplement to my mobile
lifestyle -- I could keep mobile copies of all my email, plus test out this new
conversational mode and see what it was like. So I downloaded [Pop Goes the
GMail][7], a utility that allows you to fetch your GMail from any POP email
client, including Outlook. Unfortunately, the version I downloaded just didn't
work for me (known bug), and I couldn't find an old version (links that said
they were for the older version actually linked to the new one), so I gave up.
But that got me thinking - is there really any reason I want to stick with
Outlook, other than to have access to all my old emails? I thought about the
other functionality Outlook provides that I use: Contact Management and
Calendaring. Well, Plaxo takes care of my contact management, and GMail has
copies of all the email addresses already, since I uploaded the CSV file. I've
been thinking for a long time about switching my calendaring to an online
format anyway, since I don't use Exchange, but I would like to allow my
parents and other interested people see my schedule. I really wish I could get
iCal for Windows, but since I can't, I plan to use the calendar on this
website.

  
Between GMail, Plaxo, and Geeklog, I have a total online replacement for
Outlook! So having made the decision to switch over to GMail completely, I set
about making the transition.

  
### The Transition Begins
  
Initially, I thought I'd just use Outlook to access my old email. But then I
started thinking that the conversation viewing would be much more useful if I
ha all my old email available. A quick visit to Google produced a link to
[Mark Lyon's GMail Loader][8], an application that will forward email from an
MBOX file to a GMail account. Perfect! Only one problem - it doesn't support
PST files, which is what Outlook uses. Mark provides some great links to
utilities on his site, but the PST -> MBOX converter doesn't support Outlook
2003's PST format - in fact none of the ones I found did. So I was forced to
import things folder by folder into Outlook Express, then convert the OE DBX
files into MBX files using the utility Mark linked to on his site,
[DBXConv][9]. Then, just for good measure, I ran [MBox Cleaner][10] on the MBX
files. This process is time consuming - especially for my thousands and
thousands of emails. In fact, I am still working on this part.

  
I decided to go ahead and split things up a bit so that I could test the
upload through GML and make sure things were working. GML uploaded everything
I gave it fine, but it is kind of slow, and GMail is even slower at displaying
the messages after they're sent. I am sure this has something to do with the
sorting and scanning (for advertisement targeting, more info below), but it is
kind of annoying. I am really paranoid, so I keep track of the number of
emails I uploaded, and I don't start uploading a new batch until I've
confirmed that all the mail from the pervious batch arrived. Thus far,
everything seems to be working fine, albeit a bit slowly.

  
As far as Mark's GML is concerned - it is a nifty little program. Two things,
though. Most importantly, the emails that you upload to GMail will be
timestamped when they actually arrived at GMail, not when they were initally
received. This is kind of annoying, since I would prefer everything to be in
order, but I don't think it's Mark's fault - I think it's a limitation in the
way he has to interface with GMail right now. Maybe once GMail goes live,
there will be a better way to import old email. I am keeping my imported mail
under a special label just in case I want to delete it and reimport it later.

  
Second, GML is written in Python, which is **really cool**. Despite this,
though, it uses TK instead of wxPython - what is Mark thinking?!

  
Well, let's get back to the GMail specific stuff, before I lose those of you
came here for a GMail review completely.

  
### Organizing Your Mail
  
GMail offers great search capabilities, yes, but you'll probably want to be
able to sort your mail in some way. Traditionally, this has been done with
Folders, which mirror the file system setup by allowing you to place emails in
a heirarchical structure. GMail's sorting method is done through Labels. Every
message can be labelled multiple times, and then recalled easily by sorting
based on the labels. It's very cool, since there are many times when emails
fit into one or more categories. As an example of what labels are like, think
about this: A Ford Taurus is a car, but it is also a vehicle. If I search for
"cars," I want the Taurus to be found. But if I search for "vehicles," I want
to see the Cadillac Escalade and the Taurus. Just because the Taurus is a car
doesn't mean it stopped being a vehicle. Labels allow this multiple
classification, while traditional folders do not.

  
It is possible to delete mail from GMail, but it is discouraged. "Archiving"
is the preferred way of getting emails out of your inbox. Archived mail
doesn't display in the inbox, but can be labelled, and it always can be found
by selecting the "All Mail" category. If you'd prefer to delete messages, you
can move them to the Trash (More Actions -> Move to Trash), which is emptied
automatically every 30 days, or you can manually empty it if you'd prefer.

  
* * *
  
As is to be expected, GMail's search functionality is very good. It's also
fast, especially when compared to Outlook's horribly slow search function.
Searching email is pretty easy, though I wish the "Search the Web" wasn't so
close to the Search Mail button. If you prefer to further customize and refine
your search, simply expand the search options box and customize away.

  
### Filters and Spam
  
If you want to filter incoming mail automatically, GMail can do it. It's a
pretty standard filtering system that allows you to label email based on
content, sender, or other information. Filters are especially useful for
mailing list subscribers. You can choose to have email automatically archived
after it is filtered, or you can choose to have it kept in your inbox. Each
Label on the left shows how many unread emails are contained in it, so you can
quickly tell if a new filtered email arrived even if you choose to have it
automatically archived. (A note on the "archive" term. I understand what
Google is trying to imply, but I think the archive term is misleading. When I
think archive, I think, "Saved somewhere, but a pain to get to." In GMail this
simply isn't the case. Archived email is as fast to access and find as other
mail, it simply doesn't sit in your inbox any more.) One really nice thing
about the filter is that it lets you "run" it on the email already in your
account so that you can make sure the parameters you've set in the filter are
going to work properly.

  
GMail also includes an always-on automatic spam filter. It seems to do a
pretty good job, though it is certainly wrong every once in awhile. It has
made a lot more mistakes with the mail I have been importing from Outlook than
with my new mail. I am not sure why that is. It is easy to classify mail as
spam and vice-versa by selecting messages and clicking the appropriate button
(see the screenshot). I am not sure if these classification changes you make
are stored somewhere or affect the spam filter in any way. I'd like to think
that it does, and if GMail's using a Bayesian filter, it's likely. I'm sure
they probably have a database of known spam senders and use that in
conjunction with Bayesian filters. That's all just speculation of course. The
bottom line is, it works pretty well.

  
### Suggestions
  
GMail is currently in beta, and considering that, it's in pretty good shape.
There are several things I'd like to see in the "final release," so to speak.
Some of them I've already mentioned, but I'll include them here just so this
list is more comprehensive.

  
#### Spam Count Display (Now supported in GMail!)

Currently GMail doesn't display the number of spam messages in the spam box
like it does for the Inbox and Labels, even if the Spam box contains new
messages. I like to filter through my spam manually just to be sure there's
nothing there that got misclassified, and I'd like to be able to tell if there
are any new messages there without opening the spam section.

  
#### Accurate Message Count

Currently GMail displays the total number of conversations in a box, not the
total number of discreet messages. I'd like both, or at least a place where I
can toggle it on or off. Since I've been importing a lot of email, I'd like to
know how many messages I've got, not conversations. I think this would be
trivial to include, and would be very useful.

  
#### Conversations Toggle

I'm not sure if this would be too difficult to do, but I would like
conversation mode to be toggle-able. There are some types of email that it is
simply better to have messages as discreet items. It'd be nice if this could
be toggled based on labels, so some labels would have conversations and others
wouldn't, but I'd settle for a global toggle if I had to.

  
#### Name Display

I mentioned this earlier, but I'd like conversations displayed with full
names, and I'd like emails without the name field filled in displayed as
"address@domain.com", not just "address." I've put an edited screenshot to the
left.

  
#### Official Message Import Method

Mark's GML is a great solution, but because it forwards mail using SMTP, the
timestamps are all messed up. I'd like to see an official import mechanism for
GMail that solves this problem and might work a little faster. I think
allowing people to get their old mail in GMail will convert a lot more people
to using it full time as I plan to. It doesn't have to support PST files (in
fact, I'd rather it didn't), but MBOX support would probably be the best place
to start. I think that the server load might be pretty high when such a
service starts, as hundreds of people will be trying to upload hundreds of
gigs of email. So it might be best to have a sign-up system of some sort,
where you provide users with a window of time that they can upload email.
Basically, users would need to set up an appointment, sort of like setting up
time on a server farm. I'd gladly do that, especially if it meant I would get
faster upload service.

  
#### Simpler Label Removal (Added June 12, 2004) (Now supported in GMail!)

As it is right now, you can only remove labels from conversations by opening
up the label group and selecting messages within that context. I'd like there
to be a box that is basically the same as the "Add Label..." box, but removes
labels instead. Whenever messages are selected, no matter what the context,
that box gets populated with the labels that currently apply to the selected
messages, and by selecting a label from that box, the label is removed. It
might make more sense to do a different GUI design for this functionality,
rather than having two separate boxes, but there just has to be a simpler way
to remove labels - especially since I often mislabel emails and need to fix my
own mistakes.

  
#### Mailing List Delivery Options (Added September 22, 2004)

While I am very glad to see some of my earlier suggestions added (see above),
there is one absolutely horrendous "feature" of GMail that I just noticed
recently that is driving me bonkers. Luckily, I did find out that this is
expected GMail behavior, and I am not just being dumb. The problem is this:
When I send a message to a mailing list, my mailing list processor (MailMan,
for the record), modifies the subject and then sends a copy of the email on.
This subject modification is very useful for automatic sorting of mailing list
mail. Also, MailMan (and other mailing list managers, I'm sure) have an option
for every list subscriber that allows them to decide whether they want to
receive a copy of the emails they post to the list or not. I **always** leave
this option on, for several reasons. One, I want all mail from a list in one
folder (or in GMail's case, under one label). Manually moving my emails that I
sent into that folder/label is a pain. Second, I want to quickly search all
email with **[ipro305]** in the subject quickly - that's a fast way to only
search for IPRO mailing list mail. Yes, GMail offers superb searching
capabilities that would probably let me get around this, but frankly, I just
want to do it my way. The version of the emails that GMail saves (in my Sent
Mail label) do not have that subject modification. **Arggggghhhhh! **

  
Finally, this breaks one of my major rules of email - never _ever_ **ever**
deny a message without telling the user. MailMan is sending out the copies of
my email back to my account (I verified this) - GMail simply doesn't put them
in my box - anywhere. Apparently they're gone, because it is assumed that the
copy saved in my Sent Mail label is enough. I don't like server-side spam
filters for the same reason (if GMail automatically deleted mail it classified
as spam I'd be incredibly annoyed - sorting it and then letting me make
adjustments is OK though). If my account receives an email, it should be put
in my account **somewhere**, no exceptions. Here's hoping this gets changed or
can be disabled on a per-user basis at the very least.

  
### One Caveat
  
In case you haven't heard, GMail is ad-supported. This isn't all that
surprising, considering most free webmail services are ad-supported. GMail is
much more discreet than other webmail providers, though. See the screenshot to
the right for an example of GMail ads. These ads are displayed just to the
right of the email contents, and are in relatively small font, as you can see.
GMail's ads are also targeted based on the content of the email. This means,
of course, that the contents of the email is scanned automatically and ads are
chosen based on the content of them email. The example ads to the right were
displayed next to an email regarding Biblical scripture to be read at a
wedding.

Some people have expressed concern about the privacy of their email,
especially since GMail scans it. I guess I sort of understand where they're
coming from, but people need to realize that email is a very insecure medium
anyway, and that sensitive or private matters shouldn't be handled through
email. I believe Google when they say they're not seeing this info and that
it's all automatically done by their system. I also trust them to keep their
system secure so nothing is compromised. Google has some very talented,
intelligent people working for them, and they've given me no reason to doubt
them thus far. If you're interested in what the link "About these links" in
the screen shot says, go to
[http://gmail.google.com/support/bin/answer.py?answer=6603][17] and see for
yourself what Google says about the ads and their commitment to privacy and
taste.

  
### Final Thoughts
  
GMail is an awesome webmail system, even though it is still in beta. Even
without the features I requested above, it is still a very useable, very
comprehensive system. I am looking forward to continuing to use it for as long
as I can, and I hope to be able to completely switch over to it in the near
future.

   [3]: http://www.google.com/
   [6]: http://www.plaxo.com/
   [7]: http://jaybe.org/info.htm
   [8]: http://www.marklyon.org/gmail/default.htm
   [9]: http://people.freenet.de/ukrebs/dbxconv.html
   [10]: http://www.marklyon.org/gmail/cleanmbox.zip
   [17]: http://gmail.google.com/support/bin/answer.py?answer=6603
