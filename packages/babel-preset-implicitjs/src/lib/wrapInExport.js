const template = require('@babel/template').default;

const TEMPLATES = {
  withFormatter: template(`
import FORMATTER_IDENTIFIER from "FORMATTER_MODULE";

export default function template(data) {
  return FORMATTER_IDENTIFIER(TEMPLATE_BODY_IDENTIFIER(data));
}

function TEMPLATE_BODY_IDENTIFIER(data) {
  TEMPLATE_BODY
}
`),
  withoutFormatter: template(`
export default function template(data) {
  TEMPLATE_BODY
}
`)
};

module.exports = function wrapInExport({ types }, { formatterModule } = {}) {
  return {
    visitor: {
      Program: {
        exit(path) {
          if (formatterModule) {
            const ast = TEMPLATES.withFormatter({
              FORMATTER_IDENTIFIER: path.scope.generateUidIdentifier(
                'formatter'
              ),
              FORMATTER_MODULE: types.StringLiteral(formatterModule),
              TEMPLATE_BODY: path.node.body,
              TEMPLATE_BODY_IDENTIFIER: path.scope.generateUidIdentifier(
                'templateBody'
              )
            });
            path.node.body = ast;
          } else {
            const ast = TEMPLATES.withoutFormatter({
              TEMPLATE_BODY: path.node.body
            });
            path.node.body = [ast];
          }
          hoistImportsTo(path);
        }
      }
    }
  };
};

function hoistImportsTo(path) {
  const imports = [];
  path.traverse({
    ImportDeclaration(path) {
      console.log('Imports found');
      imports.push(path);
    }
  });

  imports.forEach(importPath => {
    // First move the node to its new place
    path.unshiftContainer('body', importPath.node);
    // Then remove the path so it doesn't appear twice
    importPath.remove();
  });
}
