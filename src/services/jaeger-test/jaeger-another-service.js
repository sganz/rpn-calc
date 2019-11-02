const axios = require('axios');
const express = require('express');
const expressOpentracing = require('express-opentracing').default;
const { initTracer } = require('jaeger-client');
const createAxiosTracing = require('axios-opentracing').default;
const favicon = require('serve-favicon');
const path = require('path');

const config = {
  serviceName: 'jaeger-another-service.js:4000',
  sampler: {
    type: 'const', // Defines collector sampling - see JAEGER docs
    param: 1,
  },

  // For location of collector and such
  // Should typically come from the environment

  reporter: {
    collectorEndpoint: 'http://localhost:14268/api/traces',
    agentHost: 'localhost',
    agentPort: '6831',
    logSpans: true,
  },
};

// Setup tracer
const tracer = initTracer(config);

const applyTracingInterceptors = createAxiosTracing(tracer);

// Template engine
const nunjucks = require('nunjucks');

// Application (app.js)
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000';

const app = express();

// If on the same box, make sure not the default express port of 3000, or others!
const port = process.env.PORT || 4000;

// Setup express tracer middleware
app.use(expressOpentracing({ tracer }));

// set up favicon path. Icon is in the root directory
app.use(favicon(path.join(__dirname, 'favicon.ico')));

// needed for json
app.use(express.json());

app.use((req, res, next) => {
  const API = axios.create({
    baseURL: 'http://localhost:3000', // Back to the main app.js instance running
  });

  applyTracingInterceptors(API, { span: req.span });
  req.API = API;
  next();
});

// Apply nunjucks and add custom filter and function (for example).
nunjucks.configure(['./'], {
  // set folders with templates
  autoescape: true,
  express: app,
  cache: false,
  watch: true, // need chokidar package to work
});

app.get('/', async (req, res, next) => {
  try {
    // Want to use async/await? Add the `async` keyword to your outer function/method.

    const response = await req.API.get(`${API_ENDPOINT}/time`);
    res.render('jaeger-index.njx', {
      time: new Date(response.data.currentDate).toLocaleTimeString(),
      service: `${API_ENDPOINT}/time`,
      status: 'N/A',
    });
  } catch (error) {
    next(error);
  }
});

app.get('/loopback', async (req, res, next) => {
  try {
    const response = await req.API.get(`${API_ENDPOINT}/ping`);

    res.render('jaeger-index.njx', {
      time: new Date(response.data.time).toLocaleTimeString(),
      service: `${API_ENDPOINT}/time`,
      status: response.data.status,
    });
  } catch (error) {
    next(error);
  }
});

// Gets the time and ships it back as a json blob
// We lament for 100ms to show up better in the Zipkin console
app.get('/time', async (req, res) => {
  res.json({ time: new Date().getTime() });
});

// Kick it into gear
app.listen(port, () => console.log(`Web service listening on port ${port}`));
