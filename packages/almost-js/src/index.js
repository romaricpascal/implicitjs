const { transformSync } = require('@babel/core');
const transformUndeclaredVariables = require('babel-plugin-transform-undeclared-variables');
const transformLastStatement = require('babel-plugin-transform-last-statement');
const tagTemplateLiterals = require('babel-plugin-transform-tag-template-literals');
const createTemplateTag = require('process-template-literals');
const omniformat = require('omniformat');

// Create our tag to process each expression with our formatter
const templateTag = createTemplateTag(({ strings, expressions }) => {
  const processedExpressions = expressions.map(omniformat);
  // Handle that some of the formatted values might have been promises
  if (processedExpressions.some(v => v instanceof Promise)) {
    return Promise.all(processedExpressions).then(
      fullfilledProcessedExpressions => ({
        strings,
        expressions: fullfilledProcessedExpressions
      })
    );
  }
  // If none are Promises, we can keep things synchronous
  return { strings, expressions: processedExpressions };
});

module.exports = function(
  templateString,
  { tagName = 'html', tag = templateTag } = {}
) {
  const { code } = transformSync(templateString, {
    plugins: [
      [transformUndeclaredVariables],
      [transformLastStatement, { topLevel: true }],
      [tagTemplateLiterals, { tagName }]
    ]
  });
  const templateFunction = new Function('data', code);
  return async function(data = {}) {
    // The template might return an array, or anything, actually
    // so we need to format it again
    return omniformat(templateFunction({ [tagName]: tag, ...data }));
  };
};
