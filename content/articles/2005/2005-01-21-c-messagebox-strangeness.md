---

title: C# MessageBox Strangeness
date: '2005-01-21T20:33:00-08:00'
engineer:
  slug: c-messagebox-strangeness
  url: /2005/01/c-messagebox-strangeness/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2005/01/c-messagebox-strangeness/

---

I am working on a C# program and I want to pop up a message box when certain
fields aren't filled out properly in the GUI. .Net's MessageBox class makes it
simple to do. However, when I ran my code, my message box looked like this:

  
![][1]

  
I fooled around with it for awhile, trying different combinations of arguments
to the `Show()` method, but I wasn't able to figure it out. Thankfully, my
Google search turned up [this forum post][2] pretty quickly. Apparent
disabling McAfee's Buffer Overflow Protection solves the problem. But this
makes me wonder whose fault this is. Is it something in C#/.Net? Is it
Windows' fault? Is McAfee just really dumb? Who knows... I'm too lazy to try
and figure it out right now.

   [1]: /SiteCollectionImages/Post%20Images/messagebox.png
   [2]: http://www.xtremevbtalk.com/showthread.php?t=191026 (I don't know how THEY figured it out...)

