---

title: Assumptions Make Life Simpler
timestamp: 08:14 PM Thursday, August 13, 2009 PDT
status: published
slug: assumptions-make-life-simpler
tags:
- design
url: /2009/08/assumptions-make-life-simpler/

guid: http://www.tylerbutler.com/2009/08/assumptions-make-life-simpler/

---

Chris Greening, the developer of iPhone Sudoku Grab, [explains how it
works][1]. I find this section the most interesting:

> One of the things that makes recognizing Sudoku puzzles an easier task than
most image processing/recognition problem is that it is a highly constrained
problem -- a standard Sudoku puzzle is going to be a square grid and it will
only contain the printed numbers 1-9. These two points are very important. The
first point -- it's a square grid tells us what shape a puzzle is and what we
should be looking for in an image. The second point -- it will only contain the
printed numbers 1-9 tells us that we aren't going to need a sophisticated OCR
system. When we look at the problem there's nothing that jumps out and says
"nobody has solved this before -- it's probably really hard". We can also add
some additional assumptions -

>

>   1. **In a photograph of a sudoku puzzle, the puzzle is going to be the
main/most important object on the page** A user is going to be photographing
the puzzle -- they aren't going to take a picture of a whole newspaper page,
they won't be taking a photograph of a coffee shop and expecting us to find a
sudoku puzzle that someone is playing four tables away. Also, the user is
going to try and capture the whole puzzle, they won't miss a corner or chop
off the top.

>   2. **The puzzle will be orientated reasonably correctly.** No-one
(hopefully) is going to be taking a picture of an upside down puzzle, and
typically they will be trying to align it nicely in the camera viewfinder so
it is reasonably straight without too much distortion.

A great example of how some simple assumptions made about your problem make it
far easier to solve. Of course, the key is making sure the assumptions are
valid, or being prepared to handle edge cases where these assumptions prove
false.

   [1]: http://sudokugrab.blogspot.com/2009/07/how-does-it-all-work.html

