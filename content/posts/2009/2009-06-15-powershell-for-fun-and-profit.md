---

title: PowerShell for Fun and Profit
date: '2009-06-15T19:20:00-07:00'
tags:
- powershell
- sharepoint
engineer:
  slug: powershell-for-fun-and-profit
  url: /2009/06/powershell-for-fun-and-profit/

guid: http://www.tylerbutler.com/?p=460

---

Stefan Goßner has a great post on his blog covering [some common problems][1]
that people have with Content Deployment in SharePoint. Problem 13 has to do
with the default timeout window for Content Deployment jobs. Stefan provides
some sample code that you can use to adjust the timeout value, since it's not
exposed through the UI, but I find writing and running sample code on a server
a bit of a pain. Instead of writing code, you can actually use PowerShell to
do this directly from the PS prompt.

The key to doing this is loading the SharePoint DLLs into your PowerShell
environment. You can do this using the System.Reflection.Assembly class. Take
a look at this sample script:

    #!powershell
    param( $newTimeout = 600 )
    
    [System.Reflection.Assembly]::Load("Microsoft.SharePoint.Publishing, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c")
    
    $cdconfig = [Microsoft.SharePoint.Publishing.Administration.ContentDeploymentConfiguration]::GetInstance()
    
    $cdconfig.RemoteTimeout = $newTimeout
    $cdconfig.Update()
    
    "Updated RemoteTimeout to $newTimeout seconds."

In line 3, I load up the Microsoft.SharePoint.Publishing DLL, then I grab the
`ContentDeploymentConfiguration` (line 5) using the `GetInstance()` static method.
I update the `RemoteTimeout` property, then call `Update()`, and we're done. No
code to write and compile.

This example uses the param keyword, which means you can save it as
`ChangeRemoteTimeout.ps1`, then run it like this:

    PS C:\> ChangeRemoteTimeout –newTimeout 1200

This is completely optional, of course, but if you find yourself doing this a
lot, it might be worth saving it as a reusable script.

You might also want to make changes to some of the options that are exposed
through the UI already. Here's an example:

    
    PS C:\> [System.Reflection.Assembly]::Load("Microsoft.SharePoint.Publishing, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c")
    PS C:\> $cdconfig = [Microsoft.SharePoint.Publishing.Administration.ContentDeploymentConfiguration]::GetInstance()
    PS C:\> $cdconfig.AcceptIncomingJobs = $true
    PS C:\> $cdconfig.RequiresSecureConnection = $false
    PS C:\> $cdconfig.Update()

In this case, I'm configuring the farm to accept incoming deployment jobs and
not require secure connections. You can also make additional changes to other
properties, such as FileMaxSize and RemotePollingInterval using this method.
Stefan covers these properties in his [Pimp My Content Deployment Job][2]
post.

One other note... Using .NET DLLs in PowerShell is generally supported across
the board. It's not limited to the SharePoint DLLs. There's some pretty
exciting stuff you can do here once you start playing around.

   [1]: http://blogs.technet.com/stefan_gossner/pages/content-deployment-best-practices.aspx
   [2]: http://blogs.technet.com/stefan_gossner/archive/2008/05/28/pimp-my-content-deployment-job.aspx

