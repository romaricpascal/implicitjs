`##Example of if
${() => {
  if (firstCondition) {
    `This shows if firstCondition is true`;
  }
}}
${() => {
  if (secondCondition) {
    `This won't show`;
  } else {
    `And this if secondCondition is false`;
  }
}}
`;
