function a() {
  return 5;
}

() => {
  return 5;
};

() => 5;

(function() {
  return 5;
})();

(() => {
  return 5;
})();

(() => {})(function() {
  return 5;
});

function b() {
  function c() {
    return 5;
  }
}

return () => {
  function a() {
    return 5;
  }
};

function d() {
  return () => {
    return 5;
  };
}
