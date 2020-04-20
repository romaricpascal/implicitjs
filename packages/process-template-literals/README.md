process-template-literals-expressions
===

A helper library that lets you process expressions within template literals,
synchronously or asynchronously.

Coupled with omniformat, it opens the door to:

```js
const createProcessorTag = require('process-template-literals');
const omniformat = require('@impjs/omniformat');
// Wrap omniformat to provide our custom configuration
function formatter(expression) {
  return omniformat(expression, {iteratorJoinString: ' '});
}
// Create our tag to process each expression with our formatter
const tag = createProcessorTag(({ strings, expressions }) => {
  const processedExpressions = expressions.map(formatter);
  // Handle that some of the formatted values might have been promises
  if (processedExpressions.some(v => v instanceof Promise)) {
    return Promise.all(processedExpressions).then(
      fullfilledProcessedExpressions => ({
        strings,
        expressions: fullfilledProcessedExpressions
      })
    );
  }
  // If none are Promises, we can keep things synchronous
  return { strings, expressions: processedExpressions };
});

// Running the function
tag`Look, ${() => 'a plane'}` // 'Look, a plane'
// Joining array elements
tag`Look, ${['a', 'plane']}` // 'Look, a plane'
// Stringifying objects
tag`Look, ${{a: 'a', plane: 'plane'}}` // 'Look, {"a": "a", "plane": "plane"}
// Awaiting promises
const promiseForAPlane = Promise.resolve('a plane');
tag`Look, ${promiseForAPlane}`.then(console.log) // Logs 'Look, a plane'
// Or async functions
tag`Look, ${async () => 'a plane'}`.then(console.log);
```

Lazy behaviour
---

By default tags will run as soon as invoked. If you prefer creating a function to invoke later, you can use the `lazy` option.

### Processor signature

The `processor` function receives an object with the following keys:

- `strings`: The list of strings from the template,
- `expressions`: The list of expressions between the template strings.
- `data`: Extra data passed to the

It is expected to return an object of the same structure.

### Async behaviour

If the processor returns a Promise for any of the expression,
the function will await their resolution before stitching
the string back together.

### Lazy evaluation

By default, the function will evaluate the template straight away. If you prefer it to create a function for later use, you can set `{lazy:true}` as an option.

Future
---

Sometimes you might not want to output a `String` from the tag. You can imagine wanting to pipe the result into a `Stream`. The `stitch` function should live outside the main function and be left to compose with other processors. This would allow more customization on the timing of the processing of strings and expressions regarding to their "stitching". In the case of a streamed output, it's likely you'd want to do process a string, send the string, process an expression, send the expression... rather than process strings and expressions, stitch and send everything. This would also leave more flexibility as to what's used for streaming: [Node streams][node-streams], [Observables], [Callbags] (or similar functions).

[callbags]: https://github.com/callbag/callbag
[observables]: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html
[node-streams]: https://nodejs.org/api/stream.html#stream_writable_cork
