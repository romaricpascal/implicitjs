{
  var _result = [];
  for (;;) {
    if (test) {
      // prettier-ignore
      a = 5;
      break;
    } else {
      _result.push(a);
    }
  }
  return _result;
}
