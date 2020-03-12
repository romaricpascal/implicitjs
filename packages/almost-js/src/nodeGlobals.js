// https://github.com/flexdinesh/browser-or-node/blob/dd3970eabf095f22d710de485961e21e2c1c92fa/src/index.js#L12
// MIT License
const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

// https://nodejs.org/dist/latest-v12.x/docs/api/globals.html
const NODE_GLOBALS_NAMES = [
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

function cloneNodeGlobals() {
  const result = {};
  NODE_GLOBALS_NAMES.forEach(globalName => {
    result[globalName] = this[globalName];
  });
  return result;
}

module.exports = isNode ? cloneNodeGlobals() : undefined;
