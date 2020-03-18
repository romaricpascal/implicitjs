const wrapInExport = require('./lib/wrapInExport');
const { addImport } = require('babel-plugin-transform-undeclared-variables');

module.exports = function(babel, { tagName = 'tag', formatterModule } = {}) {
  return {
    plugins: [
      ['transform-tag-template-literals', { tagName }],
      ['transform-last-statement', { topLevel: true }],
      [
        'transform-undeclared-variables',
        {
          variables: {
            tag: addImport('./tag')
          }
        }
      ],
      [wrapInExport, { formatterModule }]
    ]
  };
};
