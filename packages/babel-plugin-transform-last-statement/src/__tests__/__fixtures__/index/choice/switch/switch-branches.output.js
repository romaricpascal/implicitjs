switch (test) {
  case 'if - break-after': {
    if (value) {
      return 2;
    } else {
      return 3;
    }
    break;
  }
  case 'if - break inside': {
    if (value) {
      return 2;
      break;
    } else {
      return 3;
      break;
    }
  }
  case 'if - no break in consequent': {
    if (value) {
      2;
    }
    return 3;
    break;
  }
}
