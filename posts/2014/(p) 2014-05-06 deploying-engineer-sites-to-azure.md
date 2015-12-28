---

title: Deploying Engineer Sites to Azure
timestamp: 08:42 AM Tuesday, May 06, 2014 PDT
status: published
slug: deploying-engineer-sites-to-azure
tags:
- engineer
- azure
url: /2014/05/deploying-engineer-sites-to-azure/

---

A [longstanding issue][1] in the Engineer issue tracker concerns documenting some of the free/low-cost hosting options one has to host an Engineer site. [GitHub Pages](http://pages.github.com/) is a common request, and documenting that process is definitely on my to-do list, but I think there's a better option: Azure.

[1]: https://github.com/tylerbutler/engineer/issues/51

I've been hosting tylerbutler.com on Azure for the past few months, and I have to say, I'm very pleased with it so far. It's probably not the most cost-effective thing for my site, but if you have an MSDN subscription, which many .Net developers have (including me), then you have a monthly Azure credit that is almost certainly enough to cover the cost of deploying your Engineer site to Azure.

Deploying on Azure has the benefits of auto-scaling to handle traffic demands, though that's not particularly compelling for Engineer-based sites since static sites by nature tend to be very scalable anyway. The truly compelling feature, in my opinion, is that it lets you maintain your built Engineer site in a Git or Mercurial repository, which is something that developers in particular really like. It is, after all, one of the nice things about GitHub pages as well.

With some of the new features in [Engineer version 0.5.0][3], I've got tylerbutler.com in a [GitHub repository][4] of its own, and every time I `git push`, the site is updated automatically thanks to Azure. Even better, thanks to Engineer's support for [multiple post directories][5], I can put my published posts inside the Git repository itself for safekeeping but still write posts from any device/app that integrates with Dropbox. This flexibility of post authoring was one of the key reasons I wrote Engineer originally; it's important that I maintain that with whatever deployment architecture I choose.

[3]: /2014/05/engineer-v0-5-0-released/
[4]: https://github.com/tylerbutler/tylerbutler.com
[5]: https://engineer.readthedocs.org/en/master/settings.html#engineer.conf.EngineerConfiguration.POST_DIR

Once you have everything set up on Azure, the basic flow looks like this:

- Edit and maintain your site in a Git or Mercurial repository
- Build your site, commit to Git/Mercurial
- Push the repository to GitHub/Bitbucket
- Azure site automatically updates itself in a few minutes

In order to get this up and running, you can follow the steps below. Note that Engineer 0.5.0+ is needed. I'll eventually get these instructions incorporated into the official Engineer docs, but I wanted to get the info out there for folks without delay.

## Getting started

If you don't yet have an Engineer site, you can initialize a new one with a content structure and configuration files especially for Azure using the following command (new in Engineer 0.5.0):

    :::text
    engineer init -m azure

If you have an existing site, you can simply use it, of course, but you may need to add your own `.deployment` file or configure the Azure deployment settings for your site yourself. There are more details below.

You can lay out your files however you wish, but the typical layout will look something like this:

    :::text
    /my-engineer-site
      - .deployment
      - config.yaml
        /content
        /templates
        /output
            /azure

Run the following command from the root of the folder to build your site for Azure:

    :::text
    engineer build -s ./config.yaml

The output will be written to `./output/azure/` by default. You can obviously change this in the Engineer settings, though note that you'll have to make some other changes as well. Keep reading for further details.

Go to your Azure portal and create a new web site. Configure the site to automatically deploy from a GitHub/Bitbucket repository and connect it to your repository. You can also choose to use manual Git deployment if you wish, or even just FTP the site content, but I recommend the GitHub auto-publish route; it's much simpler and automatic.

Now every time you push a new commit to GitHub/Bitbucket, your Azure site will update automatically with the contents of the `./output/azure/` folder. This magic works because of the `.deployment` file in your repository, which is created automatically by Engineer when you initialize a new site using `engineer init -m azure`. You can read more about this file [in the GitHub wiki](https://github.com/projectkudu/kudu/wiki/Customizing-deployments)

If you want to change the output folder to a different path, you can do that in your Engineer config file. However, in addition, you'll need to tell Azure that the location of the site content within your repository is different. This is contained in -- you guessed it -- the `.deployment` file. Just change the value of the 'project' setting within that file.

If you prefer, you can remove the `.deployment` file altogether and configure the site root in the Azure portal directly. This is basically the same as the `.deployment` file approach, but if you have a single repository that contains multiple Engineer sites -- or other types of sites, even -- then using the settings in the Azure portal is preferable. From [Scott Hanselman][2]:

> What's nice about setting the "Project" setting via site configuration rather than via a `.deployment` file is that you can now push the same git repository containing two different web sites to two remote Azure web sites. Each Azure website should have a different project setting and will end up deploying the two different sites.

That is *very* cool. Scott has more details in [his post on the topic][2].

[2]: http://www.hanselman.com/blog/DeployingTWOWebsitesToWindowsAzureFromOneGitRepository.aspx

Hopefully this helps you get your Engineer site up and running on Azure. As I mentioned before, I am going to be incorporating this information into the official Engineer docs as well. I've also gotten Engineer sites running on GitHub Pages, so I'll cover that in a future post.

<!--
In particular, GitHub offers a service called [GitHub Pages](http://pages.github.com/) that integrates wonderfully with Jekyll. Of course, if you're using Engineer, you're not using Jekyll,
-->
