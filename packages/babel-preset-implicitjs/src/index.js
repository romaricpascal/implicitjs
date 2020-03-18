const wrapInExport = require('./lib/wrapInExport');
const tagTemplateLiterals = require('babel-plugin-transform-tag-template-literals');
const transformLastStatement = require('babel-plugin-transform-last-statement');
const transformUndeclaredVariables = require('babel-plugin-transform-undeclared-variables');
const { addImport } = require('babel-plugin-transform-undeclared-variables');

module.exports = function(
  babel,
  { tagName = 'tag', tagModule, formatterModule, type = 'module' } = {}
) {
  // Whatever the options we want to at least tag template literals
  // And return the last statements
  const plugins = [
    [tagTemplateLiterals, { tagName }],
    [transformLastStatement, { topLevel: true }]
  ];

  // Then we also need to transform undeclared variables
  // but what we do vary if we're a 'module' or not
  const undeclaredVariablesOptions = {};
  if (type === 'module' && tagModule) {
    undeclaredVariablesOptions.variables = {
      [tagName]: addImport(tagModule)
    };
  }
  plugins.push([transformUndeclaredVariables, undeclaredVariablesOptions]);
  // Last we need to check whether to wrap the module
  // in export or not
  if (type == 'module') {
    plugins.push([wrapInExport, { formatterModule }]);
  }

  return { plugins };
};
