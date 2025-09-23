---

title: Ten Things Steve Bennett Hates About Git
date: '2012-08-05T15:08:00-07:00'
teaser: true
link: https://steveko.wordpress.com/2012/02/24/10-things-i-hate-about-git/
via: Jeff Atwood
vialink: https://twitter.com/codinghorror/statuses/231982243109822464
slug: ten-things-steve-bennett-hates-about-git
tags:
- git
engineer:
  slug: ten-things-steve-bennett-hates-about-git
  teaser: true
  url: /2012/08/ten-things-steve-bennett-hates-about-git/

---

For whatever reason, I've seen this relatively old article from Steve Bennett linked to by several people over the last day or so. It's definitely worth a read, and I agree with a lot of it. But I think Bennett misses the mark in a few places.

First, the things I agree with:


## Yes, the command line and official Git documentation suck.

I've [complained about this before][git post]. Software engineers like to believe that if we know how to do one thing, then we can work out how to do all similar things quickly by applying that knowledge. After all, software engineering is advanced problem solving and critical thinking, so applying previous knowledge to current problems is something we're pretty good at.

Frankly, the Git command line breaks this all the time. Some commands need some flags; others don't. Conceptually similar operations require different top-level commands (not just flags) depending on what you're doing that operation on.[^1] It's madness, and I think it's safe to say that the command line isn't *designed*; it's merely *implemented.*

<!--more-->

Similarly, the documentation sucks. I have found that a major challenge with documenting an application, even [one whose primary interface is a command line][Engineer], is documenting things for both a *user* and a *potential contributor*. With [Engineer][], I try to keep the two types separate, but it's a challenge. Arguably open-source software tends to have this problem more -- or at least it's more publically evident[^2] -- since the point of the software is two-fold: to be useful to users, and to attract additional developers to contribute.

In Git's case, the official documentation seems to be more focused on potential contributors, or at least people who've dug in enough to learn Git internals. But it's hardly consistent, even when viewed through that lens.


## Yes, the Git conceptual model is complicated.

And yeah, unfortunately eventually you're exposed to all of it. And yeah, it sucks. As I've [said before][git post], "I think part of the problem I have with Git, though, is that is often *does* feel necessary to understand how it works."

Personally I think this can be addressed with better visual tools rather than using the command line itself. For example, as I pointed out in my previous comparison of Mercurial and Git, the stage itself is abstracted away by many Git tools:

> I do not understand the allure of the stage. Given how easy Git makes branching, and how straightforward it is to commit, ammend the commit, `rebase` branches, rewrite history with interactive `rebase`, etc. what exactly is the advantage of the stage? Most tools don't even expose it -- it's just there behind the scenes -- so I'm not sure why people make such a big deal about it all the time.

That said, the sheer volume of things you can *do* with Git make it extremely frightening to unfamiliar developers, and since no Git tool does *everything* Git does, eventually you end up needing to use the command line for something, and you're right back at square one.

Now let's talk about the places where I disagree with Bennett.


## Git is not "unsafe version control."

OK, this is blatant emotional manipulation. "Git is unsafe!" "Git will eat all of your code and you'll never ever be able to get it back!" "Arghhh! Run for the hills!" Come on. I read a headline like "Unsafe version control" and I feel like I am watching an 11 o'clock news report about "Escalators: The silent killer."

In his [Google tech talk](http://www.youtube.com/watch?v=4XpnKHJAok8), Torvalds talks a lot about the fact that Git's decentralization means that often changes you might have eradicated will still exist in another person's clone of your repository. OK, fine, that's true, (and can be a good or bad thing depending on one's perspective) but I don't think that relying on there being another clone with changes that you care about puts many people's minds at ease. In fact, I would say fairly confidently, though I don't have any data to back this up, that the lion's share of projects stored in Git do *not* have a great volume of clones sitting on computers around the world. Relying on other people's clones is not good backup practice in my opinion.

However, Git has a *ton* of safeguards in place to prevent you from doing damage. First, if you don't push, no one even sees your mistake. Second, if you try to push, Git by default won't let you if you have divergent changes (as you will if you do a `rebase` in many cases, for example). You have to explicitly tell it to force push in that scenario. Those are two rather silly examples, but there are others. The reflog itself can help you correct damage you've done.

I think it's fair to say that it's easier than it should be to get in a state you don't want to or didn't expect to be in, but it's unfair to say that those are unrecoverable situations. I also think that one's feelings about Git's behavior has more to do with one's past experience than it does with Git itself. I'll get back to that notion in a moment.


## Comparing Git to Subversion or CVS directly is dangerous.

It wasn't until his tenth and final point that I really understood why Bennett is getting hung up on some things:

> The point of working on an open source project is to make some changes, then share them with the world. In Subversion, this looks like:
>
> 1. Make some changes
> 2. svn commit
>
> If your changes involve creating new files, there’s a tricky extra step:
>
> 1. Make some changes
> 2. svn add
> 3. svn commit
>
> For a GitHub-hosted project, the following is basically the bare minimum:
>
> 1. Make some changes
> 2. git add (not to be confused with svn add)
> 3. git commit
> 4. git push
>
> Your changes are still only halfway there. Now login to GitHub, find your commit, and issue a “pull request” so that someone downstream can merge it.

Ummm, OK... I'll forgive the conflation of GitHub with Git -- they are *not* the same thing -- because, hey, most Git code in the world today is probably hosted on GitHub in some fashion. But this comparison is fundamentally flawed. Look, we're working with a decentralized system. In the old world, committing and sharing were analogous, because it wasn't possible to decouple the two actions. Now it is. That brings with it tremendous value and flexibility. But it does mean that there are two separate steps:

1. Writing/committing/adding/merging/blah blah blah code.
2. *Sharing* that code with other people.

You absolutely must understand that Git (and Mercurial) are not centralized systems. They just aren't. They weren't meant to be. I believe that the decentralized model is better, but if you don't, that's fine. But the danger in comparing a centralized system to a decentralized one is that fundamental assumptions about behavior can't be made. *Of course* Git doesn't automatically throw your changes up for the world to see the moment you commit them. You haven't said they're ready to share.

Now admittedly this is more steps than the Subversion model -- if your intent is to immediately share all code you commit. That feels so incredibly dangerous to me that I would freak out a little bit if working on a system like that, but... that's just me.


## Let's talk about defaults.

In software design, we think an awful lot about so-called 'intelligent defaults.' The default settings of an application should work for 80-90% of users' needs. Fewer settings = fewer choices = better experience. This applies just as well to a command line application as it does to an app with a GUI.

But choosing intelligent defaults is incredibly difficult, even when your application's purpose is narrowly scoped. In the case of version control, as Bennett points out, there are myriad different ways to handle your development process. While some of that is informed by your VCS, ideally you'll be able to make your VCS match your process, not the other way around. Mercurial actually has [an overview of some of the common models](http://mercurial.selenic.com/wiki/MultipleCommitters) and how Mercurial can be used within them.

So with this in mind, Git has an impossible problem, because the nature of development is that *there is no one way to do things.* Heck, one of the reasons Torvalds wrote Git (beyond the Bitkeeper issues) is that the current VCS solutions didn't meet the needs of the kernel development process.

Whatever defaults Git chooses (even if it miraculously became consistent overnight, which it won't because of that nasty little thing we all despise as engineers but continue to care about on our users' behalf called 'backwards compatibility') won't be appropriate for a lot of -- possibly a majority of -- projects. And since you, the new contributor, don't have a lot of say in how the development model of the project works, you don't have a lot of say in how Git -- or Subversion, or Mercurial, or whatever other VCS -- is used there either.

"But couldn't they add a mode to Git that would emulate Subversion for SVN users and Mercurial for Mercurial users etc. etc," you might say? Perhaps, though [I'm not sure it would work out that well][expert mode]. [Easy GIT](http://people.gnome.org/~newren/eg/) seems like an effort for Subversion folks that's worth looking at more deeply, but its mere existence serves as proof that the notion of 'intelligent defaults' depends a heck of a lot on your perspective.

Having written all of this, I think Bennett has an excellent point when he writes -- in [his reponse to a comment](https://steveko.wordpress.com/2012/02/24/10-things-i-hate-about-git/#comment-82):

> The annoying thing about VCS, compared to say, an editor, is that the basic rule of “if you don’t like it, use something else” doesn’t apply. (So in my case, since I never start open source projects, I’ll never get to choose a Git alternative.)

That truly is a problem. You have to play by other people's rules if you want to join their game, which means you have to learn -- or relearn -- some things. I personally welcome learning new things as a general rule, but perhaps I am unique or unusual in that regard.


## Git history is *not* a bunch of lies.

First, let me disclose my bias here. I am **sick and tired** of this 'indelible history' idea that people seem married to. When your mom asks you what you did this weekend do you tell her that you hooked up with two chicks from the bar for a drunken tryst? Do you go into great detail about the depths of depravity you participated in that night? Probably not. The 'radical honesty' thing, when it comes to source history, is detrimental. Some 'lies' are useful.

Likewise, I don't need to expose you to my mental process for development. I've said before:

> I am *all over the place* when I code. While I believe that source history should be the *'truth,'* I also think that above all, it should be as easy to follow as possible. Commit messages are an important part of this, of course, but cleaning up your local history before you share it is critical too. You can go back through and tie up loose ends, remove unnecessary code changes you made, etc.

If I'm writing an article for tylerbutler.com, I write write write write write. Then I take a break and I edit. And I repeat that process until I think things are in good enough shape to share with people. Obviously I'll make some more edits after I've shared it if I or others find flaws after the fact. But if I missed a comma before I shared the article, you don't need to know about it. Similarly, I don't sit here at my desk in fear, never hitting Ctrl-S, because I'm worried that everything is not *just right* and delaying saving my work.

But in the centralized VCS world, that's what writing code is like, because there are two intents implied by committing. One, that the change is sound, and two, that the change is ready to be shared with everyone. If every time I saved a draft article it went live immediately on my site it would dramatically change the way I write. I wouldn't save very often. I would save my work somewhere else then copy it to the site when it was done. I would essentially work around the save-goes-live-immediately system because it's dangerous. Or worse, I would work within its bounds and *never* save until everything was perfect, risking an awful lot of lost work.

I *love* `rebase`, and the interactive variety, specifically because it lets me 'save' often with the ability to edit my insanity after the fact. It let's me vomit out ideas then clean them up later. Am I the only person in the entire world that works this way? Sometimes I definitely feel like it.

Now, you can argue that for my use-case patches are a better solution, but I prefer just committing them directly to Git for a very simple reason: I can push the changes. "But wait!" you'll say. "Pushing half-baked changes is what you're trying to avoid! Haha! You're such a hypocrite!" Well, no, not exactly. I said I don't want to *share* half-baked changes. And I know it's a little crazy, but sharing and `git push` are not the same thing.[^3]

See, I develop on several different machines in several different locations. Try as I might, I can't always complete a piece of development on a single machine. So I need to synchronize my in-progress work. One way to look at it is that I need to share with myself.

Sharing with myself is different. There are different rules and different intentions. Git lets me do this easily by having a separate repository clone that is all mine. This is one thing I think GitHub could make a lot better, but as it stands I have my own Git repositories on [WebFaction][], and I push to them whenever I want. They're mine. And my changes follow me anywhere I go (sort of -- there are some problems I have which I'll get into another time). But when I'm ready to *share* my changes -- not push -- then I `git push` to the central shared repository. And you don't know -- nor should you even care -- that I made those changes over the course of three days on six different machines. By the time the changes get to you, they're tidy, they're tightly scoped, and they're easy to understand. Do you *really* not hold other developers to that same standard?

Version history is absolutely important. When working with a group of developers, it's essential. But while I can't promise that I'll always share perfect and bug-free code with you, I *can* promise that I won't expose you to the insanity that is going on inside my head, and in the code-base, when I'm coding up a fix.

At this point I have digressed quite a bit. But let me leave you with one final thought, given that it seems several of Bennett's issues stem from his centralized VCS background:


## As a developer you **must** learn to use decentralized version control systems.

There is no excuse. It is a basic tool of your profession. Few carpenters get by without learning how to use a lathe; you can't get by without understanding DVCS. I don't care if you love SVN, or you use TFS at work, or you think Git is terrible because its command line is an exercise in insanity. **Learn something.** Mercurial is fine. Git is fine. Heck, even Bazaar is fine as far as I'm concerned. But, for just a moment, forget everything you know about version control and get a grasp of some of the basic concepts of DVCS.

Joel Spolsy's [Hg Init][] site is a good place to start. Yeah, it's Mercurial-centric, but that's fine. The concepts are similar to Git or any other DVCS. And if you like what you see, perhaps you'll try using Mercurial instead of Git. That's OK too. For the brain-damaged among you, Joel even has [a section](http://hginit.com/00.html) for folks with a Subversion background:

> It turns out that if you’ve been using Subversion, your brain is a little bit, um, how can I say this politely? You’re brain damaged. No, that’s not polite. You need a little re-education. I walked around brain damaged for six months thinking that Mercurial was more complicated than Subversion, but that was only because I didn’t understand how it really worked, and once I did, it turns out—hey presto!—it’s really kind of simple.

> So I wrote this tutorial for you, in which I have been very careful not to explain things in terms of Subversion, because there is just no reason to cause any more brain damage. The world is brain damaged enough. Instead, for those of you who are coming from Subversion, I’ve got this one chapter at the beginning that will try to reverse as much damage as possible so that you can learn Mercurial from a clean slate.

The future is waiting. Go meet it.



[^1]: Bennett uses this example, which is apt:

    > To reset one file in your working directory to its committed state:
    >     git checkout file.txt
    > To reset every file in your working directory to its committed state:
    >     git reset --hard

[^2]: I *know* that closed-source software has this same problem. How do you bring a new developer up to speed on the codebase? Every software development shop has to solve that problem *somehow.* However, in those cases, the problem is not publically evident since we, the public, don't see the 'internal developer documentation,' if it exists.

[^3]: In fact, I've thought about trying to wrap my development process in some scripts, sort of like git-flow, but it's likely overkill. I find it hard to believe I'm the only person in the world that works this way, but maybe I am. No other developer codes on more than one machine? Goodness gracious.

[git post]: /2012/06/git-vs-mercurial-again/
[Engineer]: /projects/engineer/
[expert mode]: http://blogs.msdn.com/b/oldnewthing/archive/2003/07/28/54583.aspx
[WebFaction]: http://www.webfaction.com/?affiliate=tylerbutler
[Hg Init]: http://hginit.com
