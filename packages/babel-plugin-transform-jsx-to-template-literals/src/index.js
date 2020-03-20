const jsx = require('@babel/plugin-syntax-jsx').default;
const TemplateLiteralBuilder = require('./TemplateLiteralBuilder');

module.exports = function({ types }) {
  return {
    // Enable the JSX syntax
    inherits: jsx,
    visitor: {
      JSXElement: {
        // Process the node on exit
        // so that nested JSXElements
        // have already been transformed
        exit(path) {
          const tagName = path.node.openingElement.name.name;
          // Check if the tagName is referenced in the scope
          // If it is, treat it like a function
          if (path.scope.hasBinding(tagName)) {
            path.replaceWith(toFunctionCall(path.node, { types }));
          } else {
            path.replaceWith(toTemplateLiteral(path.node, { types }));
          }
        }
      }
    }
  };
};

/**
 * Turns the given `jsxElement` into a template literal
 * @param {JSXElement} jsxElement
 * @param {Object} options
 * @param {Object} options.types
 */
function toTemplateLiteral(jsxElement, { types }) {
  const builder = new TemplateLiteralBuilder(types);
  // First process the name
  builder.quasi('<');
  builder.quasi(jsxElement.openingElement.name.name);

  // Then the attributes

  // First we're going to group them in sets
  // separated by any spread
  const attributeSets = collectAttributeSets(jsxElement.openingElement);

  if (attributeSets.length) {
    if (attributeSets.hasSpread) {
      // There's only a spread we can just set it
      if (attributeSets.length === 1 && !Array.isArray(attributeSets[0])) {
        builder.quasi(' ');
        builder.expression(attributeSets[0].argument);
      } else {
        // First we need to turn each of the attribute set into an object
        const objects = toObjects(attributeSets, { types });

        builder.quasi(' ');
        builder.expression(mergeWithObjectSpread(objects, { types }));
      }
    } else {
      // If there's no spread, we'll just loop through the attributes
      attributeSets[0].forEach(attribute => {
        // Start with the attribute name (with a little space to separate
        // it from the previous attribute or the tagname)
        builder.quasi(' ');
        builder.quasi(`${attribute.name.name}`);

        // Then if necessary the value
        if (attribute.value) {
          builder.quasi('="');

          if (attribute.value.type === 'JSXExpressionContainer') {
            builder.expression(attribute.value.expression);
          } else {
            builder.quasi(attribute.value.value);
          }

          builder.quasi('"');
        }
      });
    }
  }

  // Then close the tag
  // Note: HTML technically don't need a closing "/" self closing elements
  // (https://html.spec.whatwg.org/multipage/syntax.html#start-tags)
  // however, because we can also use JSX for SVG, MathML or other flavours
  // of XML, we'll close it by default and leave it to a minifier to remove
  // the unnecessary ones
  if (!jsxElement.closingElement) {
    builder.quasi('/>');
  } else {
    builder.quasi('>');
  }

  if (jsxElement.children.length) {
    jsxElement.children.forEach(child => {
      if (
        child.type === 'JSXExpressionContainer' &&
        child.expression.type !== 'JSXEmptyExpression'
      ) {
        builder.expression(child.expression);
      } else if (child.type === 'TemplateLiteral') {
        builder.concat(child);
      } else if (child.type === 'JSXText') {
        builder.quasi(child.value);
      } else if (types.isExpression(child)) {
        builder.expression(child);
      }
    });
  }

  // Last adding the closing tag
  if (jsxElement.closingElement) {
    builder.quasi(`</${jsxElement.closingElement.name.name}>`);
  }
  return builder.node();
}

/**
 * @param {JSXElement} jsxElement
 * @param {Object} options
 * @param {Object} options.types
 */
function toFunctionCall(jsxElement, { types }) {
  const attributeSets = collectAttributeSets(jsxElement.openingElement);
  const attributeObjects = toObjects(attributeSets, {
    types,
    nullValueNode: () => types.BooleanLiteral(true)
  });

  let callArguments;
  if (attributeObjects.length > 1) {
    callArguments = [mergeWithObjectSpread(attributeObjects)];
  } else if (attributeObjects.length) {
    callArguments = [attributeObjects[0]];
  } else {
    callArguments = [];
  }

  return types.CallExpression(
    types.Identifier(jsxElement.openingElement.name.name),
    callArguments
  );
}

/**
 * Collect sets of attributes for the given JSX opening element.
 * Sets are separated by spread operators, for ex:
 *
 * - `<element attr="value">` 1 set of 1 attribute (attr => value)
 * - `<element attr="value" {...props}>` 2 sets: 1 with the `attr` attribute, the other for the spread
 * - `<element attr="value" other-attr="value" {...props} data-attr="value"> 3 sets: 1 with the two first attributes, one for the spread and the last for the data attribute
 * @param {JSXOpeningElement} jsxOpeningElement
 */
function collectAttributeSets(jsxOpeningElement) {
  const attributeSets = [];
  let currentAttributeSet = [];
  jsxOpeningElement.attributes.forEach(attribute => {
    if (attribute.type === 'JSXSpreadAttribute') {
      // Found a spread, so we add the current set to the list
      if (currentAttributeSet.length) {
        attributeSets.push(currentAttributeSet);
      }
      // add the spread itself
      attributeSets.push(attribute);
      // and start a new set of attributes
      currentAttributeSet = [];
      // as well as mark that there is a spread
      attributeSets.hasSpread = true;
    } else {
      currentAttributeSet.push(attribute);
    }
  });
  if (currentAttributeSet.length) {
    attributeSets.push(currentAttributeSet);
  }

  return attributeSets;
}

/**
 * Creates an ObjectExpression merging the given `expressions`
 * with the spread operator (for ex. `{...a,...b,...{c:1,d:2}}`)
 *
 * @param {Array} expressions - The ObjectExpressions
 * @return {ObjectExpression}
 */
function mergeWithObjectSpread(expressions, { types }) {
  const merged = types.ObjectExpression([]);
  expressions.forEach(expression => {
    merged.properties.push(types.SpreadElement(expression));
  });
  return merged;
}

/**
 * Transform a list of attribute sets into a list of objects or identifiers
 * ready to be merged
 * @param {Array} attributeSets
 * @param {Object} options
 * @param {Object} options.types
 * @param {Function} options.nullValueNode - A function to create the node representing the value when the attribute had no value in the JSX
 */
function toObjects(
  attributeSets,
  { types, nullValueNode = () => types.StringLiteral('') }
) {
  return attributeSets.map(attributeSet => {
    // Return any spread as is, they don't need to be transformed
    if (!Array.isArray(attributeSet)) return attributeSet.argument;

    const expression = types.ObjectExpression([]);
    // Add each attribute as key to the expression
    attributeSet.forEach(attribute => {
      const key = types.StringLiteral(attribute.name.name);
      // Set empty attributes to NullLiteral
      // TODO: Provide option for it?
      let value = attribute.value ? attribute.value : nullValueNode();
      if (value.type === 'JSXExpressionContainer') {
        value = value.expression;
      }
      const property = types.ObjectProperty(key, value);
      expression.properties.push(property);
    });
    return expression;
  });
}
