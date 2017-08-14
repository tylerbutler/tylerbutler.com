---

title: Ubuntu + LVM
date: '2005-01-20T05:42:00-08:00'
tags:
- ubuntu
engineer:
  slug: ubuntu-lvm
  url: /2005/01/ubuntu-lvm/

guid: http://blog.tylerbutler.com/index.php/2005/01/ubuntu-lvm/

---

I spent this past weekend hacking away at my Media Box, which serves as my
personal free PVR. I wanted to get [Ubuntu][1] on it with LVM so I could use
all four of my hard drives as one for [MythTV][2]. I borrowed one of Vlad's
Ubuntu CD's (mine haven't arrived yet and I couldn't find the one I burnt) and
got the installer running. During the partitioning section of the install, I
set everything up for an LVM volume group and thought I had everything
working. Apparently I didn't. Silly me for not having a clue how LVM works
(always read the directions, kids).

Anyway, my installation was b0rked so I figured I'd just reboot and start from
scratch. No. My LVM data was still present every time I tried to install
Ubuntu. I would try to remove the volume groups and it would fail, reporting
the drives were still in use. I was getting manifest errors up the wazoo. So I
thought, 'OK, I just need to wipe the drives with something else and I'll be
fine.' So I tried booting off an XP CD into rescue mode and formatting the
drives there. No dice. I downloaded a few CD-based disk formatting tools that
**said** they cleared things out but apparently they didn't. [Google][3]
searches were returning a whole bunch of information about how to remove
volume groups, but **nothing** about how to forcefully wipe LVM volumes.
Funny... most people that use LVM and software RAID are concerned about
keeping their data safe. Whatever.

**Finally**, I came across [this forum post][4], which has the necesarry command. In retrospect it makes sense - just write zeroes to the first part of the disk. But I would have never figured it out. For posterity, here's the command you need to run on a device to remove all previous LVM info:
  
    dd if=/dev/zero of=/dev/sda bs=1k count=10

Then of course, I had to figure out how the Ubuntu installer was mounting all
my drives... but that's another story. And by the way... after all of this,
MythTV just wasn't liking my remote, and I was suffering PVR withdrawal pretty
bad, so I'm back to MCE2005. Looks like I'll have to keep fast-forwarding
through the commercials manually. Such is life.

   [1]: http://www.ubuntu-linux.org (Ubuntu, a Debian distro for the masses.  All the cool people do it.)
   [2]: http://mythtv.org (MythTV, the best PVR there is... if you can get it running...)
   [3]: http://www.google.com (Google, I still love you...)
   [4]: http://lists.suse.com/archive/suse-linux-e/2001-Nov/1413.html (Too bad I didn't come across this about 6 hours earlier...)
