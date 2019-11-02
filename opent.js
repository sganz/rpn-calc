'use strict';

var axios = require('axios'); // missing from example

const express = require('express');
const expressOpentracing = require('express-opentracing').default;
const { initTracer } = require('jaeger-client');
const createAxiosTracing = require('axios-opentracing').default;

const config = {
  serviceName: 'opent.js-3333',
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

// Create tracing applyer
const applyTracingInterceptors = createAxiosTracing(tracer);

const app = express();

// for JSON parsing
app.use(express.json());

// Setup express tracer middleware
app.use(expressOpentracing({ tracer }));

app.use((req, res, next) => {
  const API = axios.create({
    baseURL: 'http://localhost:3000', // Used for server prefix and logging. What if multiple servers ???
  });

  applyTracingInterceptors(API, { span: req.span });

  req.API = API;

  next();
});

app.get('/', async (req, res, next) => {
  try {
    const result = await req.API.get('/');
    res.end(result.data);
  } catch (error) {
    next(error);
  }
});

app.get('/homey', async (req, res, next) => {
  try {
    const result = await req.API.get('/time');
    res.json({ time: result.data.time });
  } catch (error) {
    next(error);
  }
});

const port = 3333;
app.listen(port, () => console.log(`Open Trace Test app listening on port ${port}!`));
