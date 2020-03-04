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
        // with are generally not recommended, but it's a case we need to handle
        "no-with": 0,
        "no-debugger": 0,
        // This would remove the labels when saving so we disable the rules
        "no-unused-labels": 0,
        // Not recommended to declare functions in ifs, cases...
        // but we need to check if we play nice with it
        "no-inner-declarations": 0,
        // Switch only adds return and leaves the removal
        // of unreachable `break` to other tools
        "no-unreachable": 0,
        // And we need to handle fallthrough gracefully
        "no-fallthrough": 0
      }
    }
  ]
}