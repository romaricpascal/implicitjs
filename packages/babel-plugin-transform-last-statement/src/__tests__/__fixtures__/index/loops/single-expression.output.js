function forLoop() {
  {
    var _result = [];
    for (;;) {
      _result.push(5);
    }
    return _result;
  }
}

function whileLoop() {
  {
    var _result2 = [];
    while (test) {
      _result2.push(5);
    }
    return _result2;
  }
}

function doWhileLoop() {
  {
    var _result3 = [];
    do {
      _result3.push(5);
    } while (test);
    return _result3;
  }
}

function forInLoop() {
  {
    var _result4 = [];
    for (keys in object) {
      _result4.push(5);
    }
    return _result4;
  }
}

function forOfLoop() {
  {
    var _result5 = [];
    for (value of iterator) {
      _result5.push(5);
    }
    return _result5;
  }
}
