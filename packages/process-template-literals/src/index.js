module.exports = function createProcessorTag(processor, { lazy } = {}) {
  if (lazy) {
    return function(strings, ...expressions) {
      return function(data) {
        return doProcess(strings, expressions, processor, data);
      };
    };
  } else {
    return function(strings, ...expressions) {
      return doProcess(strings, expressions, processor);
    };
  }
};

function doProcess(strings, expressions, processor, data) {
  const processed = processor({ strings, expressions, data });

  if (processed instanceof Promise) {
    return processed.then(stitch);
  }

  // Stitch everything back together
  return stitch(processed);
}

function stitch({ strings, expressions }) {
  let result = strings[0];
  for (var i = 1; i < strings.length; i++) {
    result += expressions[i - 1];
    result += strings[i];
  }
  return result;
}
