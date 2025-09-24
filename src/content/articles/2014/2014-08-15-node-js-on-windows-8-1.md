---

title: Node.js On Windows 8.1
date: '2014-08-15T13:33:00-07:00'
slug: node-js-on-windows-8-1
tags:
- node.js
engineer:
  slug: node-js-on-windows-8-1
  url: /2014/08/node-js-on-windows-8-1/

---

This afternoon I installed Node.js version 0.10.30 (the most recent according to <http://nodejs.org/>) on a new Windows box. Unfortunately, after installing, using `npm` was, uhhh, not good:

```ps1
C:\Users\tyler> npm
Error: ENOENT, stat 'C:\Users\tyler\AppData\Roaming\npm'
```

Not exactly a great experience. And that error message? Useless. To me, anyway. I'm sure `ENOENT` means something useful to someone.[^1]

Fortunately, a quick search revealed [this page on Stack Overflow][1], where the 'fix' is outlined: you just need to manually create the npm folder at the path in the error message:

```ps1
C:\Users\tylerbu> mkdir C:\Users\tylerbu\AppData\Roaming\npm


Directory: C:\Users\tylerbu\AppData\Roaming


Mode				LastWriteTime		Length		Name
----				-------------		------		----
d----				8/15/2014			1:25 PM		npm
```

After that, things were golden:

```ps1
C:\Users\tylerbu> npm install grunt
grunt@0.4.5 node_modules\grunt
├── dateformat@1.0.2-1.2.3
├── which@1.0.5
├── eventemitter2@0.4.14
├── getobject@0.1.0
├── colors@0.6.2
├── rimraf@2.2.8
├── async@0.1.22
├── hooker@0.2.3
├── grunt-legacy-util@0.2.0
├── exit@0.1.2
├── lodash@0.9.2
├── nopt@1.0.10 (abbrev@1.0.5)
├── coffee-script@1.3.3
├── iconv-lite@0.2.11
├── underscore.string@2.2.1
├── minimatch@0.2.14 (sigmund@1.0.0, lru-cache@2.5.0)
├── glob@3.1.21 (inherits@1.0.0, graceful-fs@1.2.3)
├── findup-sync@0.1.3 (lodash@2.4.1, glob@3.2.11)
├── grunt-legacy-log@0.1.1 (underscore.string@2.3.3, lodash@2.4.1)
└── js-yaml@2.0.5 (esprima@1.0.4, argparse@0.1.15)
```

[1]: https://stackoverflow.com/questions/25103499/cant-start-npm-on-windows-8-error-enoent-stat-c-users-user-appdata-roaming

[^1]: On the plus side, the `ENOENT` string *did* help me find help on the web more quickly. So, maybe not so bad after all?
