---

title: How To Install Python, pip, and virtualenv on Windows with PowerShell
timestamp: 05:26 PM Monday, May 28, 2012 PDT
status: published
slug: how-to-install-python-pip-and-virtualenv-on-windows-with-powershell
tags:
- guide
- python
- powershell
url: /2012/05/how-to-install-python-pip-and-virtualenv-on-windows-with-powershell/

---

*Updated May 12, 2013*

If you do any Python development, you'll probably run into an awful lot of package installation instructions [that read][3]:

> To install, use pip:
>
> `pip install engineer`

Now, that's all fine and dandy, but what is pip? And what is this virtualenv thing people keep telling me I should use?

If you're new to Python, getting up and running with pip and virtualenv can be a challenge, especially on Windows. Many guides I've seen out there assume either *a)* you're working on Linux or UNIX or *b)* you already have pip/setuptools installed, or you know how to install packages and manage virtualenv. Heck, when I was learning this I didn't even know what pip *was!* Having gone through this process several times now, I decided to write it all down from the beginning in the hopes that it'll be useful to someone in the future.

<!-- more -->

## Before We Start

A brief note before we start... To make sure we're all on the same page, pip is a Python package installer. It integrates with PyPI, the Python Package Index, and lets you download and install a package from the package index without manually downloading the package, uncompressing it, running `python setup.py install` etc. Pip makes installing libraries for your Python environment a breeze, and when you start developing your own packages it provides a way for you to declare dependencies so those dependent packages will get installed automatically as well.

The more Python development you do, though, the more packages you're going to need. Wouldn't it be nice if you could install all the packages into a 'special' location where they wouldn't interfere with any other packages? This is where virtualenv comes in. It creates a virtual Python interpreter and isolates any packages installed for that interpreter from others on the system. There are lots of ways this comes in handy; I'll leave enumerating them as an exercise for the reader, but if you think for a minute you can see why this will come in handy. And if you can't yet, then give yourself a few weeks of Python development, then come back and look at this post again once you realize you need to use virtualenv.

Finally, there's a wrapper utility for virtualenv aptly called virtualenvwrapper. This wrapper makes creating new virtual environments and switching between them really straightforward. Unfortunately, it relies on a UNIX shell, which is kind of a pain on Windows. Luckily there's a PowerShell clone of the wrapper that works wonderfully and gives us Windows users the same kind of awesomeness that we've come to expect from PowerShell.

So with the definitions out of the way, let's get started...

## Ensure You Can Execute PowerShell Scripts

For the most part, this guide assumes you've actually used PowerShell a few times and know how to run scripts. If that's not the case, though, then the very first thing you'll want to do is enable scripts to run on your system using the `Set-ExecutionPolicy` command. There's [a great article on TechNet](http://technet.microsoft.com/en-us/library/ee176949.aspx) that covers this in detail, so I won't go into detail here. You can also skip this step for now if you want. Just read that article if you run into the following error message at any point:

    :::text
    ...cannot be loaded because the execution of scripts is disabled on
    this system. Please see "get-help about_signing" for more details.

## Get Python

First things first -- get Python! You can get the Python 2.7.3 (the current Python 2.x version as of this writing) 32-bit installer from <http://python.org/download/>. There is a 64-bit version of Python as well, but I have personally found it to be more hassle than it's worth. Some packages won't have 64-bit versions available, and I personally haven't found any need for the 64-bit version in any project I've worked on. Feel free to go with the 64-bit version if you'd like, but this guide assumes you're using the 32-bit one.

Once you've installed Python, open up a PowerShell window and type `python` and press enter. You should see something like this:

    :::text
    PS C:\> python
    Python 2.7.2 (default, Jun 12 2011, 15:08:59) [MSC v.1500 32 bit (Intel)] on win32
    Type "help", "copyright", "credits" or "license" for more information.
    >>>

You might also get an error, however, saying "The term 'foo' is not recognized as the name of a cmdlet, function, script file, or operable program." This is because the Python installer, for whatever reason, does not automatically add the installation directory to your path. (Although apparently it sometimes does. In some cases I have not had to update my path manually.) You'll need to update your path to include the Python install directory (usually something like `C:\Python27\`). There are a number of ways to do that; the [Using Python on Windows](http://docs.python.org/using/windows.html) documentation includes more details if needed. You'll also want to add the `Scripts` subdirectory directly (so `C:\Python27\Scripts`), since that's where pip will end up being installed.

Once your path is updated, restart PowerShell to ensure the new path is loaded and try typing `python` again. You should be good to go!


## Get Distribute

[Distribute][] is a fork of the Setuptools project "intended to replace Setuptools as the standard method for working with Python module distributions." It is a prerequisite for pip. Luckily, unlike Setuptools, Distribute is pretty easy to install on Windows.

You need to download the [distribute_setup.py][] file, save it locally, then run it using Python. For example, after saving the `distribute_setup.py` script locally, open up PowerShell, navigate to where you downloaded the file, and type:

    :::text
    PS C:\> python distribute_setup.py


## Get Pip

The easiest way to install pip is to download the [get-pip.py][] script and run it using Python, much like you did with Distribute.

    :::text
    PS C:\> python get-pip.py

There are other ways to get pip, but this is the easiest way I have found. There are more details on this at [the pip website][1]. To check if everything is working, just type `pip` at the command line:

    :::text
    PS C:\> pip
    Usage: pip-script.py COMMAND [OPTIONS]
    pip-script.py: error: You must give a command (use "pip help" to see a list of commands)

If you get another "command is not recognized" error, check that `C:\Python27\Scripts` is on your path.


## Install virtualenv and virtualenvwrapper-powershell

Pip should now be installed, so type the following commands to get virtualenv and the PowerShell virtualenvwrapper installed:

    :::text
    PS C:\> pip install virtualenv
    PS C:\> pip install virtualenvwrapper-powershell

Now you need to import the wrapper module in PowerShell, so type `Import-Module virtualenvwrapper`.
You will probably get an error saying something like this:

    :::text
    Virtualenvwrapper: Virtual environments directory 
    'C:\Users\tylerbu/.virtualenvs' does not exist. Create it or 
    set $env:WORKON_HOME to an existing directory.

Well, at least you know you're on the right track! Do exactly what the message says: create the missing directory.

    mkdir '~\.virtualenvs'

You might also want to change the location to store your virtual environments. To do that, set the `$env:WORKON_HOME` variable to wherever you want to store them. I generally stick with the default of `~\.virtualenvs` though. Whatever you do, remember this location; it will come in handy.

Now try to import the module again. Success! Now you have access to a bunch of virtualenv management commands directly in PowerShell. To see all of them, you can type:

    :::text
    PS C:\> Get-Command *virtualenv*

    CommandType     Name                          Definition
    -----------     ----                          ----------
    Function        CDIntoVirtualEnvironment      ...
    Alias           cdvirtualenv                  CDIntoVirtualEnvironment
    Function        Copy-VirtualEnvironment       ...
    Alias           cpvirtualenv                  Copy-VirtualEnvironment
    Function        Get-VirtualEnvironment        ...
    Alias           mkvirtualenv                  New-VirtualEnvironment
    Function        New-VirtualEnvironment        ...
    Function        New-VirtualEnvProject         ...
    Function        Remove-VirtualEnvironment     ...
    Alias           rmvirtualenv                  Remove-VirtualEnvironment
    Function        Set-VirtualEnvironment        ...
    Function        Set-VirtualEnvProject         ...
    Function        VerifyVirtualEnv              ...
    Application     virtualenv.exe                C:\Python27\Scripts\virtualenv.exe
    Application     virtualenv.exe.manifest       C:\Python27\Scripts\virtualenv.exe.manifest
    Application     virtualenv-script.py          C:\Python27\Scripts\virtualenv-script.py

You'll see that there are a bunch of nice PowerShell style cmdlets, like `New-VirtualEnvironment`, but there are also aliases set up mapping those cmdlets to commands you might be more familiar with, like `mkvirtualenv`. Of course you also get regular PowerShell tab completion for these cmdlets and aliases.


## Managing virtualenvs

Now that we have virtualenv installed, let's make a new virtualenv:

    :::posh
    New-VirtualEnvironment engineer --no-site-packages

Replace `engineer` with whatever you want to call your virtualenv. I usually name it after the project I plan to use that virtualenv for, but whatever you want works. The `--no-site-packages` argument is also optional. By default, virtualenv copies whatever python packages you have installed in your system python environment to a new one. I dislike this behavior since it can unnecessarily pollute a new virtualenv, so I have the habit of disabling it by passing this argument.

*Note: The default virtualenv behavior in recent versions is to not install site packages, so the `--no-site-packages` argument may be superfluous if you're using recent versions.*

After the command completes, you should see a PowerShell prompt that looks like this:

    :::text
    (engineer)PS C:\>

The `(engineer)` prepended to your prompt reminds you that you're currently working within that virtualenv. If you type `workon` now you should see the available virtualenvs, and if you type `workon name_of_another_virtualenv` you'll flip to that environment.

    :::text
    PS C:\> workon

    PathInfo         Name          PathToScripts                 PathToSitePackages
    --------         ----          -------------                 ------------------
    engineer         engineer      C:\Users\tylerbu\.virtuale... C:\Users\tylerbu\.virtuale...


## Install Packages with pip

Now that your virtual environments are configured, you can install packages into them using pip. Open a PowerShell prompt, type `workon name_of_virtualenv` and then type `pip install package_name`. There are also a couple of additional pip commands that might be useful to know. If you have a project with lots of package requirements, it might have come with (or you might have written) a [requirements file][] (often called `requirements.txt`). To have pip load all of the packages in that file, type:

    :::text
    PS C:\> pip install -r path_to_requirements_file
    
Also, you might have downloaded a package's source manually that has a `setup.py` file in it. You can have pip install that for you by typing:
    
    :::text
    PS C:\> pip install -e path_to_source
    
The `-e` option can also check out source directly from a Mercurial, Git, Subversion, or Bazaar repository and install a package from there.


## Automatically Importing the virtualenvwrapper PowerShell Module

You might notice at some point -- probably once you open a new PowerShell prompt -- that you can no longer use the `workon` and `New-VirtualEnvironment` commands. Well, silly, you forgot to import the `virtualenvwrapper` module! Now, you could just import it and move on with your life, but that's going to get annoying really quickly, so you can configure your PowerShell profile so that the module is loaded every time you open up a PowerShell window. First, though, you're going to need to find your profile. To make matters a bit more confusing, there are actually several profiles that PowerShell uses. But only one or two of them are really relevant to us. To see all the profiles available to you, type:

    :::text
    PS C:\> $profile | Format-List * -Force

    AllUsersAllHosts       : C:\Windows\System32\WindowsPowerShell\v1.0\profile.ps1
    AllUsersCurrentHost    : C:\Windows\System32\WindowsPowerShell\v1.0\Microsoft.PowerShell_profile.ps1
    CurrentUserAllHosts    : D:\Users\tyler\Documents\WindowsPowerShell\profile.ps1
    CurrentUserCurrentHost : D:\Users\tyler\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
    Length                 : 77

Looks like there are four available profile scripts, and based on their names, they all have different scopes. In our case, we probably want the `CurrentUserAllHosts` profile, since that will execute for us in every PowerShell instance. If you navigate to the location listed, there might not be a file there to edit. In that case, the following command will create a file there in the right format:

    :::text
    PS C:\> New-Item -Path $Profile.CurrentUserAllHosts -Type file -Force

Or you could just create a file in your favorite text editor and save it in that location (with the correct name, of course).

In that file, put the command you used to import the `virtualenvwrapper` modules earlier

    :::posh
    Import-Module virtualenvwrapper
    
It's worth noting that this file is just a regular PowerShell script, so you can put other stuff in it too, such as aliases you like to set up, etc. Anyway, once that's done, save the file and open a new PowerShell window. Now the `workon` command and other virtualenv cmdlets should start functioning.


## Configuring Your IDE

There is one final step to getting everything really *ready* for developing Python projects -- setting up your IDE to use the appropriate `virtualenv` for your project. There are several different IDEs out there or you could just rock [Notepad++][]. I personally like [PyCharm][] a lot though.

If you *are* using PyCharm, version 2.5+ has built-in support for virtualenv. You can [create virtual environments][2] directly in PyCharm or you can import ones you created earlier using virtualenvwrapper. Personally I prefer the latter since virtualenvwrapper doesn't pick up the environments created by PyCharm (so they don't show up when you use the `workon` command, among another things).

Anyway, if you want to use an existing virtualenv, you'll need to tell PyCharm about it. The [PyCharm support site has details][4], but the key thing to know is that you need to point it to the `python.exe` inside your `virtualenv`'s `Scripts` directory. In my case, the full path is `C:\Users\tyler\.virtualenvs\engineer\Scripts\python.exe`.

After all of that's done you should be good to go! You can pop open a PowerShell window and create/switch to virtualenvs as needed and install packages using pip. At this point you should have most of what you need to follow the installation instructions for most Python packages (except those that require C extension compilation, but that's a topic for another post).

*Last updated May 12, 2013. If you notice any errors or missing/out-of-date information in this guide, please let me know at: __tyler AT tylerbutler DOT com__.*


[1]: http://www.pip-installer.org/en/latest/installing.html#using-the-installer
[2]: http://www.jetbrains.com/pycharm/webhelp/creating-virtual-environment.html
[3]: http://engineer.readthedocs.org/en/latest/installation.html#installing-using-pip
[4]: http://www.jetbrains.com/pycharm/webhelp/configuring-local-python-interpreters.html
[requirements file]: http://www.pip-installer.org/en/latest/requirements.html
[PyCharm]: http://www.jetbrains.com/pycharm/
[Notepad++]: http://notepad-plus-plus.org/
[get-pip.py]: https://raw.github.com/pypa/pip/master/contrib/get-pip.py
[Distribute]: http://pypi.python.org/pypi/distribute
[distribute_setup.py]: http://python-distribute.org/distribute_setup.py
