almost-js
===

> **WORK IN PROGRESS**

A templating engine using as much as possible of what the JavaScript language gives (especially template literals).

Templates are plain JavaScript files whose last non-function statements are returned and formatted into a String.

This allows various things:
```js
// Explicitely require the necessary helpers
// instead of losing which are used in a global 
// list of helpers. It also avoid naming collisions
// between helpers
const {escape} = require('./html')

// Some pre-processing of the template data
// right next to the code rendering it
// (Admitedly the following chunk of code could
// well be in its own helper)
const htmlAttributes = Object.entries(attributes).map(([name,value] => `name=${escape(value)}`)).join(' ');

// Use regular template literals to generate the resulting HTML
`<article ${htmlAttributes}>
  `<h1>${post.title}</h1>`
  ${() => {
    // Function expressions are automatically evaluated
    // Allowing to use plain Javascript `if`
    if (post.excerpt) {
      // Their last statement is automatically returned
      // to not cluter the template with `return`
      post.excerpt
    }
  }}
  ${tagList(post)}
</article>`

// Chunkier part of the template can be extracted
// in their own function
function tagList(post) {
  `<ul>
    ${() => {
      // Just like `if`, `for` loops' final statements get returned
      for(var i = 0; i < post.tags.length; i++) {
        const tag = post.tags[i];
        `<li><a href="/tags/${tag.slug}">${tag.name}</a></li>`
      }
    }}
  </ul>`
}
```

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
- [ ] Globals (`console`,...)
- [ ] Express template engine
- [ ] Webpack loader
- [ ] transform for NodeJS `require`
- [ ] JSX support (compile it to template literals, maybe using this [jsx-to-htm transform](https://github.com/developit/htm/tree/master/packages/babel-plugin-transform-jsx-to-htm))
- [ ] Custom parser to parse statements inside template literal expressions as IIFEs or arrow functions, saving a little more boilerplate, allowing:
  ```js
  `<ul>
    ${for(var i = 0; i < 5; i++) {
      `Value: ${i}`
    }}
  </ul>`
  ```
