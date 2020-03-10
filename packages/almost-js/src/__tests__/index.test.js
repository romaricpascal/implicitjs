const test = require('ava');
const testname = require('testname');
const { readFileSync, existsSync } = require('fs');
const { resolve, dirname, relative } = require('path');
const { sync: glob } = require('fast-glob');
const compile = require('..');

const macro = fileBasedTest(__filename, (t, { input, data, options = {} }) => {
  const template = compile(input, options);
  return template(data);
});

// Use some globbing to generate tests based on the files in __fixtures__
const fixtures = glob(resolve(fixturesPath(__filename), '**', '*.input.js'));

// A regexp for filtering tests by fixtureName
const filterByFixtureName = null;

fixtures
  .map(path => relative(fixturesPath(__filename), path))
  .map(dropAllExtensions)
  .forEach(fixtureName => {
    if (filterByFixtureName) {
      if (filterByFixtureName.test(fixtureName)) {
        return test.only(macro, { fixtureName });
      }
    }
    return test(macro, { fixtureName });
  });

function fileBasedTest(testFileName, fn) {
  const macro = withFixtures(
    testFileName,
    withInput(withModules(['options', 'data'], withOutputComparison(fn)))
  );
  macro.title = (definedTitle, options) => definedTitle || options.fixtureName;
  return macro;
}

function withFixtures(testFileName, fn) {
  return function(t, options) {
    return fn(t, {
      fixturesPath: fixturesPath(testFileName),
      ...options
    });
  };
}

function withModules(suffixes = ['options'], fn) {
  return function(t, options) {
    const modules = {};
    suffixes.forEach(suffix => {
      const modulePath = resolve(
        options.fixturesPath,
        `${options.fixtureName}.${suffix}.js`
      );
      if (existsSync(modulePath)) {
        modules[suffix] = require(modulePath);
      }
    });

    return fn(t, { ...modules, ...options });
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
        const expected = readFileSync(
          resolve(options.fixturesPath, `${options.fixtureName}.output`),
          'utf-8'
        );

        compared = true;
        return t.is(
          // Ignore whitespace
          output.replace(/\s/g, ''),
          expected
            .replace(/\/\/\s*prettier-ignore/, '') // Ignore prettier comments
            .replace(/\s/g, '') // Ignore whitespace
        );
      }
    };
    const result = fn(t, { compare, ...options });
    if (result.then) {
      return result.then(compare);
    } else {
      return compare(result);
    }
  };
}

function fixturesPath(testFileName) {
  return resolve(dirname(testFileName), '__fixtures__', testname(testFileName));
}

function dropAllExtensions(filename) {
  const indexOfFirstDot = filename.indexOf('.');
  if (indexOfFirstDot === -1) return filename;
  return filename.substring(0, indexOfFirstDot);
}
