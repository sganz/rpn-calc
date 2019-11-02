const { createLogger, format, transports } = require('winston');

require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';
const filename = path.join(logDir, 'results.log');

// Create the log directory if it does not exist

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Set up the Winston log rotator

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-results.log`,
  datePattern: 'YYYY-MM-DD',
  format: format.combine(
    format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`),
  ),
});

/**
 * Create a Winston Logger. This is pretty much a default set from
 * their examples.
 */
const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.label({ label: path.basename(process.mainModule.filename) }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`),
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(), // format.splat(), for direct %s types
        format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`),
      ),
    }),
    // new transports.File({ filename }), // If not using the logroller
    dailyRotateFileTransport,
  ],
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    // Messages may have trailing \n that causes extra newlines, trim them!

    logger.info(message.trim());
  },
};
