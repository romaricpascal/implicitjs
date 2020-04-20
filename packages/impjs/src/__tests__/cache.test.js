const test = require('ava');
const { compile, compileFile } = require('..');

// In regular quotes as the template value needs to be the value
const templateString = '`Value: ${value}`';
const templatePath = require.resolve('./cache.input');

test('compile can be cached', t => {
  const first = compile(templateString, { cacheKey: 'key' });
  const second = compile(templateString, { cacheKey: 'key' });
  t.is(first, second);
});

test('compile is not cached by default', t => {
  const first = compile(templateString);
  const second = compile(templateString);
  t.not(first, second);
});

test('compileFile is cached by default', t => {
  const first = compileFile(templatePath);
  const second = compileFile(templatePath);
  t.is(first, second);
});

test('compileFile caching can be disabled', t => {
  const first = compileFile(templatePath, { cacheKey: false });
  const second = compileFile(templatePath, { cacheKey: false });
  t.not(first, second);
});
