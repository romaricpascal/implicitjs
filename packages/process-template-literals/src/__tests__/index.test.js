const test = require('ava');
const createProcessorTag = require('..');

// Let's create a few helpers to check that the parts of the template
// are actually processed.
// First a function to uppercase both strings and expressions
function uppercaseBoth({ strings, expressions }) {
  return {
    strings: strings.map(s => s.toUpperCase()),
    expressions: expressions.map(e => e.toUpperCase())
  };
}

// Then a few tags

test('it returns a string with the processed value', t => {
  const uppercase = createProcessorTag(uppercaseBoth);
  t.is('CONTENT', uppercase`co${'n'}t${'e'}nt`);
});
test('it awaits Promises from the processor', t => {
  const asyncUppercase = createProcessorTag(options =>
    Promise.resolve(uppercaseBoth(options))
  );
  return asyncUppercase`co${'n'}t${'e'}nt`.then(v => t.is('CONTENT', v));
});
test('it returns a function if the `lazy` option is set', t => {
  const lazyUppercase = createProcessorTag(uppercaseBoth, { lazy: true });
  t.is('CONTENT', lazyUppercase`content`());
});
test('it provides the data from the tagged call', t => {
  const lazyTag = createProcessorTag(
    ({ data }) => {
      t.is(3, data);
      // We only case about the passing of data so we return
      // empty parts here
      return { strings: [], expressions: [] };
    },
    { lazy: true }
  );
  lazyTag``(3);
});
