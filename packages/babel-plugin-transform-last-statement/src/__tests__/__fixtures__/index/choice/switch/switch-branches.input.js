switch (test) {
  case 'if - break-after': {
    if (value) {
      2;
    } else {
      3;
    }
    break;
  }
  case 'if - break inside': {
    if (value) {
      2;
      break;
    } else {
      3;
      break;
    }
  }
  case 'if - no break in consequent': {
    if (value) {
      2;
    }
    3;
    break;
  }
}
