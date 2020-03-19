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
          const builder = new TemplateLiteralBuilder(types);

          // First process the name
          builder.quasi('<');
          builder.quasi(path.node.openingElement.name.name);

          // Then the attributes

          // First we're going to group them in sets
          // separated by any
          const attributeSets = [];
          let currentAttributeSet = [];
          let hasSpread;
          path.node.openingElement.attributes.forEach(attribute => {
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
              hasSpread = true;
            } else {
              currentAttributeSet.push(attribute);
            }
          });
          if (currentAttributeSet.length) {
            attributeSets.push(currentAttributeSet);
          }

          if (attributeSets.length) {
            if (hasSpread) {
              // There's only a spread we can just set it
              if (
                attributeSets.length === 1 &&
                !Array.isArray(attributeSets[0])
              ) {
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
          if (!path.node.closingElement) {
            builder.quasi('/>');
          } else {
            builder.quasi('>');
          }

          if (path.node.children.length) {
            path.node.children.forEach(child => {
              if (
                child.type === 'JSXExpressionContainer' &&
                child.expression.type !== 'JSXEmptyExpression'
              ) {
                builder.expression(child.expression);
              } else if (child.type === 'TemplateLiteral') {
                builder.concat(child);
              } else if (child.type === 'JSXText') {
                builder.quasi(child.value);
              }
            });
          }

          // Last adding the closing tag
          if (path.node.closingElement) {
            builder.quasi(`</${path.node.closingElement.name.name}>`);
          }

          path.replaceWith(builder.node());
        }
      }
    }
  };
};

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
 * @param {*} attributeSets
 * @param {*} options
 */
function toObjects(attributeSets, { types }) {
  return attributeSets.map(attributeSet => {
    // Return any spread as is, they don't need to be transformed
    if (!Array.isArray(attributeSet)) return attributeSet.argument;

    const expression = types.ObjectExpression([]);
    // Add each attribute as key to the expression
    attributeSet.forEach(attribute => {
      const key = types.StringLiteral(attribute.name.name);
      // Set empty attributes to NullLiteral
      // TODO: Provide option for it?
      console.log('Key', key, 'Value', attribute.value);
      let value = attribute.value ? attribute.value : types.StringLiteral('');
      const property = types.ObjectProperty(key, value);
      expression.properties.push(property);
    });
    return expression;
  });
}
