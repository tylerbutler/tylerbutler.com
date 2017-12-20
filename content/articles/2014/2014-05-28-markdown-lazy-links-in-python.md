---

title: Markdown Lazy Links in Python
date: '2014-05-28T13:16:00-07:00'
tags:
- engineer
- python
- markdown
engineer:
  slug: markdown-lazy-links-in-python
  url: /2014/05/markdown-lazy-links-in-python/

---

One of the things I am most excited about in [Engineer 0.5.0][1] is the new support for [Markdown Lazy Links][3]. My implementation is actually a bit richer than [Brett Terpstra's original sample][5], though it's not quite as elegant as the original either. In particular, Engineer's implementation allows you to add lazy links to posts that already have numeric reference links. Also, you can optionally have Engineer transform the lazy links into numeric links during a build. This can come in handy if you anticipate doing a lot of reorganizing of the post content at some point, and want to make sure links don't break.

[1]: /2014/05/engineer-v0-5-0-released/
[3]: https://engineer.readthedocs.org/en/master/bundled_plugins.html#lazy-links-plugin
[5]: http://brettterpstra.com/2013/10/19/lazy-markdown-reference-links/

It took some time to unpack Brett's elegant regular expression into the Python form, mostly because Ruby is very foreign to me, and its regex engine has some default behaviors that differ from Python's. In particular, it took some time to figure out exactly what flags to pass in so that things behaved appropriately. I'm still not sure I got it completely right, though my unit tests seem to pass and I've been using the plugin for some time so I think it's stable.

I chose to use the [VERBOSE][2] regular expression form so it's clearer how the expression works. Hopefully that will save someone some time if they're looking to port the thing to some other regular expression language. You can find the source in the [GitHub repository][4], but I'm pasting the relevant class below as well. Note that this is an [Engineer PostProcessor plugin][6], so some of the code is simply scaffolding for the plugin system. If you find a bug, please let me know, or even better, [file an issue on GitHub][7].

[2]: https://docs.python.org/2/library/re.html#re.VERBOSE
[4]: https://github.com/tylerbutler/engineer/blob/dev/engineer/plugins/bundled.py#L306
[6]: https://engineer.readthedocs.org/en/master/dev/plugins.html#post-processor-plugins
[7]: https://github.com/tylerbutler/engineer/issues

```python
class LazyMarkdownLinksPlugin(PostProcessor):
    # Inspired by Brett Terpstra: http://brettterpstra.com/2013/10/19/lazy-markdown-reference-links/
    _link_regex = re.compile(r'''
        (           # Start group 1, which is the actual link text
            \[          # Match a literal [
            [^\]]+      # Match anything except a literal ] - this will be the link text itself
            \]          # Match a literal ]
            \s*         # Any whitespace (including newlines)
            \[          # Match the opening bracket of the lazy link marker
        )           # End group 1
        \*          # Literal * - this is the lazy link marker
        (           # Start group 2, which is everything after the lazy link marker
            \]          # Literal ]
            .*?^        # Non-greedy match of anything up to a new line
            \[          # Literal [
        )           # End Group 2
        \*\]:       # Match a literal *]: - the lazy link URL definition follows this
        ''', re.MULTILINE | re.DOTALL | re.UNICODE | re.VERBOSE)

    _counter_regex = re.compile(r'\[(\d+)\]:', re.UNICODE)
    _counter = 0

    @classmethod
    def _replace(cls, match):
        cls._counter += 1
        sub_str = '%s%s%s%s]:' % (match.group(1), cls._counter, match.group(2), cls._counter)
        return sub_str

    @staticmethod
    def get_max_link_number(post):
        all_values = set([int(i) for i in LazyMarkdownLinksPlugin._counter_regex.findall(post)])
        return max(all_values) if all_values else 0

    @classmethod
    def preprocess(cls, post, metadata):
        from engineer.conf import settings

        logger = cls.get_logger()
        content = post.content_preprocessed
        cls._counter = cls.get_max_link_number(content)

        # This while loop ensures we handle overlapping matches
        while cls._link_regex.search(content):
            content = cls._link_regex.sub(cls._replace, content)
        post.content_preprocessed = content
        if getattr(settings, 'LAZY_LINKS_PERSIST', False):
            if not post.set_finalized_content(content, cls):
                logger.warning("Failed to persist lazy links.")
return post, metadata
```
