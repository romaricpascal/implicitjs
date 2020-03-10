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
        // Allow tests to use a local the `node_modules`
        "node/no-extraneous-require": 0
      }
    }
  ]
}