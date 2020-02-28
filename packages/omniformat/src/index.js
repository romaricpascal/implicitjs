module.exports = function format(expression) {
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
  if (typeof expression == 'object') {
    return JSON.stringify(expression);
  }
  if (Object.is(expression, -0)) {
    return '-0';
  }
  if (typeof expression == 'function') {
    return format(expression());
  }

  return String(expression);
};
