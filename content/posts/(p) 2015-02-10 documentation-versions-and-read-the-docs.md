---

title: Documentation, Versions, and Read the Docs
timestamp: 08:45 PM Tuesday, February 10, 2015 PST
date: 2015-02-10T20:45:00-08:00
#status: published
#slug: documentation-versions-and-read-the-docs
tags:
- engineer
- documentation
#url: /2015/02/documentation-versions-and-read-the-docs/

---

Engineer is a side project for me right now. That means that while I am actively working on Engineer pretty regularly, releases themselves are not necessarily regular. I've adopted a repository/branch structure that's influenced by [git flow][1], so my main development branch is not *master*, it's *dev*.

* *master*: The most recent released version of the code
* *dev*: The in-development version of the code

[1]: http://nvie.com/posts/a-successful-git-branching-model/

Up until [Engineer v0.5.0][2], when you went to GitHub, you saw *master* by default.

When you go to GitHub, I want you to see the latest in-development version. The reason is pretty simple: Since official releases are fairly slow, but I actually make changes fairly often, I want to make sure that activity is shown on the GitHub homepage -- via the 'x days ago' text that shows up on the far right of the code listing. My hypothesis is that people make some judgements based on the activity level of project. If people are searching for a static site generator, and they come across Engineer, I don't want them to think that the project is abandoned and simply leave. If my default branch shown in GitHub is *master*, then it looks as though the project isn't under active development at first glance, which clearly isn't what I want. Thus, I want GitHub to display the *dev* branch by default, which is easy enough to change in the repository settings. I made this change along with the release of Engineer v0.5.0, so now when you go to the repository on GitHub, you'll see the *dev* branch by default.

[2]: /2014/05/engineer-v0-5-0-released/

There's still a problem, though, related to the fact that I host [Engineer's public documentation][3] on [Read the Docs][6] (RTD). Imagine someone finds my project on GitHub, likes what they see, and installs the release version using pip:

    pip install engineer

[3]: https://engineer.readthedocs.org/
[6]: https://readthedocs.org/

Seems to be the natural thing to do, right? If they click the link in Engineer's README to visit the docs at RTD, then I want them to go to the version of the docs that corresponds to the version they just installed -- the most recent released version.

Now this is also relatively easy to do. RTD actually has some smarts around [multiple versions of documentation][4]. RTD offers a few different settings that are relevant to my goals.

First, there is a baked in 'version' identifier called *latest* which is intended to point to the most recent version of your docs:

> In the normal case, the latest version will always point to the most up to date development code. If you develop on a branch that is different than the default for your VCS, you should set the **Default Branch** to that branch.

[4]: https://docs.readthedocs.org/en/latest/versions.html

Of course, in my case, development is done on the *dev* branch, so I want *latest* to point to that branch. Fortunately that's easy to change, as the second sentence above alludes to. In the *Advanced Settings* section of the RTD dashboard, you'll find a *Default branch* setting, in which I entered *dev*. Great; now *latest* points to *dev*.

The second setting of relevance in RTD is the *default version*. This controls what version of your docs `/` redirects to. By default this will be *latest*, but since I want `/` to always redirect to the most recent *released version* of Engineer, I changed this to *master*. Cool; now `/` simply redirects to the version of my docs from the *master* branch, which will always be the most recent released version.

There is, of course, still a problem. Ideally, I would like links that people follow to go to the version of the documentation that matches the version of the code they're coming from and vice-versa. In other words, I would like the documentation link from the README file in the *master* branch to go to https://engineer.readthedocs.org/en/master/, and the link in the *dev* branch to go to https://engineer.readthedocs.org/en/latest/.

Unfortunately, that's not really possible. Sure, I could build some intelligent redirector or something that would look at the referrer URL and redirect to the appropriate docs version, but that's not something I want to build anytime soon. The best I can do is provide some notes in the documentation itself telling people that they *may* be looking for a version of documentation that is different from what they're seeing. It's not quite ideal from my perspective, but I think it helps.

So bottom line, this is what I've wound up with:

* If you go directly to https://engineer.readthedocs.org/, you'll get the latest *released* version of the docs, which will correspond to what most people will install using pip.
* If you visit the [GitHub repo][5], you'll see the most recent in-development version of the code. The README links to https://engineer.readthedocs.org/, which as I mentioned earlier will redirect to the *released* version of the docs.
* The docs themselves contain notes redirecting people to https://engineer.readthedocs.org/en/latest/ if they need the most recent version of the docs. RTD itself also contains links to all versions of the docs, but I don't think most people know that and if they do, it may not be clear which version they want.

[5]: https://github.com/tylerbutler/engineer

<!--more-->
