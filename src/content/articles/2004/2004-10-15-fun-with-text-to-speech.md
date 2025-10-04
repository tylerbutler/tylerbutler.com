---

title: Fun With Text-to-Speech
date: '2004-10-15T22:25:00-07:00'
slug: fun-with-text-to-speech
tags:
- CSharp
engineer:
  slug: fun-with-text-to-speech
  url: /2004/10/fun-with-text-to-speech/

# Custom Properties
guid: http://blog.tylerbutler.com/index.php/2004/10/fun-with-text-to-speech/

---

At work, we have a mindless task that has to be done manually every hour.
Basically, we have to log into this website and click around a bit to make
sure that the site is still up and running. It's pretty ridiculous, I know,
but it has to be done nonetheless. No one in the office ever remembers to do
it, so I decided it might be nice to have an alarm of sorts. So I remembered
some of my old Micrososft Agent tinkering back in High School, and looked
around for some examples of using the [Windows speech API][1] in C#. It didn't
take me long to figure it out, and the code for my simple text-to-speech
program is deceptively simple. Instead of providing the code as a download,
I'm just posting it here since it is so short.

```csharp

using System;
using SpeechLib;
using System.Threading;

namespace Speak
{
    class Speak
    {
        ///
        /// The main entry point for the application.
        ///  [STAThread]
        static void Main(string[] args)
        {
            SpeechVoiceSpeakFlags flags = SpeechVoiceSpeakFlags.SVSFlagsAsync;
            SpVoice v = new SpVoice();
            if( args.Length > 0 )
            {
                v.Speak(args[0], flags);
            }
            else
            {
                v.Speak("Please specify what you would like me to say.", flags );
            }
            v.WaitUntilDone(Timeout.Infinite);
        }
    }
}
```

Basically all you need is the code above and the Interop.SpeechLib.dll file,
which provides access to the speech utilities. For completeness (and since I
had some trouble finding the DLL), I put a copy of the file up on here.
This program basically just echoes back whatever string you pass in at the
command line, so to get the scheduling working, I just used Windows Task
Scheduler. I scheduled a task to run every hour ever day between 8am and 10pm
(check the advanced settings of the Task Scheduler), then pointed the task to
the compiled program, passing it the string I want it to say as the argument.
Simple. And it works. I still smile every time one of the office computers
says, "It is time to check Blackboard."

   [1]: http://www.microsoft.com/speech/download/sdk51/
