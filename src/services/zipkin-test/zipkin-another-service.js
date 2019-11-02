const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');

// We can define a delay function with this one line
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Import axios and axios instrumentation
const axios = require('axios');
const zipkinInstrumentationAxios = require('zipkin-instrumentation-axios');

// Import zipkin stuff
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

// Template engine
const nunjucks = require('nunjucks');

const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT || 'http://localhost:9411';
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000';

// Get ourselves a zipkin tracer
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
      jsonEncoder: jsonEncoder.JSON_V2,
    }),
  }),
  localServiceName: 'web-service',
});

const app = express();

// If on the same box, make sure not the default express port of 3000
const port = process.env.PORT || 4000;

// Add zipkin express middleware
app.use(zipkinMiddleware({ tracer }));

// set up favicon path. Icon is in the root directory
app.use(favicon(path.join(__dirname, 'favicon.ico')));

// needed for json
app.use(express.json());

// Apply nunjucks and add custom filter and function (for example).
var njEnv = nunjucks.configure(['./'], {
  // set folders with templates
  autoescape: true,
  express: app,
  cache: false,
  watch: true, // need chokidar package to work
});

// Add axios instrumentation
const zipkinAxios = zipkinInstrumentationAxios(axios, { tracer, serviceName: 'axios-client' });

app.get('/', async (req, res, next) => {
  try {
    const result = await zipkinAxios.get(`${API_ENDPOINT}/time`);
    res.render('zipkin-index.njx', {
      time: new Date(result.data.currentDate).toLocaleTimeString(),
      service: `${API_ENDPOINT}/time`,
      zipkin: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
      status: 'N/A',
    });
  } catch (error) {
    next(error);
  }
});

app.get('/loopback', async (req, res, next) => {
  try {
    const result = await zipkinAxios.get(`${API_ENDPOINT}/ping`);
    res.render('zipkin-index.njx', {
      time: new Date(result.data.time).toLocaleTimeString(),
      service: `${API_ENDPOINT}/time`,
      zipkin: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
      status: result.data.status,
    });
  } catch (error) {
    next(error);
  }
});

// Gets the time and ships it back as a json blob
// We lament for 100ms to show up better in the Zipkin console
app.get('/time', async (req, res) => {
  await tracer.local('awaiting 75 delay', () => delay(75));
  res.json({ time: new Date().getTime() });
});

app.listen(port, () => console.log(`Zipkin Test Web service listening on port ${port}`));
