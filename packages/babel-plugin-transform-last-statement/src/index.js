module.exports = function({ types }) {
  return {
    visitor: {
      Program(path) {
        path.node.body = maybeInjectReturn(path.node.body, { types });
      }
    }
  };
};

function maybeInjectReturn(statements, { types }) {
  for (var i = statements.length; i--; i) {
    switch (statements[i].type) {
      // Goal is to return expressions so lets look for them
      case 'ExpressionStatement': {
        statements[i] = types.ReturnStatement(statements[i].expression);
        return statements;
      }
      // If we find a return
      case 'ReturnStatement': {
        return statements;
      }
      case 'ThrowStatement': {
        return statements;
      }
    }
  }
  return statements;
}
