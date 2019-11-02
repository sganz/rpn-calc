// Zipkin Test App, acts as a server for the other testers as well
// as doing a few other things that likely don't need to be here.
// Logging and other i18n and related could be removed if needed.
//
// This was split off since I'm favoring Jaeger, but wanted to keep
// a working version of Zipkin prior to moving over to JAEGER.
//
// NOTE : Project deps are maintained to support both Jaeger and Zipkin, but
//        only because.

'use strict';

const path = require('path');
const i18n = require('./src/i18n/i18n.js');
const logger = require('./src/logger/logger.js');
const methodOverride = require('method-override');
const express = require('express');
const router = express.Router();
const favicon = require('serve-favicon');
const nunjucks = require('nunjucks');
const morgan = require('morgan');

// Get needed env or defaults

const env = process.env.NODE_ENV || 'development';
const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT || 'http://localhost:9411';
const SERVICE_NAME = process.env.SERVICE_NAME || 'sandy-service';
const ZIPKIN_API_SERVICE_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:4000';

// Import axios and axios instrumentation

const axios = require('axios');
const zipkinInstrumentationAxios = require('zipkin-instrumentation-axios');

// Import zipkin stuff

const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

// Get ourselves a zipkin tracer

const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
      jsonEncoder: jsonEncoder.JSON_V2,
    }),
  }),
  localServiceName: SERVICE_NAME,
});

// Add axios instrumentation
const zipkinAxios = zipkinInstrumentationAxios(axios, { tracer, serviceName: 'axios-client' });

// We can define a delay function with this one line
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use it however you wish
console.log(i18n.__('Calculator'));
i18n.setLocale('es');
console.log(i18n.__('Calculator'));
i18n.setLocale('de');
console.log(i18n.__('Calculator'));

// Quick Logger check
logger.info('Zipkin Test v1.0');
logger.debug('Some Debugging');
logger.warn('A crap load of warnings');
logger.error('Some Really bad error went down');

const app = express();
const port = 3000;

// recommended if not default
app.disable('x-powered-by');

// Add the Zipkin middleware
app.use(zipkinMiddleware({ tracer }));

// set up favicon path. Icon is in the images directory
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));

// serve static content from public
app.use(express.static(path.join(__dirname, 'public')));

// for JSON parsing
app.use(express.json());

// ??? Overriding Methods, not sure if needed ???
app.use(methodOverride());

// Apply nunjucks and add custom filter and function (for example).
var njEnv = nunjucks.configure(['public/views/'], {
  // set folders with templates
  autoescape: true,
  express: app,
  cache: false,
  watch: true, // need chokidar package to work
});

njEnv.addFilter('myFilter', function(obj, arg1, arg2) {
  logger.info('Nunjucks - myFilter()', obj, arg1, arg2);
  // Do something with obj, check with Nunjucks docs for info
  return obj;
});

// Nunjucks function to upper case
njEnv.addGlobal('myFunc', (obj, arg1) => {
  logger.info('Nunjucks - myFunc()', obj.toUpperCase(), arg1);
  return obj.toUpperCase();
});

app.use(router);

// Let's make our express `Router` first.
app.get('/error', function(req, res, next) {
  // here we cause an error in the pipeline so we see express-winston in action.
  return next(new Error('This is an error and it should be logged to the console'));
});

// Set up Morgan logging format based on environment
app.use(morgan(env === 'development' ? 'tiny' : 'short', { stream: logger.stream }));

// Start of Routes
app.get('/', function(req, res) {
  res.render('index.njx', { title: 'Main page' });
});

// if here will render the
app.get('/func', function(req, res) {
  res.locals.smthVar = 'This is Sparta!';
  res.render('func.njx', { title: 'Foo page' });
});

// Gets the time and ships it back as a json blob
// We lament for 100ms to show up better in the Zipkin console
app.get('/time', async (req, res) => {
  await tracer.local('awaiting 100ms delay', () => delay(100));
  res.json({ currentDate: new Date().getTime() });
});

// will call the zipkin service which returns the time then send back pong
app.get('/ping', async (req, res, next) => {
  try {
    await tracer.local('/ping', () => delay(10));
    // go back to the same service for it's time
    const result = await zipkinAxios.get(`${ZIPKIN_API_SERVICE_ENDPOINT}/time`);
    res.json({ status: 'pong', time: result.data.time });
  } catch (error) {
    next(error);
  }
});

// Handle 404 with custom template
app.use(function(req, res) {
  res.status(400);
  res.render('404.njx', { title: '404: File Not Found' });
});

// Handle 500 with custom template
app.use(function(error, req, res, next) {
  res.status(500);
  res.render('500.njx', { title: '500: Internal Server Error', error: error });
});

// Zipkin collector should be started with something like -
// $ docker run -d -p 9411:9411 openzipkin/zipkin
//
// NOTE : If testing with Jaeger collection service and it is emulating
//        zipkin pn 9411 you may not be able to start one or both containers!

app.listen(port, () => console.log(`Zipkin test app listening on port ${port}!`));
