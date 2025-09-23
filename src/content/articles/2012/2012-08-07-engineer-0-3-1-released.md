---

title: Engineer 0.3.1 Released
date: '2012-08-07T02:59:00-07:00'
teaser: true
slug: engineer-0-3-1-released
tags:
- engineer
- project
engineer:
  slug: engineer-0-3-1-released
  teaser: true
  url: /2012/08/engineer-0-3-1-released/

---

I pushed out a new version of Engineer -- 0.3.1 -- this weekend. While 0.3.1 is a minor release to fix a couple of major bugs that slipped through, 0.3.0 was a pretty major release. A majority of the new stuff is under the covers or developer-focused, so it might not seem like a big deal -- but it is. With this release I think Engineer is stable enough for me to start hyping it a bit more, so you can anticipate that over the next few months.

The full [release notes][v0.3.0] go into more details about the specifics, but there are two major features I added that are particularly interesting from a development perspective: the new plugin architecture, and the Jekyll/Octopress compatibility work.

<!--more-->

## Plugin Architecture

Before I go into details about the plugin architecture, a disclaimer: I'm not yet completely happy with it, and it's still a work in progress.

Since Engineer is a glorified text parser, it makes sense to have some degree of customization over exactly how that parsing happens. While Engineer already has a number of options and ways to customize exactly how it works, there's always room for more. Building a plugin system into the application forces me to keep the customization interfaces clean and well-defined, plus opens up a whole world of use cases for Engineer that I won't be able to imagine by myself.

I first tackled the plugin architecture in [version 0.2.4][v0.2.4], with theme plugins. My idea was to provide a way to add themes to Engineer globally. Wrapping themes in a Python package made sense, since that way themes could be installed the same way Engineer itself is installed.

That was a fine system, and relatively simple (if not completely overkill since themes are really just HTML/CSS/JavaScript plus a little metadata file -- not Python), but I really wanted a unified plugin system that worked similarly across all different plugin types.

In order to support post breaks or 'teaser' content on a rollup page, I needed to break a post into two different pieces: the teaser content, and the full post. One option was to build a plugin to the Python Markdown engine. That seemed like overkill, plus frankly I didn't want to go and learn a new API just for something simple. Also, it was unlikely that all future processing on post content I might want to do would be possible to do in a Markdown plugin, not to mention that I eventually want to support additional post formats (Textile, for example).

The second option was to simply bake the functionality into Engineer itself and add a new configuration option. This would have been fine, but it also seemed like a really good opportunity to work out a plugin architecture and use the post breaks feature, along with themes, as a test of the design.

After quite a bit of research and thought, I boiled down the design needs to two basic requirements. In order for a plugin system to work, you need to solve the following problems:

1. The plugin has to be registered or discovered. Somehow, Engineer needs to know that the plugin code exists so that it can load it and run it.
2. Engineer needs to actually run the right plugin types at the right points in its execution.

Both of these are pretty obvious, and the second one isn't that challenging. There are different types of plugins, and those plugins get called based on their type wherever I see fit in the Engineer execution. Since I am defining the plugin's capabilities (for a given type), then this is just simple common-sense coding.

The first problem, though, is somewhat more involved. Just *how* would Engineer know a plugin existed? How would it know what packages to load and what functions to call or classes to instantiate. Clearly I would need an interface defined, but should it be a class? Just a function? Something else? And even then, how will my code *find* the plugin code?

One option was to take a page from [Django][] and require the modules or classes be provided in a settings file,[^eng1] then import them at runtime, but that felt a little clunky. I want it to be possible to simply install the plugin and use it, especially for simple plugins that don't require configuration (like themes and the post breaks plugin).

After further research, I came across a very simple model from [Marty Allchin][allchin] that seemed to meet my needs. I can define a class that defines a type of plugin, then plugin implementers can subclass that plugin parent class. The 'magic' of Marty's method is that all that's required for plugins to get 'loaded' is that the module containing them be imported. Once that happens, the plugin class is visible to Engineer. See [Marty's post][allchin] for more details about how it works specifically, or you can look at [plugins.py][] to see my adapted implementation (I didn't really change anything though).

That is very very awesome, and works especially well for built-in Engineer plugins since their modules are always loaded, but I still had the problem of loading plugins whose modules I don't know about at runtime. I still needed the [PLUGINS setting][] to tell me which modules contained plugins so they could be loaded. Ultimately I *really* want plugins to be capable of working with no user configuration unless it's needed due to the nature of the plugin.

Luckily, with some help from the Pygments source, I was able to find out about setuptools' [entry points][setuptools], which work perfectly for this purpose. If you're developing an Engineer plugin, you can notify Engineer about your plugin modules using the `engineer.plugins` entrypoint.

This is covered in more detail in the [Engineer documentation](http://engineer.readthedocs.org/en/latest/dev/plugins.html#loading-plugins), but basically you'd add something like this to your plugin's `setup.py` file:

```python
entry_points = {
'engineer.plugins': ['post_processors=dotted.path.to.module',
                        'themes=another.module.path'],
}
```
If you do that, then when your Python package is installed, it will advertise its modules to Engineer such that they can be imported, and then your plugins will run. Magic!

Like I said earlier, though, it's still a work in progress. In particular, some of the limitations of the plugin system include:

- There is no notion of ordering plugins to run in a specific order. Currently this is not a problem, but I anticipate it becoming one fairly soon since plugins may eventually step on each others' toes. I'm not sure how I'm going to address this problem yet.
- There is no general purpose 'enable/disable plugin' feature -- if it's installed, it'll run. Individual plugins can of course have their own toggles using custom settings, but it's not built-in. I might leave this as something individual plugins will need to solve on their own, or I might implement a general-purpose 'enabled/disabled by default' flag a plugin developer can set. I have to think about this more. Again -- work in progress.

Despite these limitations, the general plugin model is quite useable as-is, and I have a couple of new features I plan to add in version 0.4.0 that I intend to implement as plugins to further prove out the system.


## Jekyll/Octopress Compatibility

When I started developing Engineer, I was heavily inspired by [Jekyll][] and [Octopress][] (as well as [Hyde][] and [Second Crack][]). There are a number of things I don't like or find hard to understand about those applications, but they certainly do many things right.

But one of the biggest things Jekyll and Octopress have going for them is relative ubiquity, at least amongst the people that use static site generators (a much smaller crowd than it should be!). I honestly hadn't considered doing any specific compatibility work, though, until I used [Marked](http://markedapp.com) on the Mac. Marked is basically a Markdown previewer for the Mac. You type Markdown in one window, Marked shows you the output in another. Now it does other things too but that's the core thing it does.

Anyway, there are other Markdown previewers/editors -- notably [MarkdownPad](http://markdownpad.com/) for Windows -- but Marked has a unique feature that you can turn on that will ignore Jekyll metadata for the purposes of previewing a document. That means that if you're editing a Jekyll post, Marked will hide the post metadata (Jekyll calls this 'front matter') in its preview. Contrast this to MarkdownPad, for example, which assumes the metadata is part of the document and renders it as Markdown.

Obviously this is not a required feature since Engineer metadata doesn't *break* Markdown rendering, but it's kind of nice to have when you're writing/previewing a lot of posts. So I excitedly turned it on and loaded an Engineer post... and it didn't work. The problem, of course, is that Jekyll requires that metadata (sorry, 'front matter') be 'fenced' within two YAML document separators, like so:

```text
---
metadata goes here...
---

post content goes here...
```

Engineer, on the other hand, required, (prior to version 0.3.0) that that first `---` not be there. Fundamental incompatibility. When I originally made the decision to not require the first `---` it was for simplicity. I didn't need it for parsing, and it felt silly to *require* users to always type it, so I just left it out. However, this meant two things:

1. I couldn't use Marked's nice Jekyll-compatibility feature for Engineer posts.
2. More importantly, users wouldn't be able to easily migrate from Jekyll to Engineer.

While getting people to use Engineer over Jekyll is not an explicit goal, I believe there's room for more than one static site generator, and to the extent that I can encourage portability both to and from Engineer, I want to. So I addressed this in version 0.3.0: Engineer posts can now have Jekyll-style 'fenced' metadata, or classic Engineer-style single `---` metadata. In addition, during normalization, Engineer will maintain the style of your source file. This isn't merely a 'migrate people to Engineer from Jekyll' feature. Rather, it's a 'increase compatibility and portability of your site' feature.

That's the extent of the compatibility features in version 0.3.0, but I am going to keep looking for ways to increase the compatibility. In particular, some of the metadata keywords are different (e.g. Jekyll has categories *and* tags), and I'm looking into handling things like that as an [optional post-processor](https://trello.com/c/GIYzDoMz) (using the new plugin system, of course!). There's a lot of interesting stuff to look into, and I'd love input. Send it my way via a GitHub issue, or fork away and go nuts on the source yourself!

And if you have a website, consider using Engineer!


[^eng1]: I actually ended up implementing this solution anyway since it seemed useful. See the [PLUGINS setting][].


[v0.3.0]: http://engineer.readthedocs.org/en/latest/changelog.html#version-0-3-0-july-22-2012
[v0.2.4]: http://engineer.readthedocs.org/en/latest/changelog.html#version-0-2-4-may-27-2012
[allchin]: http://martyalchin.com/2008/jan/10/simple-plugin-framework/
[Django]: https://docs.djangoproject.com/en/1.4/ref/settings/#std:setting-INSTALLED_APPS
[setuptools]: http://peak.telecommunity.com/DevCenter/setuptools#extensible-applications-and-frameworks
[PLUGINS setting]: http://engineer.readthedocs.org/en/latest/settings.html#engineer.conf.EngineerConfiguration.PLUGINS
[plugins.py]: https://github.com/tylerbutler/engineer/blob/master/engineer/plugins.py
[Jekyll]: http://jekyllrb.com/
[Octopress]: http://octopress.org/
[Second Crack]: https://github.com/marcoarment/secondcrack
[Hyde]: http://hyde.github.com/
