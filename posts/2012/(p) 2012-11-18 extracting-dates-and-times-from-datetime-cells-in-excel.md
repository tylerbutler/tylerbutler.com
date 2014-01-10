---

title: Extracting Dates and Times from DateTime Cells in Excel
timestamp: 04:33 PM Sunday, November 18, 2012 PST
status: published
slug: extracting-dates-and-times-from-datetime-cells-in-excel
tags:
- excel
url: /2012/11/extracting-dates-and-times-from-datetime-cells-in-excel/

---

You may, at some point in your life, find yourself needing to take some data that represents a combined date and time and extract from it *only* the date or *only* the time. And should you find yourself in such a position, then this post might just save you a bunch of time.


## The Magic Formulae

Assume our data looks like this:

|     |  A                      |  B  |  C  |
----  |  ---------------------  |  -- |  -- |
**1** |  8/15/2012 3:39:59 PM   |     |     |
**2** |                         |     |     |

`A1` contains our date/time, and we want to put the date only in `B1` and the time only in `C1`.


### Extracting the Date

Put this formula in `B1` to extract the date:

    =TRUNC(A1)

Then format `B1` with whatever date format you want. Done!

If you search the web for answers to this basic question, a lot of the suggestions are to use a combination of the `DATE`, `MONTH`, `YEAR` and `DAY` functions.[^excel1] That works, but it's really silly in my opinion -- `TRUNC` is almost certainly faster, especially if you have a large quantity of data.


### Extracting the Time

Put this formula in `C1` to extract the time:

    =MOD(A1, 1)

Then format `C1` with whatever time format you want. Done!


## How It Works

The best explanation I've found comes from an article titled [How Excel Handles Dates and Times][explanation]. Unfortunately it's inexplicably an MHTML file, so you might have trouble opening it.[^excel2] I made a [PDF copy][pdf] of the article that should work for most people.

Anyway, from the article:

> To Excel, a date is simply a number. More precisely, a date is a serial number that represents the number of days since the fictitious date of January 0, 1900. A serial number of 1 corresponds to January 1, 1900; a serial number of 2 corresponds to January 2, 1900, and so on. This system makes it possible to deal with dates in formulas.

OK, that's pretty straightforward. But what about times?

> When you need to work with time values, you simply extend the Excel date serial number system to include decimals. In other words, Excel works with times by using fractional days. For example, the date serial number for June 1, 2007, is 39234. Noon (halfway through the day) is represented internally as 39234.5.

Ahhh, there we go! Everything to the left of the decimal represents the date, and everything to the right represents the time. We don't actually need to worry about actually *converting* those numbers into dates and times -- Excel handles that for us, but behind the scenes everything's a number. And since we're just talking about numbers, we can apply some simple mathematics.

In the case of dates, we truncate the number using the [TRUNC][] function, which simply lops off the decimal numbers. This is obviously fast -- all Excel needs to do is forget about the decimal values.

The time case is a little bit tricker. We want to do the same thing, but instead of lopping off the numbers to the right of the decimal, we want to lop off the numbers to the *left.* Thankfully, math saves us again. The [modulo operation][] (available in Excel via the [MOD][] function) allows us to find the remainder of a division operation. Since we want the numbers to the right of the decimal only, we mod the value by 1. Since the modulo operation gives us the *remainder*, the result is the decimal portion of the original number.

Again, since this is simple math and doesn't require any fancy conversions of the data, it's faster, not to mention simpler to write in the little Excel formula window.

I hope we can all agree there is sufficient compelling evidence that math is *awesome.*



[^excel1]: I've chosen not to regurgitate this suboptimal solution so it doesn't continue to set a bad example...

[^excel2]: It appears that Chrome does support MHTML, and I think Firefox does with an extension. Regardless, the PDF is likely easier.

[explanation]: http://office.microsoft.com/en-us/excel-help/redir/AM010288575.aspx?CTT=5&origin=HA010287495
[pdf]: https://dl.dropbox.com/u/12062432/tylerbutler.com/excel_date_times_explanation.pdf
[TRUNC]: http://office.microsoft.com/en-us/excel-help/trunc-function-HP010342970.aspx
[modulo operation]: https://en.wikipedia.org/wiki/Modulo_operation
[MOD]: http://office.microsoft.com/en-us/excel-help/mod-function-HP010342698.aspx
