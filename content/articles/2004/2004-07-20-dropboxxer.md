---

title: DropBoxxer
date: '2004-07-20T22:02:00-07:00'
tags:
- project
engineer:
  slug: dropboxxer
  url: /2004/07/dropboxxer/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2004/07/dropboxxer/

---

I am a mobile guy. I use my laptop on the road a lot, and at home I have three
different computers (desktop, server, media box). On top of all that I use
[Omega][1] to host some files and such for easy mobile access. I have
everything networked together using windows file sharing, and for most part,
everything wors flawlessly. The problem is, I often need to copy or move files
from one remote location to another. Simple, right? Just drag and drop!
Unfortunately, often times the windows I need to drag to aren't readily
visible, and it is relatively time consuming to drag down to the taskbar, wait
for the window to become active, then drag back up to the window to drop the
file.

  
If Windows would let me drop items on the taskbar, it'd be all good, but since
it won't, I decided to make my own application that would allow me faster
access to common "drop" locations.

  
I did this in C# using a copy of Visual Studio .NET that I got through
Illinois Tech's Academic Alliance program through Microsoft. I'd never used C#
or .NET before, so I learned as I went.

  
DropBoxxer sits in your system tray, and doesn't take up any screen real
estate at all until needed. When you select a file and drag it over the left
corner (right above the system time) DropBoxxer fade up and in from off
screen. There are different "drop boxes" for various locations, with three
types of icons -- one for local locations, one for remote locations, and one
for the Recycle Bin (note that the recycle bin icon doesn't currently work in
version 0.1). Simply drop the file over one of these drop boxes, and the
program copies or moves the file to the drop location. By default, everything
is copied rather than moved, but simply hold down the Shift key as your drag
the file(s) onto the drop box, and the files will be moved rather than copied.
As you drag something over a drop box, the location bar will display where the
current drop box points, in case you forget or need to double check.

  
After the job is complete, DropBoxxer fades back down off screen so you
don't have to worry about it any more. Next time you need it, simply drag a
file back over and it'll automatically reappear. To exit the program, simply
right-click on its task bar icon and select "Exit DropBoxxer."

  
  
**_Notes About Version 0.1_**
  
Everything is currently hardcoded, so it's not a whole lot of use to anyone
other than me unless you want to get into the source code (included in the
download) to make modifications. I plan to add functionality that will allow
you to drag folders onto the drop area to add drop locations, or at the very
least provide a menu option to that effect when you right click in the system
tray. I'd also like to provide some better progress indicators when copying
large files. As it stands right now, you don't have any indication of what's
going on or how long the process is going to take.

  
Finally, I want to trim the file size down a bit. It's almost an entire meg
executable, which seems ridiculously large for something as simple as it is.
Probably has something to do with the image files I store in there...

  
You can snag a copy of DropBoxxer Version 0.1 here. The zip contains an
executable and the source code files/resources. The source code is crappy
right now, but I will clean it up when I add the other functionality. If you
make modifications to the code, please write me and let me know. DropBoxxer
requires Windows XP (because of the fading and transparency effects), and
requires the .NET framework (I know, I know, but seriously, there is no other
way to do an application that operates in a snazzy way and integrates so
closely with Windows. Java? I think not...)

   [1]: http://omega.cs.iit.edu/
