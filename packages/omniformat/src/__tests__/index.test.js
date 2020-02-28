const test = require('ava');
const format = require('..');

// Strings
test('it just passes the strings', t => t.is('a string', format('a string')));

// Numbers
test('it just passes numbers', t => {
  t.is('25', format(25));
});
test('it outputs 0', t => {
  t.is('0', format(0));
});
test('it preserves the - of -0', t => {
  t.is('-0', format(-0));
});
test('it displays Infinity', t => {
  t.is('Infinity', format(Infinity));
});

// Empty values
test('it renders undefined as an empty string', t =>
  t.is('', format(undefined)));
test('it renders null as an empty string', t => t.is('', format(null)));
test('it renders NaN as an empty string', t => t.is('', format(NaN)));

// Objects
test('it stringifies objects', t => t.is('{"a":1}', format({ a: 1 })));

// Booleans
test('it renders true', t => {
  t.is('true', format(true));
});
test('it renders false', t => {
  t.is('false', format(false));
});

// Functions
test('it invokes functions', t => {
  t.is(
    'a string',
    format(() => 'a string')
  );
});
test('it processes the output of the function', t => {
  t.is(
    '{"a":1}',
    format(() => {
      return {
        a: 1
      };
    })
  );
});

// Promises
test('it returns a promise that provides the formated value', t => {
  return format(Promise.resolve({ a: 1 })).then(v => t.is('{"a":1}', v));
});

test('it retruns a promise if the function returns a promise', t => {
  return format(() => Promise.resolve({ a: 1 })).then(v => t.is('{"a":1}', v));
});

test('it runs the function if the promise returns a function', t => {
  return format(Promise.resolve(() => ({ a: 1 }))).then(v =>
    t.is('{"a":1}', v)
  );
});

// Iterators
test('it formats each of the synchronous items of the iterator', t =>
  t.is('{"a":1}value25', format([{ a: 1 }, 'value', 2, () => 5])));
test('it allows configuration of the joining String', t =>
  t.is(
    '{"a":1},value,2,5',
    format([{ a: 1 }, 'value', 2, () => 5], { iteratorJoinString: ',' })
  ));
test('it returns a promise if any of the iterator element are promises', t =>
  format([{ a: 1 }, 'value', 2, Promise.resolve(5)]).then(v =>
    t.is('{"a":1}value25', v)
  ));
test('it returns a promise if any of the iterator element is an async function', t =>
  Promise.all([
    format([{ a: 1 }, 'value', 2, async () => 5]).then(v =>
      t.is('{"a":1}value25', v)
    ),
    format([{ a: 1 }, 'value', 2, () => Promise.resolve(5)]).then(v =>
      t.is('{"a":1}value25', v)
    )
  ]));

test('it can be extended', t => {
  function formatWithUppercasedStrings(expression, options) {
    if (typeof expression === 'string') {
      return expression.toUpperCase();
    }
    return format(expression, {
      formatResults: formatWithUppercasedStrings,
      ...options
    });
  }

  t.is('YUPPI', formatWithUppercasedStrings('yuppi'));
  t.is(
    'YUPPI',
    formatWithUppercasedStrings(() => 'yuppi')
  );
  t.is('YUPPI', formatWithUppercasedStrings(['yuppi']));
  return formatWithUppercasedStrings(Promise.resolve('yuppi')).then(v =>
    t.is('YUPPI', v)
  );
});
