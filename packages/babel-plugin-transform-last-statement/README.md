babel-plugin-transform-return-last-expression
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

- [ ] Single expression, non string (as they're parsed as directives, like "use strict" if on their own)
- [ ] Multiple expressions, non string
- [ ] Trailing function or class
- [ ] Single expression, string
- [ ] If statements
- [ ] Switch statements
- [ ] Try statements
- [ ] Check arrow functions, as well as nested functions
- [ ] Option for injecting a top level return
- [ ] Maintain comments before the function