---

title: Code Line Counter
date: '2005-03-08T21:14:00-08:00'
tags:
- snippets
- python
engineer:
  slug: code-line-counter
  url: /2005/03/code-line-counter/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2005/03/code-line-counter/

---

I have been working on HawkTour now for over two years, and I started
wondering today exactly how much code we've generated since we started. I
thought maybe [Eclipse][1] had a project-wide line counter somewhere, but I
couldn't find it, so I just wrote a simple [Python][2] script to do it. The
code is below.

```python
# linecounter.py
# Tyler Butler, 03/08/2005

import os

total = 0
extensions = ['java', 'cpp', 'h']

for root, dir, files in os.walk('.'):
  for file in files:
    if str(file).split('.')[-1] in extensions:
      filename = os.path.join(root, file)
      f = open( filename )
      total += len(f.readlines())
      f.close()

print "TOTAL LINES IN PROJECT: " + str(total)
```

Pretty simple, isn't it? It just works in the current directory, but you can
change that pretty easily. Also, if you want to add more extensions to count
then just add them to the extensions list.

   [1]: http://www.eclipse.org
   [2]: http://www.python.org

