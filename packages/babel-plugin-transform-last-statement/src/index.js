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
      case 'ExpressionStatement': {
        statements[i] = types.ReturnStatement(statements[i].expression);
        return statements;
      }
    }
  }
  return statements;
}
