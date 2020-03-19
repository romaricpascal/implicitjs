const test = require('ava');
const testname = require('testname');
const { transformSync } = require('@babel/core');
const { readFileSync, existsSync } = require('fs');
const { resolve, dirname, relative } = require('path');
const { sync: glob } = require('fast-glob');
const plugin = require('..');

// Use some globbing to generate tests based on the files in __fixtures__
const fixtures = glob(resolve(fixturesPath(__filename), '**', '*.input.js'));

const macro = fileBasedTest(__filename, (t, { input, options = {} }) => {
  const { code } = transformSync(input, {
    plugins: [[plugin, options]]
  });

  return code;
});

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

function fileBasedTest(testFileName, fn, { testName = '' } = {}) {
  const macro = withFixtures(
    testFileName,
    withInputPath(
      withInput(withModules(['options', 'data'], withOutputComparison(fn)))
    )
  );
  macro.title = (definedTitle, options) =>
    definedTitle || `${testName} - ${options.fixtureName}`;
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

function withInputPath(fn) {
  return function(t, options) {
    const inputPath = resolve(
      options.fixturesPath,
      `${options.fixtureName}.input.js`
    );
    return fn(t, { inputPath, ...options });
  };
}

function withInput(fn) {
  return function(t, options) {
    const input = readFileSync(options.inputPath);
    return fn(t, { input, ...options });
  };
}

function withOutputComparison(fn) {
  return function(t, options) {
    let compared;
    const compare = output => {
      const outputPath = resolve(
        options.fixturesPath,
        `${options.fixtureName}.output.js`
      );
      if (!compared) {
        const expected = readFileSync(outputPath, 'utf-8');

        compared = true;
        return t.is(
          // Ignore whitespace
          output.replace(/\s/g, ''),
          expected
            .replace(/\/\/\s*prettier-ignore/g, '') // Ignore prettier comments
            .replace(/\s/g, '') // Ignore whitespace
        );
      }
    };
    const result = fn(t, { compare, ...options });
    if (result.then) {
      return result.then(compare).catch(e => console.log(e, result));
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
