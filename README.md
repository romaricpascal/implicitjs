> This repository is now [hosted on Gitlab](https://gitlab.com/romaricpascal/implicitjs). Please head there if you wish to contribute. Thanks 🙂

ImplicitJS
===

ImplicitJS lets you write JavaScript leaving aside some parts that it will complete for you like:

- adding `return` calls to the last statements of functions
- tagging template literals with a specific tag
- replacing unused variables with `data.<name_of_the_variable>` or an `import`

Why?
--- 

The last two items above should give you a hint that it's not just pure laziness.

ImplicitJS is an attempt to use "standard" JavaScript for templating, taking advantage of its template literals. Unfortunately, manually tagging each template literal with the same function to customize their rendering, or having explicit `return` in every anonymous function would make the syntax a bit heavy for templating.

Usage
---

### With Express

The [`implicitjs`][implicitjs] package provide a template engine ready to use with Express.

```js
const {__express} = require('implicitjs');
const express = require('express');

const app = express();
// Configure the ijs extension for template
// to use ImplicitJS
app.engine('ijs', __express);
// And set it as the default view engine (if necessary)
app.set('view engine', 'ijs');
```

### Node API

Along with the Express view Engine, the [`implicitjs`][implicitjs] package also provides methods for compiling or rendering templates.

```js
const {compile,render, compileFile, renderFile} = require('implicitjs');

// Say we have a template. Maybe it's little enough to be written
// directly in our code. 
const STRING_TEMPLATE = "`Value: ${value}`";
// And some data
const data = {value: 10};

// We can compile the template into a function that will accept
// a `data` object with the values of the variables used in the template
const template = compile(STRING_TEMPLATE);
const rendered = template(data);
// Value: 10

// For a one of thing, we can compile and render the template
// directly with `render`
const renderedDirectly = render(STRING_TEMPLATE, data);
// Value: 10

// Most likely though, the templates will be heavier and
// it'll be tidier to write them in their own file.
const PATH_TO_TEMPLATE = 'path/to/the/template';

// Just like for a string template, they can be compiled
// to a function
const templateFromFile = compileFile(PATH_TO_TEMPLATE);
const renderedFromFile = template(data)

// Or rendered directly
const renderDirectlyFromFile = renderFile(PATH_TO_TEMPLATE, data);
```

### With Bundlers

Behind the scene, ImplicitJS is a set of Babel transforms. You can use the [`babel-preset-impjs`][babel-preset-implicit] in your Babel configuration to compile files into ES6 modules.

The preset only takes care of the implicit syntax transformations. Most likely, you'll also want to use `@babel/preset-env`, or maybe bring in specific plugins like `babel-plugin-proposal-pipeline-operator` (handy for filter-like syntaxes that other template languages have). It's up to you to add them in your Babel configuration.

[implicitjs]: 'packages/implicitjs',
[babel-preset-impjs]: 'packages/babel-preset-impjs'

TODO
---

- [x] Basic proof of concept
- [x] Configuration options
  - [x] Override formatting of template expressions
  - [x] Override function used for tagging literals
- [x] General API
  - [x] `compile`
  - [x] `compileFile`
  - [x] `render`
  - [x] `renderFile`
- [x] Caching
- [x] Require other templates
- [x] Globals (`console`,...)
- [x] Express template engine
- [x] Webpack loader => Use babel preset
- [x] transform for NodeJS `require` => Use babel preset
- [ ] JSX support (compile it to template literals, maybe using this [jsx-to-htm transform](https://github.com/developit/htm/tree/master/packages/babel-plugin-transform-jsx-to-htm))
- [ ] Custom parser to parse statements inside template literal expressions as IIFEs or arrow functions, saving a little more boilerplate, allowing:
  ```js
  `<ul>
    ${for(var i = 0; i < 5; i++) {
      `Value: ${i}`
    }}
  </ul>`
  ```
- [ ] Make sure each package is appropriately documented.
