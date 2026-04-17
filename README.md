# Simple JavaScript Template Engine

A minimal JavaScript template engine that compiles `<% %>` markup into a function and renders it against a data object.

## Overview

The engine reads an HTML template containing embedded JavaScript, renders it with a supplied data object, and writes a formatted HTML file to disk. It has a single runtime dependency (`prettier`, used only to pretty-print the output).

## How it works

A regex walks the template and splits it into static chunks and tag contents. Control-flow lines inside `<% %>` are emitted verbatim into the generated source; non-control lines are pushed onto a result array as expressions. The assembled source is compiled with `new Function()` and invoked with `.apply(data)`, so template expressions reference inputs via `this.*`.

## Template syntax

Only `<% %>` tags are recognized. Two usage patterns:

- **Control flow** — anything starting with `if`, `for`, `else`, `switch`, `case`, `break`, `{`, or `}` is emitted as code:

  ```html
  <% if (this.isAdmin) { %>
    <p>Welcome, admin.</p>
  <% } else { %>
    <p>Welcome.</p>
  <% } %>

  <% for (var i in this.items) { %>
    <li><% this.items[i] %></li>
  <% } %>
  ```

- **Output expression** — anything else inside the tag is evaluated and its value inserted into the output:

  ```html
  <h1>Hello, <% this.name %>!</h1>
  ```

Classification is performed by the regex at [index.js:12](index.js#L12).

## Prerequisites

- Node.js 16 or newer
- npm

## Run it locally

```bash
git clone https://github.com/QBERT18/build-my-own-template-engine.git
cd build-my-own-template-engine
npm install
node index.js
```

After `node index.js` finishes, open the generated `output/index.html` in a browser. The `output/` folder is created automatically and is not tracked in git.

## Example

Minimal usage (the `TemplateEngine` function is defined at the top of [index.js](index.js); copy it into your own script to use it standalone):

```js
var template =
  "<h1>Hello, <% this.name %>!</h1>" +
  "<% if (this.items.length) { %>" +
  "<ul><% for (var i in this.items) { %><li><% this.items[i] %></li><% } %></ul>" +
  "<% } else { %>" +
  "<p>No items.</p>" +
  "<% } %>";

var html = TemplateEngine(template, {
  name: "Ada",
  items: ["one", "two", "three"],
});
```

Rendered output:

```html
<h1>Hello, Ada!</h1>
<ul><li>one</li><li>two</li><li>three</li></ul>
```

For a full end-to-end example, see the sample template [index.html](index.html) and the data object used by the runner at [index.js:39-46](index.js#L39-L46). Running `node index.js` renders that template into `output/index.html`.

## Project layout

- `index.js` — the template engine plus a runner that reads `index.html` and writes `output/index.html`.
- `index.html` — sample template used by the runner.
- `styles.css` — stylesheet referenced by the sample template.
- `output/` — generated output directory (created on first run, gitignored).

## Limitations

- `new Function()` evaluates template contents as JavaScript with full access to the host process. Only render templates you trust.
- The data object is hard-coded in `index.js`; there is no CLI argument parsing. To render with different inputs, edit the object passed to `TemplateEngine` or import the function into your own script.
- There is no `<%= %>` shorthand. Every `<% %>` tag is either control flow (per the classifier above) or an output expression.

## Inspiration

Ideas and techniques drawn from:

1. [JavaScript Template Engine in Just 20 Lines](https://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line) by Krasimir Tsonev
2. [JavaScript Micro-Templating](https://johnresig.com/blog/javascript-micro-templating/) by John Resig

## License

MIT.
