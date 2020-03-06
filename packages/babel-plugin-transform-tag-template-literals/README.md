babel-plugin-transform-tag-template-literals
---

A Babel transform that tags each non-tagged template literal with a chosen identifier.

```js
`a template ${literal}`

// Will become

html`a template ${literal}`

```

Usage
---

Usage

Install the plugin with your favourite package manager. For example, with NPM:

```sh
npm install --save-dev babel-plugin-transform-last-statement
```

Then in your Babel configuration, add it to the list of plugins:

```js
{
  plugins:['transform-tag-template-literals']
}
```

Options
---

- `tagName`: The identifier to use for the tag function. If empty, the plugin won't try to tag anything

Possible future work
---

- [ ] Allow to set which tagName to use through a comment, like `// tag-template-literals: tagName`. Some thoughts will be needed for the scoping. Apply to next block (`function`,`if`...) or maybe use a `// end-tag-template-literals`?