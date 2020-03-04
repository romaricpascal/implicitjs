module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:prettier/recommended"
  ],
  "overrides": [
    {
      "files": [
        "**/__tests__/**/*"
      ],
      rules: {
        // Tests will require dev only packages
        "node/no-unpublished-require": 0,
        // Allow extraneous require to use a local the `node_modules`
        "node/no-extraneous-require": 0
      }
    }, {
      "files": [
        "**/__tests__/**/*.input.js",
        "**/__tests__/**/*.output.js"
      ],
      rules: {
        // We don't really care about whether vars are used
        // or existing in our examples
        "no-unused-vars": 0,
        "no-undef": 0,
        "no-with": 0,
        "no-debugger": 0,
        "no-unused-labels": 0
      }
    }
  ]
}