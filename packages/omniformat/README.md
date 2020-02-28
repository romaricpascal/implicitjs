Omniformat
===

Formats any value into a String, invoking functions, handling promises results, and mapping iterators' (`Array`, `Map`, `Set`...) values, then joining them. Recursively formats the returned values from functions, promises and iterators.

Installation and usage
---

Install the library via your favourite package manager:

```shell
npm install omniformat
```

Then import or require it in your project and profit

```js
const format = require('omniformat');

format('Look, a plane!') // Strings are passed as is 'Look, a plane!'
format({content: 'Look, a plane!'}) // Objects are JSON.stringified '{"content": "Look, a plane!"}
format(() => 'Look, a plane!') // Functions are evaluated `'Look, a plane!'`
format(Promise.resolve(() => 'Look, a plane!')) // Returns a Promise for 'Look, a plane!'
format(['Look,',() => 'a','plane'], {iteratorJoinString: ' '}) // Iterators elements are each formated and their value `String.prototype.join`ed
```

Formatting description
---

### Numbers and Strings

These are just passed to the function itself.

### Objects

`Object`s will be `JSON.stringify`ed.

> **WARNING**: `JSON.stringify` breaks when objects have circular references. Please take care of this before passing your object to the formatter.

> **FUTURE**: Possibly allow a `objectFormater` option that would customize how Objects are formatted. For example, mapping their values, or traversing to format each key deeply. Or call a `format` method maybe.

### Functions

`Function`s will be invoked and their results formatted again.

### Promises

`Promise`s will be awaited and their results formatted again.

### Arrays & iterators

`Array`s and objects with an iterator (`Sets`,`Maps` and any objects with a `[Symbol.iterator]`, except Strings) will have each of their item formatted, the possible resulting promises awaited, and the results then joined with an empty string.

The string used for joining can be configured with the `iteratorJoinString`.

Extending the function
---

You can implement extra formatting, process the formatted values or override the formatting for specific kinds of expressions by wrapping the `format` function in your own. Don't forget to pass your function as the `formatResults` option so that results of functions, promises and iterators are formatted by your function and not the original implementation.

For example:

```js
// Let's create our own formatter that uppercases strings
function formatWithUppercasedStrings(expression) {
  if (typeof expression === 'string') {
    return expression.toUpperCase();
  }
  // IMPORTANT: Pass the function as the `format` option
  // without it, formating of results will use the original
  // implementation
  return format(expression, {format: formatWithUppercasedStrings});
}
```
