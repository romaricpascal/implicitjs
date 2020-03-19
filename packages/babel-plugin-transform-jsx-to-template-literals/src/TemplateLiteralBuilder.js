module.exports = class TemplateLiteralBuilder {
  constructor(types) {
    this.quasis = [];
    this.expressions = [];
    this.currentQuasi = '';
    this.types = types;
  }

  quasi(text) {
    this.currentQuasi += text;
  }

  expression(expression) {
    this.closeCurrentQuasi();
    this.expressions.push(expression);
  }

  closeCurrentQuasi() {
    this.quasis.push(this.types.TemplateElement({ raw: this.currentQuasi }));
    this.currentQuasi = '';
  }

  node() {
    if (this.currentQuasi) {
      this.closeCurrentQuasi();
    }
    return this.types.TemplateLiteral(this.quasis, this.expressions);
  }
};
