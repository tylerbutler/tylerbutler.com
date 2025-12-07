---

title: Git vs. Mercurial (Again)
date: '2012-06-10T17:57:00-07:00'
teaser: true
slug: git-vs-mercurial-again
tags:
- git
- mercurial
engineer:
  slug: git-vs-mercurial-again
  teaser: true
  url: /2012/06/git-vs-mercurial-again/

---

*Note: I've actually had this sitting in my drafts folder for awhile but with the recent release of [GitHub for Windows][githubwin] it seemed like a good time to get my act together and post it.*

## The Beginning

My first experience with true source code management was with CVS. I was in college, and the HawkTour project was going into its second semester. It was becoming clear that with a new batch of undergraduate students coming in the next semester we needed a solution to keep everyone from Hulk-smashing their way through the code wreaking havoc and bringing general chaos.

The Unix server we used had CVS installed, so I learned the ropes then gave new students a crash-course in using it, as well as how to check things in and out using the Eclipse addins. This was the first time almost every student I encountered had used any source code management software, which in retrospect is a travesty. I *really* hope college courses include source code management tools these days.

<!--more-->

Fast forward a couple of years... I got out of college, started my career as a PM, and promptly stopped worrying about source code management. I mean, I had to worry about it insofar as I needed to understand what core developers were talking about ("*This* branch" and "*That* branch" and "No we can't merge yet because of the children. Think of the children!" and... well, you get the idea) but it wasn't part of my daily routine.

## Git: Attempt 1

Then in 2008 [GitHub][] popped onto my radar, so I meandered over to see what the new hotness was and wound up poking around with Git (or is it git? I can find no firm consensus about whether it's supposed to be capitalized) for awhile. I had a bunch of old code from long-forgotten projects that I resurrected to test it out. At this time, Git on Windows was a horrid experience (and given the current crappy state of affairs you can imagine just how bad it was), but I braved it anyway. I created my Git cheatsheets and memorized arcane command line craziness and *used it*. And it was fun. And powerful. And very much better than CVS.

Now, [Linus might consider me an idiot][linus], and I no doubt am by his standards, but look people, *Git is not easy.* Say it with me again: *Git is not easy.* And Git on Windows is even harder -- this is still true today.

Hardcore Git zealots strike me as sort of like your neighbor who's always trying to get you to drive a standard (or manual for the true Yanks) transmission car and change your own oil. "You'll save so much cash, man!" "You have so much more control on the road, dude!" I get that it's good to know how things work, and that a high degree of control has a lot of benefits, but frankly, sometimes I just need to *drive somewhere*.[^git1]

This attitude is why many Git guides and tutorials start with stuff like how the index and the reflog work and what garbage collection is etc. etc. For example, see this [humorously titled guide by Charles Duan](https://www.sbf5.com/~cduan/technical/git/). Tommi Virtanen's [Git for Computer Scientists](https://eagain.net/articles/git-for-computer-scientists/) is a similar example, though I give Virtanen a pass since the guide's explicit goal is to explain how Git works internally, not how to *use* Git.

I get why that stuff is important -- and useful, potentially[^git2] -- but that approach is sort of like teaching someone to drive by first explaining how the engine works. It's simply not necessary to use the car.

I think part of the problem I have with Git, though, is that is often *does* feel necessary to understand how it works. Remember this notion; I'll come back to it later.

## Mercurial To the Rescue! (Or Not)

After quite a long break from coding, I started up in earnest again at the end of 2010 when I started teaching high school web design as part of the [TEALS][] pilot program. I had a bunch of sample HTML and CSS and lesson plan stuff and it made sense to get it all in source control.

So I checked in on Git, and Git on Windows was still painful. Or, I should say, too painful for my tastes. Anything that calls Cygwin a prerequisite is not set up for success in my book. That, in short, was what prompted me to try Mercurial for the first time. Well, that and the fact that Mercurial is written in Python, and the fact that [Kiln][] had just come out so I felt like I could rely on there being a solid GitHub alternative for remote repositories.

And Mercurial was fun. And powerful. And very much better than CVS. And TortoiseHG was (is!) a relatively elegant tool that works well in Windows. Life was good. I discovered the beauty of MQ and patch queues. I started using BitBucket because, well, it was just like GitHub, right? (And at the time Kiln didn't have public repositories.)

But something never quite 'clicked' for me about Mercurial -- branches. Or, to be more exact in Mercurial terminology --  *named* branches. Mercurial has them, but they're not like Git's. In fact, they're such different concepts that most articles comparing the two systems actually use different names for them. So it's a bit unfair to compare them directly. Mercurial's bookmarks are a better counterpart to Git's branches, but I digress...

Anyway, the guidance from Mercurial-land is that named branches are meant for long-lived things like a dev branch or a release branch. Steve Losh has a great overview of all of the [branching options in Mercurial][losh], including bookmarks that I just mentioned, but if you want to just play around for awhile on a new idea then save it for later you do not create a named branch. You might create a bookmark, you might use a separate clone, but you don't use a named branch. *So sayeth the powers that be.* In reality, you *can* create named branches (as Steve points out), and you can close them when you're done with them, but in Mercurial those branches stay as an indelible part of the source history (or the metadata at least), which feels messy to me.

Now, there's absolutely nothing wrong with this model. It works wonderfully for many people. It is arguably simpler, though I do not personally believe that to be the case.

I think that depending on which branching model you wrap your head around first, the Mercurial way either feels right or feels wrong. In my case it feels wrong. It doesn't work well with the way that I work. I am *all over the place* when I code. While I believe that source history should be the *'truth,'* I also think that above all, it should be as easy to follow as possible. Commit messages are an important part of this, of course, but cleaning up your local history before you share it is critical too. You can go back through and tie up loose ends, remove unnecessary code changes you made,[^git3] etc. Keeping your changes separated is critical in making this 'clean up' possible.

### Anonymous Branches

In my attempt to have multiple in-flight changesets, I first tried the anonymous branching approach, which isn't possible in Git but works well in Mercurial. But then when I'd try to push I'd get warnings that I was pushing new heads. Well, yeah, of course. And while I know that I can do that safely when I'm just pushing to a remote repository for myself (to work on in-flight changes on multiple computers, for example), it creates a huge hassle when I am finally ready to push to a shared repository. "Oh, oops, I have some unmerged changes from failed-but-not-quite-ready-to-give-up-on-experiment #37 that everyone's going to get if I push in this state." Yuck.

### Patch Queues

The next approach I tried was a patch queue. Yeah, I'd just manage every change as a patch. It worked for the kernel guys for years, right? Except that *really* turned out terribly. If you only want to have a single patch queue, then everything needs to be 'in order.' It's a queue, so each patch applies successively. And that works OK for awhile, but eventually I wanted to work on two totally divergent things at the same time and switch back and forth periodically.

So *then* you start thinking that you just need *multiple patch queues*, one for each feature. This is getting ridiculous, but whatever... I'll try it. You know what? It *is* ridiculous. You know those great tools I mentioned earlier, like TortoiseHG? Yeah, they don't work so well at managing multiple patch queues. Thus, one of the major reasons I switched to Mercurial -- superior Windows tools -- was eroded. Also, this complexity has a nasty side-effect: it discourages the very thing that DVC systems are meant to help with, namely not committing your changes often enough.

In the single patch queue world, you tend to just update the same patch all the time, so you don't get the benefits of true source history. If you don't take that approach, then you have to remember which patches in the queue 'go together' so you can apply them up to the right point. (And do not think for second of using a versioned patch queue. Yes, it can potentially alleviate this problem. But it's a mind-bender to keep remembering how everything fits together: I first need to refresh my patch, then commit *on the patch queue repository* to save my changes for posterity. The level of indirection is too high to be truly useful in my opinion.) If you use the multiple patch queue option the switching costs of changing between the feature 'branches' you're working on cause different, but equally bothersome, problems. All in all, these workflows just didn't work for me.

That *'for me'* is very important. *You* should definitely try Mercurial, especially if you're struggling with Git. I definitely miss some things about it (MQ in particular, though `rebase` works pretty well for most things), and you no doubt work and think completely differently than I do. It might 'click' for you in a way that it doesn't for me, and if Git's complexity or something is preventing you from using source control, then please please *please* try Mercurial. You absolutely should be using source control.

## Git Back

So... right now I'm back on the Git bandwagon. And, truth be told, the Git on Windows world has gotten a lot better recently. In fact there's even a [portable version][PortableGit] that you can install on your USB key. And (yay!) Cygwin isn't necessary.

But it's not all sunshine and daisies. Git still has a crazy command line interface. It's confusing. There are all kinds of posts online like [this one][1] that illustrate how even seasoned Git users forget commands for *basic tasks*. Deleting a remote branch is a perfect illustration in 'WAT?' Yeah, it makes sense once you think about it, but that doesn't mean it's good or right.[^git4] I have a browser window open whenever I am using the Git command line just to look up the right command to do what I want to do. Do. Not. Like.

A lot of the [helpful scripts][gitutils] you can find to ease the command complexity are depedendent on bash or some other \*nix shell. Git for Windows does have a bash shell and even includes a handy batch file for starting it, but most of my life is lived in PowerShell, and I find I miss some of the commands when using bash. That said, you can configure Console2 to host the Git bash shell so I just open one up, use it *only* for git, and use other PowerShell tabs for most of my other work. (Note: if you take this approach, you can copy your scripts into the `/bin` directory in your Git folder and they'll be available at your Git prompts. You can also try [posh-git][], but again, those helpful bash scripts you downloaded won't be useable.)

## Adjustments

So now, having switched from Git to Mercurial and back, here are some of the differences that affect me personally.

- Pull and Fetch mean different things. In fact, they're kind of the opposite. This one has driven me nuts a few times, especially since I do still use Mercurial on at least one major project.
- I miss `hg incoming` and `hg outgoing`. Yes, there are corresponding Git scripts you can get but they aren't as nice IMO.
- I miss being able to use a substring of the command I want. For example, in Mercurial I could type `hg inc` instead of `hg incoming`. This does not appear to work in Git, at least not on Windows. Yes, I can create aliases. No, they're not as convenient.
- `git rebase` is very cool, and very powerful. Thus, it is dangerous, but a working knowledge of how to use it properly has led me to a multi-machine workflow that is quite good, and much better than my insane attempts as using MQ for the same purpose. I've since gone back and tried Mercurial's `rebase` command, and while it does let you do the basic rebase action of 'transplanting' a branch to be based on another branch, the interactive rebase isn't possible. For that you can use another Mercurial extension called [histedit][], but again, it just doesn't seem as polished as the Git counterpart. Wow, I can honestly say I never expected to write that something in Git feels 'polished' but `rebase` does.
- Creating named branches for everything is bliss. Pure bliss. This just completely 'clicks' for me. I create little branches for everything. Coupled with a repository viewer that visualizes the whole tree ([PyCharm][] actually has this built-in, but other tools such as [Git Extensions][] or even `gitk` have it as well) the branch names serve as little sign-posts about what I'm working on.
- Branches are awesome, but managing them is a bit of a pain just because the tools available can't do *everything*. Luckily, even when you think you've destroyed things beyond all repair and your work is gone *for good*, it usually isn't. Almost everything is recoverable. Git is nothing if not careful. I think it's situations like this that have caused people writing 'Guides to Git' to start by explaining the index and the reflog and the hashes and *how Git works*, because if you *do* understand that stuff, you can generally get yourself out of trouble -- or stay out of it altogether. But I think in the end that type of teaching leads to more confusion than clarity and causes more problems than it solves.
- I do not understand the allure of the stage. Given how easy Git makes branching, and how straightforward it is to commit, ammend the commit, `rebase` branches, rewrite history with interactive `rebase`, etc. what exactly is the advantage of the stage? Most tools don't even expose it -- it's just there behind the scenes -- so I'm not sure why people make such a big deal about it all the time.
- In Mercurial, you can have anonymous branches since your whole history is always 'visible.' In Git this is not true. If there's no name pointing to a head, it effectively doesn't exist. Now, this technically isn't true, but orphaned heads don't show up in any tools I've seen, and they're not easily accessed unless you happen to know their hash. And *eventually* they will disappear for good. The lesson here is just to be nervous about not having a branch pointing to something important. Until you feel comfortable with what you're doing, if you're messing with `rebase` or something, create some dummy branches pointing to your important commits so you'll have something to get back to if you really screw something up. Again, this is never truly necessary -- it's just for peace of mind and ease of recovery if you're new to Git.

This post is already incredibly long, so I'll save the rant about Git GUI tools for another time, but the `TL;DR` version is that they still <strike>suck</strike> leave a lot to be desired, at least on Windows. I was incredibly excited when [GitHub for Windows][githubwin] was announced, but I find it completely, mind-bogglingly, useless. It's a v1, so I have hopes it'll get better, but right now I'd have a hard time recommending anyone use it, even Git noobs. I think it has the potential to create a bunch of bad habits or, even worse, really messy histories simply because of weird merges and whatnot. I find it hard to believe it doesn't have a visualization of the whole Git tree. I mean, *that* is what makes Git understandable for a mere mortal like me. I'll have to give it some more time and try it out again to see if I can puzzle out what they're trying to do with the UI, but it seems a little *too* simple right now. But... like I said, that's a whole other post. `/sigh`

For now, I'm happy with the workflow and toolset I have (I'll share more details another time), though it's a bit rough around the edges and I have to pay a few too many visits to Stack Overflow just to get basic things done. But it works, it's fun, it's *very* powerful, and did I mention it's a lot better than CVS?



[^git1]: This analogy is somewhat flawed since I drive a standard-transmission car and firmly believe it is a skill every driver should have.

[^git2]: To be fair, the Git reflog has saved me from at least one very dangerous botched rebase. I wound up in a situation where the commit tree I really cared about was 'gone.' Really, what had happened is that all the *visible references* to it were gone. I managed to save the situation by digging through the reflog and getting out the relevant commits.

[^git3]: Come on, you've all seen a commit from *that guy* who always does some code formatting/style cleanup along with his changes you're trying to review. You can't tell without some effort what is really part of the meaningful change and what isn't since the cleanup changes obscure everything.

[^git4]: In case you've found your way here via a search engine and are in dire need of the actual command to delete a remote branch, here it is: `git push origin :branch-to-delete`. Oh, don't feel bad; I'm sure you would have figured it out on your own.


[1]: https://www.zorched.net/2008/04/14/start-a-new-branch-on-your-remote-git-repository/
[PortableGit]: https://code.google.com/p/msysgit/downloads/list?can=3&q=official+Git
[git-utils]: https://github.com/ddollar/git-utils
[github]: https://github.com
[githubwin]: https://github.blog/news-insights/the-library/github-for-windows/
[linus]: https://www.youtube.com/watch?v=4XpnKHJAok8
[TEALS]: https://tealsk12.org
[losh]: https://stevelosh.com/blog/2009/08/a-guide-to-branching-in-mercurial/
[gitutils]: https://github.com/ddollar/git-utils
[pycharm]: https://www.jetbrains.com/pycharm/
[Git Extensions]: https://code.google.com/p/gitextensions/
[Kiln]: http://www.fogcreek.com/kiln/
[histedit]: http://mercurial.selenic.com/wiki/HisteditExtension
[posh-git]: https://github.com/dahlbyk/posh-git
