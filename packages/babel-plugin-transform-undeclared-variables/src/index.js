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
      Identifier(path) {
        if (
          // Babel handily tracks whether the name of an identifier
          // has a matchind declaration (variable, function or class)
          !path.scope.hasBinding(path.node.name) &&
          // The part after the dot when accessing the property of an object
          // (for ex, `property` in `obj.property` is also an identifier,
          // so we need to ignore those
          !isMemberExpressionProperty(path)
        ) {
          if (variables[path.node.name]) {
            this.transforms.push(variables[path.node.name](path, babel));
          } else {
            this.transforms.push(defaultTransform(path, babel));
          }
        }
      }
    },
    post() {
      this.transforms.forEach(transform => transform());
    }
  };
};

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
