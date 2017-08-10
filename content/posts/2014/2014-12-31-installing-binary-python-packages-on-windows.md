---

title: Installing Binary Python Packages on Windows
date: '2014-12-31T07:31:00-08:00'
tags:
- guide
- python
lastmod: '2014-12-31T00:00:00-08:00'
engineer:
  slug: installing-binary-python-packages-on-windows
  url: /2014/12/installing-binary-python-packages-on-windows/

---

In my [Python Windows installation guide][], I concluded with the following paragraph:

> After all of that’s done you should be good to go! You can pop open a PowerShell window and create/switch to virtualenvs as needed and install packages using pip. At this point you should have most of what you need to follow the installation instructions for most Python packages (except those that require C extension compilation, but that’s a topic for another post).

Despite writing the initial version of that guide over two years ago, I never got around to writing that 'other post' to cover installing packages that require C extension compilation. I personally rarely run into this need, but when it comes up it's incredibly annoying. And guess what? It came up recently when I tried to install [Dulwich][], a Python implementation of Git. Fortunately for you, I decided to take this opportunity to actually write the guide.


## Do I Need This Guide?

You only *need* this guide if you try to install a Python package on Windows and you get an error like this:

    :::text
    building 'Crypto.Random.OSRNG.winrandom' extension
    warning: GMP or MPIR library not found; Not building Crypto.PublicKey._fastmath.
    error: Unable to find vcvarsall.bat

Ahhh, the dreaded *Unable to find vcvarsall.bat* error... This error means that the package you're installing has a C extension that needs to be compiled. Python itself is compiled using a specific version of the Visual Studio C++ compiler, and when you try to install packages that require C compilation, it goes looking for the compiler locally so it can compile the necessary stuff.

Of course, in your case, you probably don't have Visual Studio, or if you do, it's not the right version, or you don't have the C++ compiler installed, or it's installed in a non-standard location, or a specific environment variable isn't set, or you forgot to reopen your PowerShell/cmd window after you set that environment variable... As you can see, there are many many reasons why this is painful. Don't worry; you're not alone. As [this question on Stack Overflow][stackoverflow] indicates, lots of people run into this problem, and there are lots of ways to 'solve' it.[^1]

Because of the relative complexity of the problem, and all the potential ways various solutions could be thwarted, this used to be annoyingly difficult to address, but now it's pretty easy.


## Installing the Microsoft C++ Compiler for Python 2.7

I am extremely glad I didn't try to write this guide a few years ago, when I wrote my Python installation guide, because in the time since then, some smart person[^2] at Microsoft felt the collective pain and anguish of Python developers everywhere and made [a package available directly on microsoft.com][msft_package] that "contains the compiler and set of system headers necessary for producing binary wheels for Python 2.7 packages." Hooray![^3]

If you [download that package][msft_package] and install it, you should be able to successfully install whatever package that was erroring out with *Unable to find vcvarsall.bat* before. Make sure you re-open any PowerShell or cmd windows you had open to make sure your environment variables are up to date. Oh, and in case you care, the compiler and all its supporting files can be found in the following directory after installation:

    :::text
    ~\AppData\Local\Programs\Common\Microsoft\Visual C++ for Python\9.0

If you're still having problems, chances are your version of setuptools is out of date.


## Update setuptools and pip

There have been a number of changes in the Python packaging/distribution world in the past few months. I'm not involved in any of the relevant projects, but since my installation guide is quite popular, I get emails from some folks every so often that are. One of the biggest changes is the reintegration of the Distribute fork of setuptools back into the main project. This also means that setuptools -- the main project -- is getting a lot more love, which means more updates.

The installation instructions for the Microsoft C++ Compiler for Python 2.7 package says that it requires **setuptools 6.0 or later.** I had a crusty old version from who knows when. Updating pip and setuptools is a little weird, but it's not that difficult. I actually wrote a [separate guide for that][engineer_upgrade] as part of the Engineer 0.5.0 documentation.

There are more details there, but it basically boils down to executing two commands: `python -m pip install -U pip` followed by `pip install -U setuptools`. When you do that, you should see some output like this:

    :::text
    C:\Users\Tyler\Code> python -m pip install -U pip
    Downloading/unpacking pip from https://pypi.python.org/packages/py2.py3/p/pip/pip-6.0.2-py2.py3-none-any.whl#md5=26404d27a64a40d4c358a2405b16d043
    Installing collected packages: pip
      Found existing installation: pip 1.5.2
        Uninstalling pip:
          Successfully uninstalled pip
    Successfully installed pip
    Cleaning up...

    C:\Users\Tyler\Code> pip install -U setuptools
    Collecting setuptools from https://pypi.python.org/packages/3.4/s/setuptools/setuptools-8.2.1-py2.py3-none-any.whl#md5=a0582adbe0c56b3945570049b8d7c953
      Downloading setuptools-8.2.1-py2.py3-none-any.whl (551kB)
      100% |################################| 552kB 975kB/s ta 0:00:01
    Installing collected packages: setuptools
      Found existing installation: setuptools 2.2
        Uninstalling setuptools-2.2:
          Successfully uninstalled setuptools-2.2

    Successfully installed setuptools-8.2.1

Congratulations, your pip and setuptools installations are now upgraded. As I note in the [Engineer 0.5.0 upgrade guide][engineer_upgrade], "if you’re using virtualenv, you may need to upgrade pip and setuptools in your virtualenv as well as the 'global' (outside the virtualenv) versions." You should be able to avoid doing this for all new virtualenvs by upgrading virtualenv itself (`pip install -U virtualenv` -- version 12.7.8 is the latest as of this writing). Once it was upgraded my new virtualenvs got the correct updated versions of pip and setuptools. If you don't want to recreate your virtualenvs, then you can just upgrade the ones you need.

Once pip and setuptools are upgraded, try installing the previously failed package again. You should see a bunch of output like this:

    :::text
    C:\Users\Tyler\AppData\Local\Programs\Common\Microsoft\Visual C++ for Python\9.0\VC\Bin\link.exe /DLL /nologo /INCREMENTAL:NO /LIBPATH:C:\Python27\Libs /LIBPATH:C:\Users\Tyler\.virtualenvs\test\libs /LIBPATH:C:\Users\Tyler\.virtualenvs\test\PCbuild /EXPORT:init_diff_tree build\temp.win32-2.7\Release\dulwich/_diff_tree.obj /OUT:build\lib.win32-2.7\dulwich\_diff_tree.pyd /IMPLIB:build\temp.win32-2.7\Release\dulwich\_diff_tree.lib /MANIFESTFILE:build\temp.win32-2.7\Release\dulwich\_diff_tree.pyd.manifest
       Creating library build\temp.win32-2.7\Release\dulwich\_diff_tree.lib and object build\temp.win32-2.7\Release\dulwich\_diff_tree.exp
    Successfully installed dulwich-0.9.8

Congratulations, you can now install source Python packages that include C extensions (like [Dulwich][])!


## The Future: Binary Wheels

Now, the fact that you need to install some separate dependency on Windows in order to install some Python packages clearly sucks. Fortunately, there are ways that package distributors can remove this need. There is a new package format, called [Wheel][], which includes pre-compiled versions of C extensions. If the Dulwich package maintainer produced a Wheel in addition to the source distribution, then users wouldn't all need to install the Microsoft C++ Compiler for Python 2.7.[^4] Wheels can be installed using pip version 1.4+.

If you release packages on PyPI, consider creating a Wheel if your package has a C extension. There's a great guide for distributing your Python projects, including creating Wheels, in the [Python Packaging User Guide][].


## Addendum: dulwich-windows

In the event you're using Windows and need [Dulwich][], but don't want to fool with following the steps above, I [forked the repository](dulwich fork) and published a Wheel (my first!) -- it's [dulwich-windows][] on PyPI. The *only* change to the code is a few minor changes to the setup file to differentiate it from the official Dulwich package. You can see those changes on the windows_wheel branch in [my fork](dulwich fork). Feel free to install it (`pip install dulwich-windows`). I may or may not keep it up to date, though, so I recommend using the official Dulwich releases if possible.


[^1]: For the record, I don't recommend following most of the answers on Stack Overflow at this point. Many are quite old, and as you'll see when you read on, there's a much simpler solution.

[^2]: Well, since it's Microsoft, it was likely a whole team of people!

[^3]: If you happen to know who at Microsoft was responsible for this, please let me know, because I want to buy them something nice.

[^4]: I do think that the Wheel would need to be built on a Windows box with the compiler installed, though I am not sure about that. If I'm right, this would certainly be a blocker since many package maintainers don't have easy access to a Windows box.


[Dulwich]: https://www.samba.org/~jelmer/dulwich/
[dulwich fork]: https://github.com/tylerbutler/dulwich
[dulwich-windows]: https://pypi.python.org/pypi/dulwich-windows
[Python Windows installation guide]: /2012/05/how-to-install-python-pip-and-virtualenv-on-windows-with-powershell/
[stackoverflow]: http://stackoverflow.com/questions/2817869/error-unable-to-find-vcvarsall-bat
[msft_package]: https://www.microsoft.com/en-us/download/details.aspx?id=44266
[engineer_upgrade]: http://engineer.readthedocs.org/en/master/upgrade.html
[Wheel]: https://pypa.io/en/latest/peps/#pep427s
[Python Packaging User Guide]: http://python-packaging-user-guide.readthedocs.org/en/latest/distributing.html
