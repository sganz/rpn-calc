const { initTracer } = require('jaeger-client');

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

module.exports = tracer;
