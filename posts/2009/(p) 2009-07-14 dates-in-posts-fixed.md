---

title: Dates in Posts Fixed
timestamp: 04:01 AM Tuesday, July 14, 2009 PDT
status: published
slug: dates-in-posts-fixed
url: /2009/07/dates-in-posts-fixed/

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

<?php the_time("F j, Y, g:i a") ?>`

```
