const jsx = require('@babel/plugin-syntax-jsx').default;

module.exports = function({ types }) {
  return {
    // Enable the JSX syntax
    inherits: jsx,
    visitor: {
      JSXElement(path) {
        const quasis = [];
        const expressions = [];

        // First process the name
        let tag = `<${path.node.openingElement.name.name}`;

        // Then the attributes
        path.node.openingElement.attributes.forEach(attribute => {
          if (attribute.value.type === 'JSXExpressionContainer') {
            tag += `${attribute.name.name}="`;
            quasis.push(types.TemplateElement({ raw: tag }));
            expressions.push(attribute.value.expression);
            tag = '"';
          } else {
            tag += `${attribute.name.name}="${attribute.value.value}"`;
          }
        });

        // Then close the tag
        // Note: HTML technically don't need a closing "/" self closing elements
        // (https://html.spec.whatwg.org/multipage/syntax.html#start-tags)
        // however, because we can also use JSX for SVG, MathML or other flavours
        // of XML, we'll close it by default and leave it to a minifier to remove
        // the unnecessary ones
        if (!path.node.closingElement) {
          tag += '/>';
        } else {
          tag += '>';
        }

        if (path.node.children.length) {
          path.node.children.forEach(child => {
            tag += child.value;
          });
        }

        // Last adding the closing tag
        if (path.node.closingElement) {
          tag += `</${path.node.closingElement.name.name}>`;
        }

        quasis.push(types.TemplateElement({ raw: tag }));

        const templateLiteral = types.TemplateLiteral(quasis, expressions);
        path.replaceWith(templateLiteral);
      }
    }
  };
};
