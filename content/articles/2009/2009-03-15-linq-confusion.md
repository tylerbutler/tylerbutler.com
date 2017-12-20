---

title: LINQ Confusion
date: '2009-03-15T07:47:00-07:00'
slug: linq-confusion
tags:
- C#
engineer:
  slug: linq-confusion
  url: /2009/03/linq-confusion/

# Custom Properties
guid: http://www.tylerbutler.com/?p=341

---

I find myself using LINQ a lot in my C# code these days. I use collections all
over the place, and there's no doubt that LINQ makes sorting and slicing
collections a lot simpler code-wise.

In my most recent weekend project, I need to randomly sort a list of cards,
which are represented by an **Action** class. After some quick searching, I
found [some articles][1] that indicated the best way to do this would be to
sort the list by random GUID. This makes sense, though I certainly wouldn't
have thought of it on my own.

The examples given all worked, but not with my lists… With the following code,
the compiler spits out several errors:

    
    List<Action> cards = new List<Action>();
    cards.Add( new OneCattle() );
    cards.Sort( a => Guid.NewGuid() ).ToList<Action>();
    
    Error    1    Delegate 'System.Comparison<agricola.Action>' does not take '1' arguments
    Error    2    Cannot convert lambda expression to type 'System.Collections.Generic.IComparer<agricola.Action>' because it is not a delegate type
    Error    3    Cannot implicitly convert type 'System.Guid' to 'int'
    Error    4    Cannot convert lambda expression to delegate type 'System.Comparison<agricola.Action>' because some of the return types in the block are not implicitly convertible to the delegate return type 

However, using a more explicit LINQ query without a lambda expression seems to
work fine:

    
    var q = from a in cards
            orderby Guid.NewGuid()
            select a;
    List<Action> r = q.ToList<Action>();

Anybody know why this is? I haven't wrapped my head around lambda expressions
and the theory behind LINQ to understand what the root cause is…

   [1]: http://www.dailycoding.com/Posts/random_sort_a_list_using_linq.aspx

