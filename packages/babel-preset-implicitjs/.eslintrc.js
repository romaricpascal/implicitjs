module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  "overrides": [
    {
      "files": [
        "**/__tests__/**/*"
      ],
      rules: {
        // Tests will require dev only packages
        "node/no-unpublished-require": 0,
        // Allow tests to use a local the `node_modules`
        "node/no-extraneous-require": 0
      }
    },{
      "files": [
        "**/__tests__/**/*.input.js",
        "**/__tests__/**/*.output.js",
        "**/__tests__/**/*.component.js",
        "**/__tests__/**/*.ajs"
      ],
      parserOptions: {
        sourceType: "module"
      },
      rules: {
        // We don't really care about whether vars are used
        // or existing in our examples
        "no-unused-vars": 0,
        "no-undef": 0,
        // We don't really care if imported packages exist
        // in the test fixtures
        "node/no-missing-require": 0,
        // We'll be injecting `import` statements
        "node/no-unsupported-features/es-syntax": 0
      }
    }
  ]
}
