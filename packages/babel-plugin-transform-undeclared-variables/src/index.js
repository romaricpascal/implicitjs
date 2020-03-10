// Code goes here
module.exports = function(
  babel,
  { defaultTransform = getter(), variables = {} } = {}
) {
  return {
    pre() {
      // Babel will re-traverse replaced Identifiers,
      // so we'll bundle the replacements all in one go
      // after the traversal
      this.transforms = [];
    },
    visitor: {
      Program(path) {
        this.programPath = path;
      },
      Identifier(path) {
        if (
          // Babel handily tracks whether the name of an identifier
          // has a matchind declaration (variable, function or class)
          !path.scope.hasBinding(path.node.name) &&
          // The part after the dot when accessing the property of an object
          // (for ex, `property` in `obj.property` is also an identifier,
          // so we need to ignore those
          !isMemberExpressionProperty(path) &&
          !isLeftHandSideOfAssignment(path)
        ) {
          if (variables[path.node.name]) {
            this.transforms.push(
              variables[path.node.name].call(this, path, babel)
            );
          } else {
            this.transforms.push(defaultTransform.call(this, path, babel));
          }
        }
      }
    },
    post() {
      this.transforms.forEach(transform => {
        if (transform) {
          transform(this.programPath);
        }
      });
    }
  };
};

function isLeftHandSideOfAssignment(path) {
  const parentAssignment = path.findParent(
    p => p.type === 'AssignmentExpression'
  );
  return parentAssignment && parentAssignment.node.left == path.node;
}

function isMemberExpressionProperty(path) {
  return (
    path.parent.type === 'MemberExpression' &&
    path.parent.property === path.node
  );
}

function getter(objectName = 'data') {
  return function(path, { types }) {
    return function() {
      path.replaceWith(
        types.MemberExpression(
          memberExpressionObject(objectName, { types }),
          path.node
        )
      );
    };
  };
}

// Generate the propert AST for objectNames that have dots
// in them (ie. Nested MemberExpressions)
/* 
  From developit/htm
  https://github.com/developit/htm/blob/86a723685da4f339397ced396a36c08a73ea6b68/packages/babel-plugin-transform-jsx-to-htm/index.mjs#L37
  License: Apache License 2.0 https://github.com/developit/htm/blob/master/LICENSE
*/
function memberExpressionObject(keypath, { types }) {
  const path = keypath.split('.');
  let out;
  for (let i = 0; i < path.length; i++) {
    const ident = types.identifier(path[i]);
    out = i === 0 ? ident : types.memberExpression(out, ident);
  }
  return out;
}

module.exports.getter = getter;

function addImport(packageName, { namedExport } = {}) {
  return function(path, babel) {
    // For a given traversal, the same variable might appear many times
    // but only one import should be injected for it
    // So we need to keep track of those, using in a hash
    if (!this.importedVariables) {
      this.importedVariables = {};
    }
    const identifierName = path.node.name;
    if (!this.importedVariables[identifierName]) {
      this.importedVariables[identifierName] = true;
      return function(programPath) {
        programPath.node.body.unshift(
          importAST(path.node.name, { packageName, namedExport }, babel)
        );
      };
    }
  };
}

function importAST(identifierName, { packageName, namedExport }, { types }) {
  if (namedExport) {
    const exportedName =
      typeof namedExport == 'string' ? namedExport : identifierName;
    return types.ImportDeclaration(
      [
        types.ImportSpecifier(
          types.Identifier(identifierName),
          types.Identifier(exportedName)
        )
      ],
      types.StringLiteral(packageName)
    );
  } else {
    return types.ImportDeclaration(
      [types.ImportDefaultSpecifier(types.Identifier(identifierName))],
      types.StringLiteral(packageName)
    );
  }
}

module.exports.addImport = addImport;
