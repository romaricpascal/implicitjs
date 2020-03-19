babel-plugin-transform-jsx-to-template-literals
===

A Babel transform to transform JSX into template literals.

```js
<h1 class={classnames}>{title}</h1>

// Becomes

`<h1 class=${classnames}>${title}</h1>`
```

Children are also handled too:

```js
<article>
  <h2>{title}</h2>
  <div class="content">{content}</div>
</article>

// Becomes

`<article class="article">
  <h2>${title}</h2>
  <div class="article__content">${content}</div>
</article>`
```

If there is a spread, it'll be handled the following way:


```js
<a href={href} {...props}>{content}</a>

// Becomes
`<a ${_attributes({href},props)}>${content}</a>`

// `_attributes` will be imported from a configurable package
// by default, just merge the two hashes
```

Imported components are run

```js
const product = require('product');

<product {...productData}></product>

// Becomes

const product = require('product');

`${product(productData)}`
```

Children are passed to them as a `children` property.

```js
const card = require('card');

<card title={title}>
  <div class="content"></div>
  {() => {/* Some code */}}
</card>

// Becomes
`${card({
    title,
    children: [
      `<div class="content"></div>`,
      () => {/* Some code */}
    ]
)}`
```
