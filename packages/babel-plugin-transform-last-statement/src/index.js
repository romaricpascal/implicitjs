module.exports = function({ types }) {
  return {
    visitor: {
      Program(path) {
        maybeInjectReturn(path.node, { types });
      }
    }
  };
};

function maybeInjectReturn(node, { key, ...options } = {}) {
  // If provided a key, we're looking to inject return for
  // a specific key of the node
  if (typeof key !== 'undefined') {
    const updatedNode = maybeInjectReturn(node[key], options);
    if (updatedNode) {
      node[key] = updatedNode;
    }
    if (typeof updatedNode !== 'undefined') {
      return false;
    }
    return;
  }

  // If provided an Array, we're looking to iterate over the nodes,
  // last to first.
  // IMPORTANT: This needs to be after the check for the key
  // to avoid infinite loop when calling
  if (Array.isArray(node)) {
    for (var i = node.length; i--; i) {
      const updatedNode = maybeInjectReturn(node, { key: i, ...options });
      // Stop iteracting as soon as
      if (typeof updatedNode !== 'undefined') {
        return false;
      }
    }
    return node;
  }

  switch (node.type) {
    // Goal is to return expressions so lets look for them
    case 'ExpressionStatement': {
      return options.types.ReturnStatement(node.expression);
    }
    // If we find a return or throw, we skip
    // Same with debugger; statements,
    // which shouldn't be short-circuited by an early return
    case 'ReturnStatement':
    case 'ThrowStatement':
    case 'DebuggerStatement': {
      return false;
    }
    case 'IfStatement': {
      maybeInjectReturn(node, { key: 'consequent', ...options });
      if (node.alternate) {
        maybeInjectReturn(node, { key: 'alternate', ...options });
      }
      // Either we'll have injected returns as needed
      // or there will have been some returns already
      // so we can stop there
      return false;
    }
    // `with` blocks only have one body
    // and so do labeledstatements
    case 'LabeledStatement':
    case 'WithStatement': {
      maybeInjectReturn(node, { key: 'body', ...options });
      // TODO: Handle labelled function declarations
      return false;
    }
    // We only want to mess with the `try` block
    // `catch` might yield unexpected values being returned
    // so best leave to an explicit return
    // `finally` is even worse: it would return before the `try`
    // so a definite no go:
    // https://eslint.org/docs/rules/no-unsafe-finally
    case 'TryStatement': {
      maybeInjectReturn(node, { key: 'block', ...options });
      return false;
    }
    // Blocks and Programs will have multiple statements
    // in their body, we'll need to traverse it last to first
    case 'BlockStatement':
    case 'Program': {
      const update = maybeInjectReturn(node, { key: 'body', ...options });
      if (typeof update !== 'undefined') {
        return false;
      }
      return;
    }
  }
}
