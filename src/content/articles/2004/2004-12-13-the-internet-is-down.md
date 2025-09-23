---

title: The Internet is Down!
date: '2004-12-13T22:30:00-08:00'
slug: the-internet-is-down
engineer:
  slug: the-internet-is-down
  url: /2004/12/the-internet-is-down/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2004/12/the-internet-is-down/

---

If you've been at [Illinois Tech][1] this week, you've had the absolutely
wonderful opportunity to see what carnage a Denial of Service attack against a
core DNS server can create. Now, I honestly don't know much about network
infrastructure or the mechanics behind a Denial of Service attack; frankly, my
passion is software, not hardware, so I've never sought out the knowledge.
(Unfortunately, [HowStuffWorks.com][2] doesn't have anything specific on DoS.
They do, however, have articles on [routers][3], [firewalls][4], and
"[Internet Infrastructure,][5]" for those that want to learn more about the
hardware that makes the Internet work.) But despite my lack of knowledge, this
past week has been an excellent chance to experience the effects a DoS can
cause.

  
A DoS **destroys** your ability to use the network -- much moreso than I ever
thought possible. For my own sake, I am going to write a little bit about what
I've seen and make some conclusions about what went wrong, and even try to
suggest possible solutions that we can implement to solve things in the
future. But before we start, a little disclaimer. The network people here at
IIT are not the most apt people in the world, but they're not the most inept
either. We do have some truly brilliant people around here, but frankly, they
don't get recognized or listened to nearly enough. So before you start railing
on the fact that if **you** were a network engineer here, this never would
have happened, let me say this: the main problem I have seen this past week is
not a lack of technical experience, knowledge, or anything like that; the
problem is a **lack of communication.** I cannot stress that enough. So let's
get started.

  
On Sunday evening, Felix, one of our network engineers, noticed an inordinate
amount of traffic to random ports and stuff, and suspected a worm or virus had
made its way onto the network. In an effort to contain the attack, he blocked
the MAC addresses of 160 computers with the highest traffic on the network at
the time, effectively banning **all** network traffic from those people. The
thought was that this would diagnose the problem -- block the addresses, watch
things go back to normal, then go through the PC's that were blocked and
figure out what worm or virus had caused the problem, fix it, and reopen the
network.

  
Problem was -- blocking the addresses didn't fix the problem. In fact, it got
worse. The DNS server started going down, and then finally went kaput
altogether. This effectively knocked out internet access for all of campus.
The internal network still worked, and some cached DNS entries still resolved
all right, but most people were locked out. Here at the Support Desk we got
back up and running for awhile by switching to an external DNS, but we
couldn't exactly tell the whole campus to do that, because it wouldn't have
solved the root of the problem. Eventually, because of the bogus traffic that
was being spit out from our network and our DNS server, our own ISP blocked
our DNS server.

  
This is where things started to go downhill -- fast. Felix provided us with the
list of blocked MAC addresses initially, but by the time the DNS went down,
which was late Monday afternoon, that list was out of date. On top of that,
because of the rampant random network issues, we couldn't tell a customer what
was wrong when they called. They might be blocked, they might not. It might
just be the random DNS problems, it might not. We had still not been provided
with a process through which people could get checked and unblocked if
necessary. Thus, problem number one:

**1) We at the Support Desk were not provided with information, sketchy or
otherwise, to tell people when they called.**

So we started telling people whatever we knew -- there were network issues,
there were some people with blocked MAC's, we didn't know when things would be
back up. It is useful to remember that at this point, OTS had no idea what the
problem was (the DNS server was the _problem_, but it had been brought down by
the DoS attack, which hadn't been identified yet), and no information had been
sent out to the IIT community. Hence, problem number two:

**2) OTS was extremely slow at getting public information out to the IIT
community, and when they did, provided it via unreliable methods (email,
mainly).**

Yup, most information went out in the form of emails, which is certainly a
valid form of communication, but it shouldn't be the only one. But more on
suggestions later...

  
As the week dragged on, and more and more customers became agitated from a
lack of information and a seeming lack of action on our part, things just got
worse. Apparently, there was much debate about the actual cause of the problem
was. Virus scans and other searches had revealed nothing on many of the
blocked PC's, except a small VBS worm that remained under most virus scanner's
radar. One camp held that there was just a problem with the DNS server -
something was wrong with it. The other camp held that we were under an attack.
One -- it's our fault, two -- it's not our fault (at least, not directly).

  
It was suggested at this point that we remove the DNS server and replace it
with a fresh one, which would make the choice between the two theories simple.
But, for some unknown reason, this was resisted for quite some time.
Eventually, a new DNS server was put in. It lasted 30 minutes. It was clear we
were under attack. Thus, point number three:

**3) When DNS went down, it should have been replaced immediately. That
would have made it clear from the beginning that we were under attack.**

During all of this hullabaloo, we at the Support Desk remained ignorant of any
information regarding the problem, its causes, and what OTS was doing to
resolve it. The calls we received were getting angrier and angrier as final's
week loomed closer and they still couldn't get to their course websites, or do
research, or browse the net to relax, or anything. In addition, we didn't have
an updated MAC block list, which had been changed (at one point it got to 400
MAC's) several times at this point. Points numbers four and five:

**4) The Support Desk was not provided with up-to-date information (such as
updated MAC block lists) that would have assisted them in diagnosing the
problem(s), and cut down the workload on other OTS divisions, and maybe, just
maybe, would have left customers feeling a little happier about the state of
things.**

**5) When OTS Communications went out, they were overly vague and seemed to
take forever to write. Communications went out with information that seemed
out of date as a result.**

Well, those are the main points. The core problem was a lack of communication
and information-sharing amongst departments. If the Support Desk is a voice
for OTS, then we have to know what to say, and we simply weren't provided with
any information. Also, (and this really bugs me) the OTS communications just
told people to call the Support Desk if they had a problem, presumably to get
more information, but we didn't have anything to tell them. So these were the
problems, now what about solutions? Here are my thoughts, for what they're
worth.

**Provide the Support Desk access to information such as MAC block lists.
The info has to be _up-to-date_, otherwise it's not really useful.**

  
This seems to be a no-brainer to me. If we're going to be sending out emails
that say, "Call the OTS Support Desk for assistance in troubleshooting your
network access," then the Support Desk has to have up-to-date information
about it. If people are going to be calling with their MAC's, we can't be
looking at a list over a week old. In fact, it was just this morning that we
finally got the updated list, _after_ it had grown to over 400 people and
shrunk back down to about 25.

**Make one person responsible for communicating with the students.**

  
By this, I don't mean that one person should be taking calls with problems.
That's the Support Desk's job. What I mean is that one person should write the
communication emails, and should be responsible for getting accurate
information from the appropriate people to send out. The process would be as
follows: Network goes down... Communicator calls Networks, finds out problem X
is the cause, gets an ETA... Communicator sends out email information, and
makes arrangements to notify via other means. See below. The more I think
about this, someone at the Support Desk should have this responsibility. But
it should only be one person.

**Communication should be done through a variety of means.**

  
In this instance, email was, and usually is, the primary form of
communication. But we need to send out voice mail to faculty, put up flyers in
MSV and SSV, and, dare I say it, **hold a press conference**. This isn't
always necessary, but in this case, it would have been nice if students could
have gone to a public meeting one evening in the MTCC auditorium or something,
heard a brief statement about what the problem was and what action we were
taking, and had a chance to ask questions and get some straight answers.
People who aren't in the dark are less likely to make up their own
explanations for why something went wrong. Ending speculation can help end
angry customer calls.

I guess that's really all I have. This week has been trying for all of us here
at OTS, but I hope that maybe the staff here will learn from this experience
and make it better the next time this happens. But of course, I am just a
lowly peon here, so what do I know?

  
By the way, for anyone that cares: **The problem was caused by some (like
8-10) PCs on campus getting hacked (externally, internally, who knows) and
participating in a DoS attack against the DNS server. The problem now seems to
have been contained, and about 25 people still remain blocked.** Yeah, DoS
sucks, but it is kinda cool to realize that 8-10 machines can destroy a
network connection serving a university of 3000 people. _Kinda_ cool.

   [1]: http://www.iit.edu (The Illinois Institute of Technology homepage, the virtual home of the distinguished learning institution I call my own.)
   [2]: http://www.howstuffworks.com (Find out how stuff works!  Go on, learn a little!)
   [3]: http://computer.howstuffworks.com/router.htm (How routers work.)
   [4]: http://computer.howstuffworks.com/firewall.htm (How firewalls work.)
   [5]: http://computer.howstuffworks.com/internet-infrastructure.htm (How the internet works.)

