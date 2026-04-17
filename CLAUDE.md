# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Run the engine (reads `index.html`, writes `output/index.html`): `node index.js`
- Install deps: `npm install`

No test runner, linter, or build step is configured. `npm test` is a placeholder that intentionally exits 1.

## Architecture

This is a single-file JavaScript template engine (`index.js`) built as a learning exercise, inspired by John Resig's micro-templating and Krasimir Tsonev's 20-line template engine.

Two collaborating concerns live in one file:

1. **`TemplateEngine(template, data)`** — the engine itself. It walks the template with the regex `/<%([^%>]+)?%>/g`, building up a string of JavaScript source code in a `code` variable:
   - Static text between tags is pushed as string literals onto an array `r`.
   - Content inside `<% %>` is classified by `reExp` (`/(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g`): control-flow lines are emitted verbatim so loops/conditionals nest correctly; everything else is pushed onto `r` as an expression.
   - The assembled code is passed to `new Function(...)` and invoked with `.apply(data)`, so template expressions reference inputs via `this.*` (e.g. `<% this.skills[index] %>`).

2. **File pipeline** (bottom half of `index.js`) — reads `index.html`, runs it through `TemplateEngine` with a hard-coded data object, formats the result with `prettier` (HTML parser), ensures the `output/` directory exists via `fs.mkdirSync(..., { recursive: true })`, and writes `output/index.html`. The `output/` folder is gitignored.

### Gotchas worth knowing before editing

- **Syntax mismatch with the README.** The README advertises `<%= %>` for output and `<% %>` for logic, but the implementation only recognizes `<% %>`. Output expressions in the sample template look like `<% this.level %>` (no `=`). If you add `<%= %>` handling, update both the regex and the branching in `add()`; don't just change the docs.
- **`match` is an implicit global** on the `while ((match = regex.exec(template)))` line — no `var`/`let`. Preserve or fix deliberately; the global is shadow-free in this file but would bite if the engine were imported as a module.
- **`new Function()` runs untrusted code.** The template is evaluated as JavaScript with full access to the host. Treat templates as trusted input; do not wire user input into the template string.
- **Data is hard-coded** in the `fs.readFile` callback. To render a different page, edit that object or refactor the callback to accept data from elsewhere — there is no CLI argument parsing.
- **Prettier is async;** the write happens inside a `.then(...)` chain that calls `writeFile` (a local async function, not `fs.writeFile` directly). Preserve the ordering if adding post-processing steps.
