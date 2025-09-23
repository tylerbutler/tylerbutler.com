---

title: Dates in Posts Fixed
date: '2009-07-14T04:01:00-07:00'
slug: dates-in-posts-fixed
engineer:
  slug: dates-in-posts-fixed
  url: /2009/07/dates-in-posts-fixed/

# Custom Properties
guid: http://www.tylerbutler.com/?p=522

---

Just made a minor fix to the site... I noticed that dates weren't showing up for
some posts. Took me about 5 minutes to figure out that the Wordpress
[the_date()](http://codex.wordpress.org/Template_Tags/the_date) function had changed:

> When there are multiple posts on a page published under the SAME DAY,
`the_date()` only displays the date for the first post (that is, the first
instance of `the_date()`).

Quick and easy change...

Before: 

```php

<?php the_date() ?>, <?php the_time() ?>

```

After:

```php

<?php the_time("F j, Y, g:i a") ?>

```
