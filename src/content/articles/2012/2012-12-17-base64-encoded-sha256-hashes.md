---

title: Base64 Encoded SHA256 Hashes
date: '2012-12-17T15:26:00-08:00'
teaser: true
slug: base64-encoded-sha256-hashes
tags:
- powershell
- CSharp
- python
engineer:
  slug: base64-encoded-sha256-hashes
  teaser: true
  url: /2012/12/base64-encoded-sha256-hashes/

---

File this away in your "might come in handy some day" drawer... Here's a quick PowerShell script to calculate the Base64 SHA256 hash of a file:

```powershell title="POWERSHELL" showLineNumbers
param(
    [Parameter(Mandatory=$True,
            ValueFromPipeline=$True)]
    $filePath
)

$hasher = [System.Security.Cryptography.SHA256]::Create()
$content = Get-Content -Encoding byte $filePath
$hash = [System.Convert]::ToBase64String($hasher.ComputeHash($content))
Write-Output ($filePath.ToString() + ": " + $hash)
```

You can pipe every file in a directory to this script like this:

```powershell
ls -File |% {.\Get-FileHash.ps1 $_}
```

<!--more-->

### C\#&nbsp;

Or, if you prefer, a C# example:

```csharp title="C#"
using System;
using System.IO;
using System.Security.Cryptography;

static string Base64SHA256(string filePath)
{
    var hasher = SHA256.Create();
    byte[] hashValue;
    using(Stream s = File.OpenRead(filePath))
    {
        hashValue = hasher.ComputeHash(s);
    }
    return Convert.ToBase64String(hashValue);
}
```


### Python

Finally, the same thing in Python. This function is a bit more involved than the other examples because it takes advantage of Python's dynamic typing. You can pass it a string or any object with a `read` attribute. Note that this function relies on the [path.py](https://pypi.python.org/pypi/path.py/2.4.1) module, though you can remove that dependency pretty easily.

```python title="PYTHON"
import hashlib, base64
from path import path

def calc_sha(obj):
    """Calculates the base64-encoded SHA hash of a file."""
    try:
        pathfile = path(obj)
    except UnicodeDecodeError:
        pathfile = None
    sha = hashlib.sha256()

    if pathfile and pathfile.exists():
        return base64.b64encode(pathfile.read_hash('SHA256'))
    elif isinstance(obj, basestring):
        sha.update(obj)
    elif hasattr(obj, 'read'):
        while True:
            d = obj.read(8192)
            if not d:
                break
            sha.update(d)
    else:
        return None

    r = sha.digest()
    r = base64.b64encode(r)
    return r
```

This particular implementation can also be found in my [propane](https://pypi.python.org/pypi/propane/0.1.2) utility library (in the `filetools` module).
