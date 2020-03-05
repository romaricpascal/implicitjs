function forLoop() {
  for (;;) {
    const a = 5;
    a;
  }
}

function whileLoop() {
  while (test) {
    const a = 5;
    a;
  }
}

function doWhileLoop() {
  do {
    const a = 5;
    a;
  } while (test);
}

function forInLoop() {
  for (keys in object) {
    const a = 5;
    a;
  }
}

function forOfLoop() {
  for (value of iterator) {
    const a = 5;
    a;
  }
}
