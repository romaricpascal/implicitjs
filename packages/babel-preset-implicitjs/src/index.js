const wrapInExport = require('./lib/wrapInExport');
const tagTemplateLiterals = require('babel-plugin-transform-tag-template-literals');
const transformLastStatement = require('babel-plugin-transform-last-statement');
const transformUndeclaredVariables = require('babel-plugin-transform-undeclared-variables');
const jsxToTemplateLiterals = require('babel-plugin-transform-jsx-to-template-literals');
const { addImport } = require('babel-plugin-transform-undeclared-variables');

module.exports = function(
  babel,
  { tagName = 'tag', tagModule, formatterModule, type = 'module' } = {}
) {
  // Whatever the options we want to at least tag template literals
  // And return the last statements
  const plugins = [
    [inSequence(jsxToTemplateLiterals)],
    [inSequence(tagTemplateLiterals), { tagName }],
    [inSequence(transformLastStatement), { topLevel: true }]
  ];

  // Then we also need to transform undeclared variables
  // but what we do vary if we're a 'module' or not
  const undeclaredVariablesOptions = {};
  if (type === 'module' && tagModule) {
    undeclaredVariablesOptions.variables = {
      [tagName]: addImport(tagModule)
    };
  }
  plugins.push([
    inSequence(transformUndeclaredVariables),
    undeclaredVariablesOptions
  ]);
  // Last we need to check whether to wrap the module
  // in export or not
  if (type == 'module') {
    plugins.push([inSequence(wrapInExport), { formatterModule }]);
  }

  return { plugins };
};

function inSequence(plugin) {
  return function(babel, options) {
    const { inherits, pre, post, visitor } = plugin(babel, options);
    return {
      inherits,
      pre,
      visitor: {
        Program: {
          exit(path) {
            // First let's bind the visitor to the current `this`,
            // as `path.traverse` will create a new one that
            // won't have access to what's been run in the `pre`
            // and `post`
            Object.keys(visitor).forEach(key => {
              if (typeof visitor[key] === 'function') {
                visitor[key] = visitor[key].bind(this);
              } else {
                if (visitor[key].enter) {
                  visitor[key].enter = visitor[key].enter.bind(this);
                }
                if (visitor[key].exit) {
                  visitor[key].exit = visitor[key].exit.bind(this);
                }
              }
            });

            // `path.traverse` will modify the visitor and wrap
            // each function in an array. So we separate the Program
            // one from the inner visitor to keep it untouched
            const { Program, ...innerVisitor } = visitor;

            // Next, because we're in a Program node, we need
            // to visit it explicitely if the visitor is meant
            // to handle this kind of node.
            if (Program) {
              if (typeof Program === 'function') {
                Program(...arguments);
              } else {
                if (Program.enter) {
                  Program.enter(...arguments);
                }
              }
            }

            path.traverse(innerVisitor);

            if (Program && Program.exit) {
              Program.exit(...arguments);
            }
          }
        }
      },
      post
    };
  };
}
