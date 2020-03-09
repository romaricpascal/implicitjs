const { addImport } = require('../../../..');

module.exports = {
  defaultTransform: addImport('package', { namedExport: 'exported' })
};
