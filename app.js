// This is the main test app...
//
// Lots of stuff crammed in here, logging, i18n, tracing, etc. Also, check out
// zipkin-app.js for a simple zipkin tracing example. I decided that I would use
// JAEGER instead for a couple of reasons, one being is that Jaeger is compatible
// in collecting Zipkin traces and the logo for Jaeger is better then the Zipkin
// logo.
//
// 11/1/2019 -
// Currently Their is no rpn calculator stuff working. The Jaeger tracing is as well
// as the zipkin, but use the Jaeger stuff. This revision has lots of changes so
// it will be committed before I get too far derailed with things like logging and
// simple services that support it.
//
// NOTE : Project deps are maintained to support both Jaeger and Zipkin, but
//        only because. Remove as needed.

'use strict';

const path = require('path');
const appI18n = require('./src/i18n/i18n.js');
const i18n = require('i18n-2');
const i18nConfig = require('./src/i18n/i18n.js').i18nConfig;
const httpStatus = require('http-status');
const logger = require('./src/logger/logger.js');
const methodOverride = require('method-override');
const express = require('express');
//var session = require('cookie-session');
var cookieParser = require('cookie-parser');
const router = express.Router();
const favicon = require('serve-favicon');
const nunjucks = require('nunjucks');
const morgan = require('morgan');

// Import axios and axios instrumentation

const axios = require('axios');

const expressOpentracing = require('express-opentracing').default;
const { initTracer } = require('jaeger-client');
const createAxiosTracing = require('axios-opentracing').default;

// Get needed env or defaults

// If we don't find any of this, it must be development!
const env = process.env.NODE_ENV || 'development';
const COOKIE_NAME_LOCALE = process.env.COOKIE_NAME_LOCALE || 'locale';

// This is the the test service running in src/services/jaeger-another-service.js
const JAEGER_API_SERVICE_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:4000';

// Pull in Jaeger stuff from environment, default if needed (Set yours if different)
const JAEGER_COLLECTOR_ENDPOINT =
  process.env.JAEGER_COLLECTOR_ENDPOINT || 'http://localhost:14268/api/traces';
const JAEGER_SERVICE_NAME = process.env.JAEGER_SERVICE_NAME || 'app.js';
const JAEGER_AGENT_HOST = process.env.JAEGER_AGENT_HOST || 'localhost';
const JAEGER_AGENT_PORT = process.env.JAEGER_AGENT_PORT || '6831';

// Tracing Config, most should come from env settings

const config = {
  serviceName: JAEGER_SERVICE_NAME,
  sampler: {
    type: 'const',
    param: 1,
  },
  reporter: {
    collectorEndpoint: JAEGER_COLLECTOR_ENDPOINT,
    agentHost: JAEGER_AGENT_HOST,
    agentPort: JAEGER_AGENT_PORT,
    logSpans: true,
  },
};

// Setup tracer
const tracer = initTracer(config);

// Create tracing interceptor
const applyTracingInterceptors = createAxiosTracing(tracer);

// application i18n check (make sure translations files are correct!)
appI18n.setLocale('es');
console.log(appI18n.__('Calculator'));
appI18n.setLocale('en');
console.log(appI18n.__('Calculator'));
appI18n.setLocale('de');
console.log(appI18n.__('Calculator'));
appI18n.setLocale(appI18n.defaultLocale);
console.log(appI18n.__('Calculator'));

// Quick Logger check
logger.info('Rpn-calc Test v1.0');
logger.debug('Some Debugging');
logger.warn('A crap load of warnings');
logger.error('Some Really bad error went down');
logger.info('Back to Work');

const app = express();

// i18N for Express
// Attach the i18n property to the express request object
// And attach helper methods for use in templates
// This bugs me a bit since we have a global object config.
// Might be a better way to export the config to both.

i18n.expressBind(app, i18nConfig);

// Should come up earl on the use list
// From method-override - Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
app.use(methodOverride());

// Setup express tracer middleware
app.use(expressOpentracing({ tracer }));

// NOTE ROUTER USE
// set a cookie with some max age and http only so scripts can't get them
router.use(function(req, res, next) {
  // check if existing in the dict
  let theCookie = req.cookies.locale;

  // if not make a new one
  if (!theCookie) {
    // set the cookie for 1 year (milliseconds), default language (from i18n config)
    res.cookie(COOKIE_NAME_LOCALE, req.i18n.defaultLocale, { maxAge: 31536000, httpOnly: true });
    req.cookies.locale = req.i18n.defaultLocale;
    logger.info('locale Cookie Created');
  } else {
    logger.info('Existing Local Cookie - Language : ' + req.cookies.locale);
  }

  next();
});

// Our Server Port
const port = 3000;

// recommended if not default
app.disable('x-powered-by');

// set up favicon path. Icon is in the images directory
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));

// serve static content from public
app.use(express.static(path.join(__dirname, 'public')));

// for JSON parsing
app.use(express.json());

// Setup express tracer middleware
app.use(expressOpentracing({ tracer }));

// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());

// This is how you'd set a locale from req.cookies.
// Don't forget to set the cookie either on the client or in your Express app.
app.use((req, res, next) => {
  req.i18n.setLocaleFromCookie();
  //logger.info('Dump' + JSON.stringify());
  next();
});

// call all axios stuff via the req.API
// not sure if the is the best way to do the interceptors
// but found an example in the npm package that shows it.
app.use((req, res, next) => {
  const API = axios.create({
    // baseURL: 'http://localhost:3000',   // removed as it easier not to use it, just specify the FULL URL
  });

  applyTracingInterceptors(API, { span: req.span });

  req.API = API;

  next();
});

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

// Let's make our express `Router` first.
app.use(router);

// Set up Morgan logging format based on environment
app.use(morgan(env === 'development' ? 'tiny' : 'short', { stream: logger.stream }));
// This should cause an exception, not sure if it's currently working
// as it's tossing an exception that is not handled ????
app.get('/error', function(req, res, next) {
  // here we cause an error in the pipeline so we see express-winston in action.
  return next(new Error('This is an error and it should be logged to the console'));
});

// Start of Routes
app.get('/', (req, res) => {
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
  res.json({ currentDate: new Date().getTime() });
});

// will call the zipkin service which returns the time then send back pong
app.get('/ping', async (req, res, next) => {
  try {
    // go back to the same service for it's time
    const result = await req.API.get(`${JAEGER_API_SERVICE_ENDPOINT}/time`);
    res.json({ status: 'pong', time: result.data.time });
  } catch (error) {
    next(error);
  }
});

// Helper to map error codes to human codes
// returns a status string and a class of error.
// These are things that should be direclty used by
// i18n
const mapErrorStatus = status => {
  return {
    statusStr: httpStatus[status],
    statusClass: httpStatus.classes[httpStatus[`${status}_CLASS`]],
  };
};

// anything here will be caught by this 404 handler. Currently
// this is using the same template as the 500's. Add a distinct
// one if the need arises.
app.use(function(req, res, next) {
  const status = 404;
  const expandedStatus = mapErrorStatus(status);

  res.status(status);
  res.render('errors.njx', {
    status: status,
    title: `${status}: ` + req.i18n.__(expandedStatus.statusStr),
    explain: expandedStatus.statusClass,
  });
  logger.info(expandedStatus.statusClass);
  logger.info(status + ' 404 Page Called');
});

// And anything that falls though here will get the
// current error.status or a catch all 500.
// This goes to a generic single template. This may or
// may not be good if 404 and 500 pages need to be different

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status);
  const expandedStatus = mapErrorStatus(status);

  res.render('errors.njx', {
    status: status,
    title: `${status}: ` + req.i18n.__(expandedStatus.statusStr),
    explain: expandedStatus.statusClass,
  });
  logger.info(expandedStatus.statusClass);
  logger.info(status + ' Error Page Called');
});

// Jaeger collector should be started with something like (Zipkin collector also enabled)-
// First Time
// $ docker run -d --name jaeger -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 -p 5775:5775/udp -p 6831:6831/udp -p 6832:6832/udp -p 5778:5778 -p 16686:16686 -p 14268:14268 -p 9411:9411 jaegertracing/all-in-one:1.8
//
// Restart the container after that -
// $ docker kill jaeger
// $ docker ps
//
// NOTE : If testing with Jaeger collection service and it is emulating
//        zipkin pn 9411 you may not be able to start one or both containers!

app.listen(port, () => console.log(`Rpn-Calc Test app listening on port ${port}!`));
