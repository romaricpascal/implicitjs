// prettier-ignore
import undeclared from "package";

function test() {
  doSomethingWith(undeclared);
  return undeclared;
}

function doSomethingWith() {}
