{
  var _result = [];
  for (;;) {
    if (test) {
      a = 5;
      continue;
    } else {
      _result.push(a);
    }
  }
  return _result;
}
