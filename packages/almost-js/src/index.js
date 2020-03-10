const { transformSync } = require('@babel/core');
const transformUndeclaredVariables = require('babel-plugin-transform-undeclared-variables');
const transformLastStatement = require('babel-plugin-transform-last-statement');

module.exports = function(templateString) {
  const { code } = transformSync(templateString, {
    plugins: [
      [transformUndeclaredVariables],
      [transformLastStatement, { topLevel: true }]
    ]
  });
  const templateFunction = new Function('data', code);

  return async function(data) {
    return templateFunction(data);
  };
};
