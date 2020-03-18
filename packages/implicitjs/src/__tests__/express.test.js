const test = require('ava');
const express = require('express');
const { __express } = require('..');
const request = require('supertest');

const templatePath = require.resolve('./express.input');
const templateWithErrorPath = require.resolve('./express-with-error.input');

test('it renders the provided file', t => {
  return __express(templatePath, { value: 5 }, function(error, rendered) {
    t.is('Value: 5', rendered);
  });
});

test('it surfaces errors', t => {
  return __express(templateWithErrorPath, { value: 5 }, function(error) {
    t.is('Template rendering broke', error.message);
  });
});

test('it actually works in Express', t => {
  const app = createApp();
  const agent = request.agent(app);
  return agent.get('/').then(({ text }) => {
    console.log(text);
    t.is('Value: 10', text);
  });
});

function createApp() {
  const app = express();
  app.engine('ajs', __express);
  app.set('view engine', 'ajs');
  app.set('views', __dirname);
  app.use(function(req, res) {
    res.render('express-view', { value: 10 });
  });
  return app;
}
