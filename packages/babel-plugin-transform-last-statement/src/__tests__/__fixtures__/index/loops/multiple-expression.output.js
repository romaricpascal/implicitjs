function forLoop() {
  {
    var _result = [];
    for (;;) {
      const a = 5;
      _result.push(a);
    }
    return _result;
  }
}

function whileLoop() {
  {
    var _result2 = [];
    while (test) {
      const a = 5;
      _result2.push(a);
    }
    return _result2;
  }
}

function doWhileLoop() {
  {
    var _result3 = [];
    do {
      const a = 5;
      _result3.push(a);
    } while (test);
    return _result3;
  }
}

function forInLoop() {
  {
    var _result4 = [];
    for (keys in object) {
      const a = 5;
      _result4.push(a);
    }
    return _result4;
  }
}

function forOfLoop() {
  {
    var _result5 = [];
    for (value of iterator) {
      const a = 5;
      _result5.push(a);
    }
    return _result5;
  }
}
