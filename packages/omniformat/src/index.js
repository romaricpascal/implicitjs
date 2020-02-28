module.exports = function format(expression, { iteratorJoinString = '' } = {}) {
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
    return expression.then(format);
  }

  if (Object.is(expression, -0)) {
    return '-0';
  }
  if (typeof expression == 'function') {
    return format(expression());
  }
  if (expression[Symbol.iterator] && typeof expression !== 'string') {
    const formated = [];
    for (var element of expression) {
      formated.push(format(element));
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
