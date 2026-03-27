---
title: 'Markdown Formatting Test Article'
date: '2025-01-02T12:00:00-08:00'
slug: markdown-test
tags:
  - test
  - markdown
  - formatting
excerpt: 'A comprehensive test article demonstrating all supported markdown formatting features including headings, lists, code blocks, blockquotes, tables, and more.'
draft: true
---

This is a comprehensive test article to verify all markdown formatting features are working correctly. It includes examples of every supported markdown element.

<!--more-->

## Headings

All heading levels are supported and will be auto-linked:

### Level 3 Heading
#### Level 4 Heading
##### Level 5 Heading
###### Level 6 Heading

## Text Formatting

**Bold text** and __also bold__.

*Italic text* and _also italic_.

***Bold and italic*** and ___also bold and italic___.

~~Strikethrough text~~

Inline `code snippets` work great.

## Links and References

[Standard link](https://tylerbutler.com)

[Link with title](https://tylerbutler.com "Tyler Butler's Website")

<https://tylerbutler.com> - automatic link

Internal link: [About page](/about/)

Reference-style links[^1] with footnotes.

## Lists

### Unordered Lists

- First item
- Second item
  - Nested item 1
  - Nested item 2
    - Deeply nested item
- Third item
  - Another nested item

### Ordered Lists

1. First item
2. Second item
   1. Nested item
   2. Another nested
3. Third item

### Task Lists

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
  - [ ] Nested incomplete
  - [x] Nested complete

## Blockquotes

> This is a simple blockquote.
> It can span multiple lines.
> And they will be formatted as a single paragraph.

> A quote from someone.
>
> <footer>Use a footer for a reference, <a href="https://tylerbutler.com">and maybe a link</a></footer>

> [!NOTE]
> This is a GitHub-style note alert.

> [!TIP]
> This is a GitHub-style tip alert.

> [!IMPORTANT]
> This is a GitHub-style important alert.

> [!WARNING]
> This is a GitHub-style warning alert.

> [!CAUTION]
> This is a GitHub-style caution alert.

> Nested blockquotes:
> > This is nested
> > > And this is deeply nested

## Code Blocks

### Basic Code Block

```
Plain text code block
No syntax highlighting
```

### JavaScript with Title and Line Numbers

```js title="fibonacci.js" showLineNumbers
// JavaScript with automatic line numbers
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(`Fibonacci(10) = ${result}`);
```

### TypeScript with Highlighting

```ts title="src/types/User.ts" {3, 8-10}
// TypeScript with line highlighting
interface User {
  id: number; // Highlighted line
  name: string;
  email: string;
}

function greetUser(user: User): string {
  // These lines are highlighted
  return `Hello, ${user.name}!`;
}

const user: User = {
  id: 1,
  name: "Tyler",
  email: "test@example.com"
};
```

### Python with Diff Markers (ins/del)

```python title="quicksort.py" del={5} ins={6}
# Python with insertions and deletions
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    pivot = arr[0]  # Using first element as pivot
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

numbers = [3, 6, 8, 10, 1, 2, 1]
sorted_numbers = quicksort(numbers)
print(sorted_numbers)
```

### Rust with Text Markers

```rust title="factorial.rs"
// Rust with inline text markers
fn factorial(n: u64) -> u64 {
    match n {
        0 => 1,
        _ => n * factorial(n - 1),  // Recursive call
    }
}

fn main() {
    let num = 5;
    println!("Factorial of {} is {}", num, factorial(num));
}
```

### C# with Multiple Features

```csharp title="Program.cs" showLineNumbers {9-10}
// C# with title, line numbers, and highlighting
using System;
using System.Linq;

public class Program
{
    public static void Main()
    {
        // These two lines are highlighted
        var numbers = Enumerable.Range(1, 10);
        var evens = numbers.Where(n => n % 2 == 0);

        Console.WriteLine("Even numbers: " + string.Join(", ", evens));
    }
}
```

### Code with Focus (Neutral Highlighting)

```js title="api.js" {3, 6}
// Highlighting important lines
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}
```

### Diff Example with Syntax Highlighting

```diff lang="js"
  function calculateTotal(items) {
-   return items.reduce((sum, item) => sum + item.price, 0);
+   // Add tax calculation
+   const subtotal = items.reduce((sum, item) => sum + item.price, 0);
+   return subtotal * 1.08;
  }
```

### HTML with Line Numbers

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Page</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a test page.</p>
</body>
</html>
```

### CSS

```css
/* CSS without line numbers */
:root {
  --primary-color: #a2834e;
  --background-color: #f7f6f5;
  --text-color: #262626;
}

.container {
  max-width: 636px;
  margin: 0 auto;
  padding: 2rem;
}

.heading {
  font-family: 'Advent Pro', sans-serif;
  color: var(--primary-color);
}
```

### Haskell - Ligature Showcase

```haskell
-- Haskell showcasing font ligatures: <=, >=, ==, /=, ->, =>
quicksort :: Ord a => [a] -> [a]
quicksort [] = []
quicksort (x:xs) =
    let smaller = quicksort [a | a <- xs, a <= x]
        bigger  = quicksort [a | a <- xs, a > x]
    in smaller ++ [x] ++ bigger

compose :: (b -> c) -> (a -> b) -> (a -> c)
compose f g = \x -> f (g x)

fibonacci :: Integer -> Integer
fibonacci n
    | n <= 1    = n
    | otherwise = fibonacci (n - 1) + fibonacci (n - 2)

-- Type constraints and arrows: =>, ->, /=, >=, <=
isValid :: Eq a => a -> a -> Bool
isValid x y = x /= y && x >= y || x <= y
```

### Gleam - Modern Ligatures

```gleam
// Gleam showcasing modern ligatures: ->, |>, <-, ==, !=, <=, >=
import gleam/io
import gleam/list
import gleam/result

pub fn main() {
  // Pipeline operator |> and arrow ->
  [1, 2, 3, 4, 5]
  |> list.map(fn(x) { x * 2 })
  |> list.filter(fn(x) { x >= 4 })
  |> list.each(io.println)
}

// Pattern matching with -> and comparison operators
pub fn compare(a: Int, b: Int) -> String {
  case a, b {
    a, b if a == b -> "equal"
    a, b if a >= b -> "greater or equal"
    a, b if a <= b -> "less or equal"
    a, b if a != b -> "not equal"
    _, _ -> "unknown"
  }
}

// Function composition with arrows
pub fn pipeline_example(value: Int) -> Int {
  value
  |> add_one
  |> multiply_two
  |> subtract_three
}

fn add_one(x: Int) -> Int { x + 1 }
fn multiply_two(x: Int) -> Int { x * 2 }
fn subtract_three(x: Int) -> Int { x - 3 }
```

### Font Ligatures Demo

```js
// Showcasing common programming ligatures
// Comparisons: ==, !=, ===, !==, <=, >=
const isEqual = (a, b) => a === b && a !== null;
const inRange = (x, min, max) => x >= min && x <= max;

// Arrows: =>, ->, <-, <=>
const map = arr => arr.map(x => x * 2);
const compose = (f, g) => x => f(g(x));

// Logic operators: ||, &&, ??
const result = value ?? fallback || default && backup;

// Special operators: |>, <|, <>, ++, --, **, ===
const pipeline = data
  |> transform
  |> validate
  |> process;

// Combined ligatures
if (x >= 10 && y <= 20) {
  return x !== y ? x : y;
}

// More arrow variations: =>, ->, ~>, <=, >=, <=>
const funcs = {
  arrow: () => {},
  bigarrow: () => true,
  compare: (a, b) => a >= b || a <= b,
};
```

### JSON

```json
{
  "name": "test-package",
  "version": "1.0.0",
  "dependencies": {
    "astro": "^5.13.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build"
  }
}
```

### Shell/Bash

```bash
#!/bin/bash

# Build and deploy script
echo "Building site..."
npm run build

echo "Running tests..."
npm test

if [ $? -eq 0 ]; then
  echo "Deploying to production..."
  netlify deploy --prod
else
  echo "Tests failed, aborting deployment"
  exit 1
fi
```

### SQL

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email)
VALUES
  ('Tyler Butler', 'tyler@example.com'),
  ('Jane Doe', 'jane@example.com');

-- Query users
SELECT id, name, email
FROM users
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

## Tables

### Basic Table

| Feature | Supported | Notes |
|---------|-----------|-------|
| Markdown | ✅ | Full GFM support |
| Code Blocks | ✅ | Expressive Code |
| Tables | ✅ | GitHub-style |
| Footnotes | ✅ | Custom plugin |

### Alignment Table

| Left | Center | Right |
|:-----|:------:|------:|
| Left aligned | Center aligned | Right aligned |
| Text | More text | Numbers: 123 |
| A | B | C |

## Horizontal Rules

Three different syntaxes:

---

***

___

## Images

![Alt text for image](https://via.placeholder.com/600x300)

![Image with title](https://via.placeholder.com/400x200 "Image Title Text")

## Inline HTML

You can use <strong>inline HTML</strong> within markdown.

<div style="border: 2px solid #a2834e; padding: 1rem; margin: 1rem 0;">
  This is a custom HTML block with styling.
</div>

## Special Characters

Smart quotes: "double" and 'single'

Em dash — and en dash –

Ellipsis...

Arrows: → ← ↑ ↓

Copyright © Trademark ™ Registered ®

## Mermaid Diagrams

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Deploy]
```

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    User->>Browser: Open website
    Browser->>Server: HTTP Request
    Server->>Browser: HTML Response
    Browser->>User: Render page
```

## Definition Lists

<dl>
  <dt>Term 1</dt>
  <dd>Definition 1a</dd>
  <dd>Definition 1b</dd>

  <dt>Term 2</dt>
  <dd>Definition 2</dd>
</dl>

## Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

## Line Breaks

Use two spaces at the end of a line
to create a line break without a new paragraph.

Or use a backslash\
at the end of the line.

Or use `<br/>` tags.<br/>
Like this.

## Escaping

You can escape special characters:

\* Not a list item

\# Not a heading

\[Not a link\](url)

## Combining Features

> **Code in blockquotes:**
>
> ```js
> const message = "Hello from a code block in a blockquote!";
> console.log(message);
> ```

**Lists with code:**

1. First item with `inline code`
2. Second item with a code block:
   ```python
   def example():
       return "code in list"
   ```
3. Third item

**Table with code:**

| Language | Example |
|----------|---------|
| JavaScript | `const x = 42;` |
| Python | `x = 42` |
| Rust | `let x: i32 = 42;` |

## Footnotes Section

This text has a footnote reference[^2].

Multiple footnotes[^3] can be used[^4] in the same paragraph.

[^1]: This is the first footnote with a reference-style link.
[^2]: This is the second footnote with **bold text** and *italic text*.
[^3]: Footnotes can contain multiple paragraphs.

    Like this one with indented content.

    And even code: `const x = 42;`

[^4]: The fourth footnote with a [link](https://tylerbutler.com).

## Summary

This test article includes:

- ✅ All heading levels (2-6)
- ✅ Text formatting (bold, italic, strikethrough, code)
- ✅ Links (inline, reference, automatic)
- ✅ Lists (ordered, unordered, task, nested)
- ✅ Blockquotes (simple, nested, GitHub alerts with colors)
- ✅ Code blocks with Expressive Code features:
  - Syntax highlighting for 10+ languages
  - Titles/filenames
  - Line numbers
  - Line highlighting
  - Diff markers (ins/del)
  - Multiple features combined
- ✅ Tables (basic and aligned)
- ✅ Horizontal rules
- ✅ Images
- ✅ Inline HTML
- ✅ Special characters and typography
- ✅ Mermaid diagrams
- ✅ Definition lists (HTML)
- ✅ Abbreviations (via `remark-abbr` plugin)
- ✅ Footnotes
- ✅ Combined features

Use this article to verify HTML output and styling consistency.
