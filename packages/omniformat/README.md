omniformat
===

Formats any value into a String, invoking functions, awaiting promises and mapping iterators' values, then joining them. Recursively formats the returned values from functions, promises and iterators.

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
