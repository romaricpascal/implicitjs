{
  var _result = [];
  for (;;) {
    if (test) {
      // prettier-ignore
      _result.push(a = 5);
      break;
    } else {
      _result.push(a);
    }
  }
  return _result;
}
