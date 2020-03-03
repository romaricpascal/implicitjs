const test = require('ava');
const testname = require('testname');
const { transformSync } = require('@babel/core');
const { readFileSync } = require('fs');
const { resolve, dirname } = require('path');
const transform = require('..');

const macro = fileBasedTest(__filename, (t, { input }) => {
  return transformSync(input, {
    plugins: [transform],
    parserOpts: {
      allowReturnOutsideFunction: true
    }
  }).code;
});

test(macro, { fixtureName: 'single-expression' });
test(macro, { fixtureName: 'multiple-expressions' });
test(macro, { fixtureName: 'existing-return' });
test(macro, { fixtureName: 'existing-throw' });

function fileBasedTest(testFileName, fn) {
  const macro = withFixtures(testFileName, withInput(withOutputComparison(fn)));
  macro.title = (definedTitle, options) => definedTitle || options.fixtureName;
  return macro;
}

function withFixtures(testFileName, fn) {
  return function(t, options) {
    return fn(t, {
      fixturesPath: resolve(
        dirname(testFileName),
        '__fixtures__',
        testname(testFileName)
      ),
      ...options
    });
  };
}

function withInput(fn) {
  return function(t, options) {
    const input = readFileSync(
      resolve(options.fixturesPath, `${options.fixtureName}.input.js`),
      'utf-8'
    );
    return fn(t, { input, ...options });
  };
}

function withOutputComparison(fn) {
  return function(t, options) {
    let compared;
    const compare = output => {
      if (!compared) {
        compared = true;
        console.log('Comparing', '\n', output, '\n');
        return t.is(
          output.replace(/\s/g, ''),
          readFileSync(
            resolve(options.fixturesPath, `${options.fixtureName}.output.js`),
            'utf-8'
          ).replace(/\s/g, '')
        );
      }
    };
    const result = fn(t, { compare, ...options });
    compare(result);
  };
}
