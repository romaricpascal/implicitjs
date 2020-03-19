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
          path.node.openingElement.attributes.forEach(attribute => {
            if (attribute.value.type === 'JSXExpressionContainer') {
              builder.quasi(`${attribute.name.name}="`);
              builder.expression(attribute.value.expression);
              builder.quasi('"');
            } else {
              builder.quasi(
                `${attribute.name.name}="${attribute.value.value}"`
              );
            }
          });

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
