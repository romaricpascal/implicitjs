function a() {
  5;
}

() => {
  5;
};

() => 5;

(function() {
  5;
})();

(() => {
  5;
})();

(() => {})(function() {
  5;
});

function b() {
  function c() {
    5;
  }
}

() => {
  function a() {
    5;
  }
};

function d() {
  () => {
    5;
  };
}
