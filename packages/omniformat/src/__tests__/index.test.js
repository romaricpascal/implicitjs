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
