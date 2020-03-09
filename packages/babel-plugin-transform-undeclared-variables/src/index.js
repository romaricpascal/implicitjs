// Code goes here
module.exports = function({ types }) {
  return {
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
          path.replaceWith(
            types.MemberExpression(types.identifier('data'), path.node)
          );
        }
      }
    }
  };
};

function isMemberExpressionProperty(path) {
  return (
    path.parent.type === 'MemberExpression' &&
    path.parent.property === path.node
  );
}
