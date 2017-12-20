---

title: iTunes Tagging
date: '2007-01-02T03:30:00-08:00'
slug: itunes-tagging
tags:
- itunes
engineer:
  slug: itunes-tagging
  url: /2007/01/itunes-tagging/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2007/01/itunes-tagging/

---

One of the things that really annoys me about iTunes is the lack of
categorical tagging. Actually, I shouldn't blame iTunes. I think this is a
fundamental limitation in the ID3 tags. What I want is the ability to "tag"
music as I listen to it, with terms like "story-song" (songs that tell a
story) or "ricardo" (songs that my friend Ricardo has introduced me to).
Social music sites like [Pandora][1] and [Last.fm][2] have this concept, as
does just about every "Web 2.0" site in the world. Why not my music player?

Initially when I tried to implement this sort of thing I used the "keywords"
field. I would just add the tag to that field, then I created Smart Playlists
based on that field. [This post at Lifehacker][3] suggests using the
"Grouping" field, but the premise is the same.

This approach works fine until you want to edit a bunch of songs and **add **a
tag. When you do a bulk edit of the keywords field in iTunes it'll overwrite
anything that was there previously. So suddenly tagging all that music with
"Sasquatch 2006" removed all the other cool tags you had applied. Major
suckage.

Today I decided to try a new approach: I just use dumb, old-fashioned
playlists. When I want a new tag, I create a new playlist for it. For
organization purposes I keep all tag playlists in a folder called Tags. I can
then create additional nested folders for categories, and because of how
iTunes handles folders with playlists inside, the folders will become
aggregators of all the music in playlists underneath them, which is nifty.
This means I can see all of the music I have tagged just by clicking the Tag
folder

This approach is pretty simple. Adding a tag is easy, and using the tags to
drive smart playlists is easy too. Just add an "If <**Playlist**> <**is/is
not**> <**Tag playlist name**>" clause to the Smart Playlist. There is a
drawback, though... **Removing **tags is now a pain. From the frying pan into
the fire... I have to make sure the song doesn't appear multiple times in a
playlist, and if it does, remove all occurrences. This is because playlists
are designed to support multiple occurrences of the same song. If I want to
start and end my playlist with _My Heart Will Go On_, then dang it, I can do
it. But for my purposes, it's not the ideal behavior.

Anyway, none of this really helps my situation, because the iTunes app
**doesn't help me** manage my tags, build playlists based on them, or
anything, natively. All of this is a hack. There are a lot things that it
could do to make it easier to tag music. And with the iTunes music store, what
if I could check out how other users were tagging the track, and borrow their
tags? This is all stuff that is provided by Last.fm, of course, but Last.fm
doesn't manage my entire music collection -- iTunes does.

And of course **none** of this does anything on my iPod. Heck, **it** can't
even understand playlist folders, which is super _super **super**_ dumb.
Actually, I have a lot of gripes about the iPod UI...

   [1]: http://www.pandora.com/ ()
   [2]: http://www.last.fm/ ()
   [3]: http://www.lifehacker.com/software/itunes/tag-your-songs-in-itunes-153970.php ()
