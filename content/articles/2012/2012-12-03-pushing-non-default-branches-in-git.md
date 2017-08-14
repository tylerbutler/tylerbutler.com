---

title: Pushing Non-Default Branches in Git
date: '2012-12-03T15:53:00-08:00'
via: Mark Longair
tags:
- git
engineer:
  slug: pushing-non-default-branches-in-git
  url: /2012/12/pushing-non-default-branches-in-git/

---

Learning new things every day... Mark Longair describes some [sitations in which `git push` won't do what you want or expect](http://longair.net/blog/2011/02/27/an-asymmetry-between-git-pull-and-git-push/):

> So, what happens when you want to push your changes back to the upstream branch?  You might hope that because this association exists in your config, then typing any of the following three commands while you’re on the `add-menu` branch would work:
>
> 1. `git push github add-menu`
> 2. `git push github`
> 3. `git push`
> 4. `git push github HEAD`
>
> However, with the default git setup, *none* of these commands will result in `new-feature2` being updated with your new commits on `add-menu`.  What does happen instead?

He's got a very good description of why this doesn't work like you might expect as well as an overview of options to get things configured the way you want.

<!-- more -->

I hit up against this today. I use both private git repositories on my own server and repos on GitHub to publish and share the code more broadly. The repo in question has a `dev` branch which I periodically push to GitHub, but the GitHub version of the branch lags a bit behind my own private repo (so I can do things like `git rebase` without breaking people). The way I manage this is with a local tracking branch tracking the remote `github/dev` branch that I fast-forward when I am ready to share something more widely. That local tracking branch is unsurprisingly called `github_dev`.

Anyway, I made an update to the `github_dev` branch today and wanted to push the changes out, and of course `git push` didn't do what I expected. I ended up changing my `.gitconfig`, adding the following lines:

    :::text
    [push]
        default = upstream

That's the option that makes the most sense to me personally, but I understand that pushing all local tracking branches when you haven't specified a refspec is likely confusing to most people, especially those without git experience.

In fact, it appears as though the git developers agree: the default in version 1.7.11+, according to Mark, is a new mode called `simple`, which is similarly *not* what I want since it still requires the local branch and the upstream branch names to match, but it seems a reasonable compromise and the most likely to just 'click' for new/inexperienced users.
