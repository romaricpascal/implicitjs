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

  concat(templateLiteral) {
    const { quasis, expressions } = templateLiteral;
    this.currentQuasi += quasis[0].value.raw;
    expressions.forEach((expression, index) => {
      this.expression(expression);
      this.quasi(quasis[index + 1].value.raw);
    });
  }
};
