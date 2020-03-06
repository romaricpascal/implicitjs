module.exports = function({ types }, { tagName = 'html' } = {}) {
  return {
    visitor: {
      TemplateLiteral(path) {
        // Acts both as a way to ignore already tagged literals
        // and to circumvent re-processing the node after it
        // is replaced
        if (path.parent.type !== 'TaggedTemplateExpression') {
          path.replaceWith(
            types.taggedTemplateExpression(types.identifier(tagName), path.node)
          );
        }
      }
    }
  };
};
