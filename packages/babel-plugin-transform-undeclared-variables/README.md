babel-plugin-transform-undeclared-variables
===

A Babel transform to transform undeclared variables into a getter call or an import.

Note: undeclared variables on the left hand side of assignments are ignored.

```js
function template(data) {
  return html`A template ${literal}`;
}

// Would become
import html from './templateTag';

function template(data) {
  return html`A template ${data.literal}`;
}

```

Usage
---

Install the plugin with your favourite package manager. For example, with NPM:

```sh
npm install --save-dev babel-plugin-transform-last-statement
```

Then in your [Babel configuration][babel-configuration], add it to the list of plugins:

```js
{
  plugins:['transform-undeclared-variables']
}
```

Options
---

By default, the transform will turn all undeclared variables into a getter call on the `data` object. You can configure:

- `default`: the default behaviour,
- `variables`: the behaviour for specific variables

```js
default: getter('<otherObjectName'),
variables: {
  '<undeclaredIdentifierName>': getter('<objectName>'),
  '<otherUndeclaredIdentifierName>': addImport('<package>', {name: '<exportName>'}).
  '<yetAnotherUndeclaredIdentifierName>': function(path) { 
    // Do whatever you need to transform that specific identifier
  }
}
```

Possible future work
---
- [ ] Allow configuration through non-JS babel configuration files, by allowing arrays instead of function calls
  ```json
  {
    "default": ["getter","otherObject"],
    "variables": {
      "undefinedVariable": ["addImport","package", {name: "exportName"}]
    }
  }
  ```
- [ ] Handle left side of assignments by creating a variable declaration automatically (type of declaration configurable).

[babel-configuration]: https://babeljs.io/docs/en/config-files