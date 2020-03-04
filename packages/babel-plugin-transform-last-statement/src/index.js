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
  // By default we want replacements to happen
  // unless a SwitchCase turns that off
  if (typeof options.replace === 'undefined') {
    options.replace = true;
  }
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
    // For switches we want to only replace after we found a BreakStatement
    // We carry on the value for replacement
    let replace = options.afterBreak ? options.replace : true;
    for (var i = node.length; i--; i) {
      // And inject whichever value we found for our replacement
      const updatedNode = maybeInjectReturn(node, {
        key: i,
        ...options,
        replace
      });
      // Once we found a 'BreakStatement' we start replacing
      if (node[i].type === 'BreakStatement') {
        replace = true;
      }
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
      if (options.replace) {
        return options.types.ReturnStatement(node.expression);
      }
      return;
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
    // `switch` statements need their own processing
    // - each case/default statement can either host a block or an array of statements
    // - we should only inject returns after we found a "break" in `case` statements.
    //   The following `case`/`default` gets run
    //   if there is no `break` and adding a return would prevent that.
    //   While it's recommended not to fallthrough (https://eslint.org/docs/rules/no-fallthrough)
    //   there are some valid use cases, so we need to handle it
    case 'SwitchStatement': {
      node.cases.forEach(switchCase => {
        maybeInjectReturn(switchCase, {
          ...options,
          key: 'consequent',
          afterBreak: !!switchCase.test, // Only replace if a break exists for `case`, not `default`
          replace: false
        });
      });
      return false;
    }
  }
}

// Little utility for outputing the name of a node
// cleanly (that is without dumping a whole object
// in the console)
// eslint-disable-next-line no-unused-vars
function nodeDebugName(node) {
  if (typeof node === 'undefined') return 'undefined';
  if (Array.isArray(node)) {
    return 'Array';
  }
  return (node && node.type) || node;
}
