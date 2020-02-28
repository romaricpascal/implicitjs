process-template-literals-expressions
===

A helper library that lets you process expressions within template literals.
This opens the door to:

```js
const p = require('process-template-literals-expressions');

// Running the function
p`Look, ${() => 'a plane'}` // 'Look, a plane'
// Joining array elements
p`Look, ${['a', 'plane']}` // 'Look, a plane'
// Stringifying objects
p`Look, ${{a: 'a', plane: 'plane'}}` // 'Look, {"a": "a", "plane": "plane"}
// Awaiting promises
const promiseForAPlane = Promise.resolve('a plane');
p`Look, ${promiseForAPlane}`.then(console.log) // Logs 'Look, a plane'
// Or async functions
p`Look, ${async () => promiseForAPlane}`.then(console.log);
```

Processing options
---

### Numbers and Strings

These are just passed to the function itself, you could [provide your own processor][custom-processor] to escape strings for example.

### Objects

`Object`s will be `JSON.stringify`ed.

### Functions

`Function`s will be invoked and their results processed again.

### Promises

`Promise`s will be awaited and their results processed again.

### Arrays

`Array`s will have each of their item processed and then joined with ' '

Usage
---

Besides tagging templates, you can use the function to create your
own tags, with custom processing or behaviour.

Future
---

Possible enhancements for the function:

### Handle dates

Provide a way to format dates. It'll probably need a `{dateFormatter: Function}` option to customize how dates are rendered.

### Async behaviour control

If any of the expression is a `Promise` or an `AsyncFunction`, the tag will return a `Promise` for the computed `string` rather than the result `string` itself. If you know you don't have any of those, you can force synchronous behaviour by passing `{async: false}` as an option.

```js
p({async: false})`Look, ${() => 'a plane'}`
```

The opposite, `async: true` will enforce asynchronous behaviour (skipping some testings);

### Lazy evaluation

By default, the function will evaluate the template straight away. If you prefer it to create a function for later use, you can set `{lazy:true}` as an option.

The generated function will accept a list of arguments to override the values. Maybe generate something last the second example of MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates. It breaks the string interpolation, though, so maybe provide an option for it? Maybe something like `Look, ${ref('X')}` that'll look up things in the `data` ?

### Custom processor

Customize the processing of the values, which would allow, amongst other things:

- to escape CSS or HTML strings
- to format numbers or dates