function test() {
  doSomethingWith(undeclared);
  return undeclared;
}

function doSomethingWith() {}
