module.exports = function({ types }) {
  return {
    visitor: {
      Program(path) {
        maybeInjectReturn(path.node, { types });
      }
    }
  };
};

function maybeInjectReturn(node, options) {
  switch (node.type) {
    // Goal is to return expressions so lets look for them
    case 'ExpressionStatement': {
      return options.types.ReturnStatement(node.expression);
    }
    // If we find a return or throw, we skip
    case 'ReturnStatement':
    case 'ThrowStatement': {
      return false;
    }
    case 'IfStatement': {
      const updatedConsequent = maybeInjectReturn(node.consequent, options);
      if (updatedConsequent) {
        node.consequent = updatedConsequent;
      }
      if (node.alternate) {
        const updatedAlternate = maybeInjectReturn(node.alternate, options);
        if (updatedAlternate) {
          node.alternate = updatedAlternate;
        }
      }
      // Either we'll have injected returns as needed
      // or there will have been some returns already
      // so we can stop there
      return false;
    }
    // `with` blocks only have one body
    case 'WithStatement': {
      const updatedNode = maybeInjectReturn(node.body, options);
      if (updatedNode) {
        node.body = updatedNode;
      }
      return false;
    }
    // Blocks and Programs will have multiple statements
    // in their body, we'll need to traverse it last to first
    case 'BlockStatement':
    case 'Program': {
      for (var i = node.body.length; i--; i) {
        // Get a possibly updated node
        const updatedNode = maybeInjectReturn(node.body[i], options);
        if (updatedNode) {
          // Replace the node if we updated
          node.body[i] = updatedNode;
        }
        // And stop processing if we returned anything:
        // - a node meant we injected the return
        // - a false meant we already had a return or throw
        if (typeof updatedNode !== 'undefined') {
          return false;
        }
      }
    }
  }
}
