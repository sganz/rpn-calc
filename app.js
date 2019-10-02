'use strict';

const path = require('path');
const i18n = require('./src/i18n/i18n.js');
const logger = require('./src/logger/logger.js');
//const Calc = require('./src/rpn-calc/calculator.js');
const express = require('express');
const favicon = require('serve-favicon');
const nunjucks = require('nunjucks');

// Use it however you wish
console.log(i18n.__('Calculator'));
i18n.setLocale('es');
console.log(i18n.__('Calculator'));
i18n.setLocale('de');
console.log(i18n.__('Calculator'));

// Quick Logger check
logger.info('Calc v1.0');
logger.debug('Some Debugging');
logger.warn('A crap load of warnings');
logger.error('Some Really bad error went down');

const app = express();
const port = 3000;

app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// Apply nunjucks and add custom filter and function (for example).
var env = nunjucks.configure(['public/views/'], {
  // set folders with templates
  autoescape: true,
  express: app,
  cache: false,
  watch: true, // need chokidar package to work
});

env.addFilter('myFilter', function(obj, arg1, arg2) {
  console.log('myFilter', obj, arg1, arg2);
  // Do something with obj
  return obj;
});

/*env.addGlobal('myFunc', function(obj, arg1) {
  console.log('myFunc', obj, arg1);
  // Do something with obj
  return obj;
});*/

env.addGlobal('myFunc', (obj, arg1) => {
  console.log('myFunc!', obj.toUpperCase(), arg1);
  // Do something with obj
  return obj.toUpperCase();
});

app.get('/', function(req, res) {
  res.render('index.njx', { title: 'Main page' });
});

app.get('/func', function(req, res) {
  res.locals.smthVar = 'This is Sparta!';
  res.render('func.njx', { title: 'Foo page' });
});

// Handle 404
app.use(function(req, res) {
  res.status(400);
  res.render('404.njx', { title: '404: File Not Found' });
});

// Handle 500
app.use(function(error, req, res, next) {
  res.status(500);
  res.render('500.njx', { title: '500: Internal Server Error', error: error });
});

//app.get('/', (req, res) => res.render('index.html'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

/*
logger.info('Calc v1.0');
logger.debug('Some Debugging');
logger.warn('A crap load of warnings');
logger.error('Some Really bad error went down');

// Use it however you wish
console.log(i18n.__('Calculator'));
i18n.setLocale('es');
console.log(i18n.__('Calculator'));
i18n.setLocale('de');
console.log(i18n.__('Calculator'));

var calc = new Calc.Calculator();

calc.enter(5);
console.log('lastX ' + calc.lastX());

calc.enter('2');
console.log('lastX ' + calc.lastX());

calc.minus();
console.log('lastX ' + calc.lastX());
console.log(calc.value());

calc.enter(3);
console.log('lastX ' + calc.lastX());

calc.factorial();

console.log('lastX ' + calc.lastX());
console.log(calc.value());

calc.clearAll();
calc.plus();

console.log(Calc.MAXIMUM_STACK);
console.log(Calc.MINIMUM_STACK);
*/
