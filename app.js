'use strict';

const i18n = require('./i18n');
const logger = require('./logger');
const Calc = require('./calculator.js');

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
