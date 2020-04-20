// prettier-ignore
import tag from "./tag";
// prettier-ignore
import helper from './helper';
// prettier-ignore
import _formatter from "./formatter";

export default function template(data) {
  return _formatter(_templateBody(data));
}

function _templateBody(data) {
  return tag`Value: ${helper(data.value)}`;
}
