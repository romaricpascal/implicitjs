babel-plugin-transform-last-statement
===

A Babel plugin to return the last expressions in functions automatically.

Example
---

```js
// Input
function template(data) {
  if (data.onlyFirstname) {
    `${data.firstName}`
  }

  `${data.firstname} - ${data.lastname}`
}

// Will become
function template(data) {
  if (data.onlyFirstname) {
    return `${data.firstName}`
  }

  return `${data.firstname} - ${data.lastname}`
}
```

Transform details
---

The transform will look for the last expression in each branch of the function or the program. It traverses `if`, `else`, `switch` and `try` blocks. Existing `return` or `throw` will prevent the insertion of a `return` so the behaviour already explicitly authored doesn't get short circuited.

The transform will only return expressions, not final `function` (as they get hoisted up to the top of the scope) or `class` . You'll need to return those explicitly.

TODO
---

- [x] Single expression, non string (as they're parsed as directives, like "use strict" if on their own)
- [x] Multiple expressions, non string
- [x] Return statements
- [x] Throw statements
- [x] Trailing function or class
- [ ] Single expression, string
- [x] If statements
- [x] With statements
- [x] Block statements
- [ ] Labelled statements
- [ ] Switch statements
- [x] Try statements
- [ ] Check arrow functions, as well as nested functions
- [ ] Option for injecting a top level return
- [ ] Maintain comments before the function