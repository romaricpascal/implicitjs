const wrapInExport = require('./lib/wrapInExport');
const { addImport } = require('babel-plugin-transform-undeclared-variables');

module.exports = function(
  babel,
  { tagName = 'tag', tagModule, formatterModule, type = 'module' } = {}
) {
  // Whatever the options we want to at least tag template literals
  // And return the last statements
  const plugins = [
    ['transform-tag-template-literals', { tagName }],
    ['transform-last-statement', { topLevel: true }]
  ];

  // Then we also need to transform undeclared variables
  // but what we do vary if we're a 'module' or not
  if (type == 'module') {
    // In a module, the `tag` needs to be imported
    plugins.push([
      'transform-undeclared-variables',
      {
        variables: {
          [tagName]: addImport(tagModule)
        }
      }
    ]);
  } else {
    // Not in a module, it'll be expected to be passed
    // with the other `data` sent to the template
    plugins.push['transform-undeclared-variables'];
  }

  // Last we need to check whether to wrap the module
  // in export or not
  if (type == 'module') {
    plugins.push([wrapInExport, { formatterModule }]);
  }

  return { plugins };
};
