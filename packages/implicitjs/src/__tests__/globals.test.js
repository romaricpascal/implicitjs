const test = require('ava');
const { render } = require('..');

// https://nodejs.org/dist/latest-v12.x/docs/api/globals.html
const NODE_GLOBALS = [
  'Buffer',
  // '__dirname', ignore as they should only be set when compiling files
  // '__filename', ignore as they should only be set when compiling files
  'clearImmediate',
  'clearInterval',
  'clearTimeout',
  'console',
  // 'exports', ignore as the templates are not modules
  'global',
  // 'module', ignore as templates are not modules
  'process',
  'queueMicrotask',
  // 'require', ignore as we only inject it when compiling from files
  'setImmediate',
  'setInterval',
  'setTimeout',
  'TextDecoder',
  'TextEncoder',
  'URL',
  'URLSearchParams',
  'WebAssembly'
];

function macro(t, globalName) {
  return render(`typeof ${globalName}`).then(rendered =>
    // Use `eval` to get the type of the global in the current scope
    t.is(eval(`typeof ${globalName}`), rendered)
  );
}

macro.title = (providedTitle, globalName) => globalName;

NODE_GLOBALS.forEach(globalName => {
  test(macro, globalName);
});
