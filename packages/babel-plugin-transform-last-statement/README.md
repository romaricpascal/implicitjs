babel-plugin-transform-last-statement
===

A Babel plugin to transform the last statements of functions (as well as the program itself if enabled via its options). By default, it'll turn them into return statements.

This is part of an [attempt to push template literals as far as possible towards being used as other template formats (like `nunjucks`, `pug`...). Running functions inside the template expressions was a good step (see [process-template-literals] and [omniformat]). It made expressing conditionals, as well as loops,especially, cumbersome to read if riddled with `return`. This transform allows a lighter syntax like:

```js
function template(data) {
  `<ul>
    ${() => {
      for(var i = 0; i++; i <5){
        `<li>${i}</li>`
      }
    }}
  </ul>`
}

// Will get turned into the more verbose:

function template(data) {
  return `<ul>
    ${() => {
      var _result = [];
      for(var i = 0; i++; i <5){
        _result.push(`<li>${i}</li>`);
      }
      return _result;
    }}
  </ul>`
}
```

Its use is not limited to templates and it will work on any kind of functions (including class and object methods):

```js
// Input
function template(data) {
  if (data.onlyFirstname) {
    `${data.firstName}`
  }

  `${data.firstname} - ${data.lastname}`
}

// Will become the following. Note the first if
// doesn't return as we can't make any assumptions
// about whether it should return or not. 
function template(data) {
  if (data.onlyFirstname) {
    `${data.firstName}`
  }

  return `${data.firstname} - ${data.lastname}`
}
```

And of course, you can still explicitly return as you please.

Usage
---

Install the plugin with your favourite package manager. For example, with NPM:

```sh
npm install --save-dev babel-plugin-transform-last-statement
```

Then in your [Babel configuration][babel-configuration], add it to the list of plugins:

```js
{
  plugins:['transform-last-statement']
}
```

Options
---

- `topLevel`: By default, the plugin only processes the last statements of functions. Toggling that option on with `topLevel: true` will also have it process the last statement of the file too.

Processing details
---

The transform traverses the functions statements, last to first, to determine which to process. It looks into blocks like `if`,`else`, `switch`, `try`..., gathers the results of loops `for`, `do{...}while`... into arrays, and stops the processing if a `return`, `throw`, `continue` was found.

It transforms the last statement, making the function `return` it. It ignores: 

- function declarations, as they might be written last for readability, taking advantage of hoisting
- variable declarations, because I couldn't see a valid use case for declaring a variable as last statement. Either `return` directly, or do something with the variable in further statements.
- empty statements (for ex a line with only a semi-colon) are ignored, as it doesn't help readability to spot a `;` that'll get transformed in `return;` and make the function return undefined instead of its last actual value.
- `break` statements, though they are markers for knowing when to return in `switch` statements. 

The transform **does not**:

- take care of eliminating dead code, like a `break` left after an injected `return`. This left to minifiers
- do clever things to detect empty blocks. If you do need that kind of block (I couldn't imagine a use case), you'll need to return explicitly:

  ```js
  function tempalte() {
    `this won't be returned automatically`
    if (test){
      ;
      ;
    }
  }
  ```

See the [annotated source][annotated-source] for details on [how each kind of statements][babel-parser-spec] is processed.

[babel-parser-spec]: https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md#patterns

Possible future work
---

- [ ] Refactor the traversal to use a visitor more similar to Babel's regular visitor.
- [ ] Allow customisation of how the last statement is processed. This could allow, for example, to write the expression to a [Writable stream][writable-stream]

Contributing
---

I'm happy to consider [issues][github-issues] or [pull requests][github-pr]. However **I can't make any guarantee on how responsive I can be reviewing them**

- For **bugs**, please provide an (ideally isolated) sample of the code triggering the issue, with the behaviour you'd expect.
- For **new features**, please provide samples of input and output code.
- For **code contributions**, please make sure:
  - that you updated tests. You can either add new `.test.js` file in the `__tests__` folder, or a `.input.js` file that will get compared with the corresponding `.output.js` file in the `__tests__/__fixtures__/index`. See the `index.test.js` file if you need to tweak processing for specific tests.
  - your code is linted ([husky] should take care of setting up a git-hook before commit)
  - your commit messages follow the conventional changelog convention ([commitizen] can help you there)

  These links might also come handy:

  - [AST Explorer][ast-explorer]: For visualizing the AST (pick `babylon7` as parser) and trying out transforms (pick `babelv7` as transform). 
  - [Babel AST specifications][babel-ast]: List of the nodes that can be part of the AST created by Babel
  - [Babel handbook][babel-handbook]: The guide for creating Babel plugins

[annotated-source]: docs/index.html#traversal-of-individual-statements
[writable-stream]: https://nodejs.org/api/stream.html#stream_class_stream_writable
[babel-configuration]: https://babeljs.io/docs/en/config-
[process-template-literals]: https://github.com/rhumaric/process-template-literals
[omniformat]: https://github.com/rhumaric/omniformat
[github-issues]: https://github.com/rhumaric/babel-plugin-transform-last-statement/issues
[github-pr]:https://github.com/rhumaric/babel-plugin-transform-last-statement/pulls
[husky]: https://github.com/typicode/husky
[commitizen]: https://github.com/commitizen/cz-cli
[ast-explorer]: https://astexplorer.net/
[babel-ast]: https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md
[babel-handbook]: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
