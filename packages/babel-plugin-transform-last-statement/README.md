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

- [ ] Handle the various kinds of statements (full list from [Babel parser's spec][babel-parser-spec])
  - [x] ExpressionStatement
  - [x] BlockStatement
  - [x] EmptyStatement
  - [x] DebuggerStatement
  - [x] WithStatement
  - [ ] Control flow
    - [x] ReturnStatement
    - [x] LabeledStatement
    - [ ] BreakStatement
    - [ ] ContinueStatement
  - [x] Choice
    - [x] IfStatement
    - [x] SwitchStatement
    - [x] SwitchCase: Only adds return in a block where a `break` is set to allow fall through
  - [x] Exceptions
    - [x] TryStatement
    - [x] ThrowStatement
    - [x] CatchClause (Do nothing, too risky)
  - [ ] Loops
    - [ ] WhileStatement
    - [ ] DoWhileStatement
    - [ ] ForStatement
    - [ ] ForInStatement
    - [ ] ForOfStatement
  - [ ] Declarations
    - [ ] Variable declaration
    - [x] Function declaration (Use explicit return for functions, as they might be last to make the code more readable, taking advantage of hoisting)
- [ ] Nesting - Handle the 3 places to return from
  - [x] Top level program
  - [x] Functions
  - [x] Arrow functions
  - [ ] Option for enabling the top level return
- [ ] Maintain comments
- [ ] Sourcemaps

[babel-parser-spec]: https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md#patterns