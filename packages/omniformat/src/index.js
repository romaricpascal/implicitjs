/**
 * Formats the given expression returning:
 *
 * - empty string from `null`,`NaN` and `undefined`
 * - a Promise to the formatted value from a Promise
 * - the formated result of a Function
 * - a "JSON.stringify"ed string of an object
 * - the elements of an expression with an iterator,
 *   each formatted and joined together by the `iteratorJoinString` option
 * - the `String()` representation of all other expressions
 *
 * @param {any} expression - The expression to format
 * @param {Object} options
 * @param {String} [options.iteratorJoinString=''] - The string that will be used for joining the formatted elements of an iterator
 * @param {Function} [options.formatResults=itself] - The function that will be used to recursively format the results of functions, promises and elements of an iterators. Allows you to provide a custom implementation when extending the original function's feature
 */
module.exports = function format(
  expression,
  { iteratorJoinString = '', formatResults } = {}
) {
  formatResults = formatResults || format;
  // typeof null is 'object' so it needs to be first-ish
  if (expression === null) {
    return '';
  }
  if (Number.isNaN(expression)) {
    return '';
  }
  if (typeof expression == 'undefined') {
    return '';
  }
  if (expression instanceof Promise) {
    return expression.then(formatResults);
  }

  if (Object.is(expression, -0)) {
    return '-0';
  }
  if (typeof expression == 'function') {
    return formatResults(expression());
  }
  if (expression[Symbol.iterator] && typeof expression !== 'string') {
    const formated = [];
    for (var element of expression) {
      formated.push(formatResults(element));
    }
    if (formated.some(v => v instanceof Promise)) {
      return Promise.all(formated).then(res => res.join(iteratorJoinString));
    }
    return formated.join(iteratorJoinString);
  }
  // Object first before last as it catches
  // so many other types, Promise, Array
  if (typeof expression == 'object') {
    return JSON.stringify(expression);
  }
  return String(expression);
};
