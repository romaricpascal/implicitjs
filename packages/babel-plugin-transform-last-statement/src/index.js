module.exports = function({ types }, { topLevel }) {
  const plugin = {
    visitor: {
      // Named functions (sync or async)
      FunctionDeclaration(path) {
        maybeInjectReturn(path.node.body, { types, scope: path.scope });
      },
      // Anonymous functions
      FunctionExpression(path) {
        maybeInjectReturn(path.node.body, { types, scope: path.scope });
      },
      // Arrow (`() => {}`) functions
      ArrowFunctionExpression(path) {
        maybeInjectReturn(path.node.body, { types, scope: path.scope });
      },
      ClassMethod(path) {
        // Ignore constructors as there's no point injecting anything there
        // given their return value isn't actually returned to caller
        if (path.node.key.name !== 'constructor') {
          maybeInjectReturn(path.node.body, { types, scope: path.scope });
        }
      }
    }
  };
  if (topLevel) {
    plugin.visitor.Program = function Program(path) {
      maybeInjectReturn(path.node.body, { types, scope: path.scope });
    };
  }
  return plugin;
};

function maybeInjectReturn(node, { key, ...options } = {}) {
  // Uncomment to log the traversal
  // console.log(nodeDebugName(node));

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
      const { types, replace, resultsIdentifier } = options;
      if (replace) {
        let statement;
        if (resultsIdentifier) {
          // If we have a results identifier, create a `.push` call
          statement = types.ExpressionStatement(
            types.CallExpression(
              types.MemberExpression(
                resultsIdentifier,
                types.Identifier('push')
              ),
              [node.expression]
            )
          );
        } else {
          statement = types.ReturnStatement(node.expression);
        }
        statement.leadingComments = node.leadingComments;
        statement.trailingComments = node.trailingComments;
        node.leadingComments = null;
        node.trailingComments = null;
        return statement;
      }
      return;
    }
    // If we find a return or throw, we skip
    // Same with debugger; statements,
    // which shouldn't be short-circuited by an early return
    case 'ReturnStatement':
    case 'ThrowStatement':
    case 'DebuggerStatement':
    case 'ContinueStatement': {
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
    // Blocks will have multiple statements
    // in their body, we'll need to traverse it last to first
    case 'BlockStatement': {
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
    // Loops need their own processing too. We need to aggregate their data
    // in an array and then return that array
    case 'ForStatement':
    case 'DoWhileStatement':
    case 'WhileStatement':
    case 'ForInStatement':
    case 'ForOfStatement': {
      return wrapLoopNode(node, options);
    }
    // Class declarations need to be turned into ClassExpressions
    // That can be returned as a regular expression
    case 'ClassDeclaration': {
      node.type = 'ClassExpression';
      // We still need to handle it like a regular expression
      // at that point, so let's go for another round
      return maybeInjectReturn(
        options.types.ExpressionStatement(node),
        options
      );
    }
  }
}

function wrapLoopNode(node, options) {
  const { types, scope } = options;
  // Create a new identifier, unless a parent loop has already
  // created one
  const identifier =
    options.resultsIdentifier || scope.generateUidIdentifier('result');

  // Then we can process the content of the loop
  maybeInjectReturn(node, {
    ...options,
    key: 'body',
    resultsIdentifier: identifier
  });

  // And finally wrap it only if we created the identifiers beforehand
  if (options.resultsIdentifier) {
    // We'll have done some returning in the for so we can stop further iteration
    // above
    return false;
  } else {
    // We don't have access to `replaceWithMultiple` as we need
    // our own traversal so we replace the for with our own block
    // of commands
    return types.BlockStatement([
      // Using `var` allows terser (maybe other minifiers too) to eliminate the block we just created
      // if it is unnecessary. With `const` or `let`, the variable would be
      // scoped to the block, so terser wouldn't be able to know if it's safe
      // to eliminate the block or not
      types.VariableDeclaration('var', [
        types.VariableDeclarator(identifier, types.ArrayExpression())
      ]),
      node,
      types.ReturnStatement(identifier)
    ]);
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
