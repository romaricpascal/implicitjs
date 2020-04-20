// prettier-ignore
import tag from "./tag";

export default function template(data) {
  return tag`Value: ${data.value}`;
}
