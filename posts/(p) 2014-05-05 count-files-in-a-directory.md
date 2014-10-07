---

title: Count Files In A Directory
timestamp: 09:04 AM Monday, May 05, 2014 PDT
status: published
slug: count-files-in-a-directory
tags:
- powershell
- snippets
url: /2014/05/count-files-in-a-directory/

---

Need to count files in a directory? Try this one line of PowerShell:

    :::powershell
    (dir | where {$_.GetType() -match "fileInfo"} | measure-object).count

You can also add a `-r` parameter (`-r` means *recursive*) to the first `dir`[^1] command and get a complete count of all files in all subdirectories under the current path.

This comes in handy, though I *do* wish it was a little more succinct.


[^1]: And of course you can substitute `ls` for `dir` if you prefer, or even `Get-ChildItem` if you're feeling particularly masochistic.
