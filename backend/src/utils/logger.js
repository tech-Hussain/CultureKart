/**
 * Logger Configuration
 * Sends logs to both console and SolarWinds Papertrail for live monitoring
 */

const winston = require('winston');
const Transport = require('winston-transport');
const axios = require('axios');

// Custom HTTP Transport for SolarWinds Papertrail
class PapertrailHttpTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.endpoint = opts.endpoint;
    this.token = opts.token;
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Extract all metadata (exclude Winston's internal fields)
    const { timestamp, level, message, service, environment, ...metadata } = info;
    
    // Format log entry with full details for SolarWinds
    const logData = {
      timestamp,
      level,
      message,
      service,
      environment,
      ...metadata,
    };
    
    const logMessage = `${timestamp} [${level}]: ${message}\n${JSON.stringify(logData, null, 2)}\n`;

    // Send to Papertrail via HTTP (matching curl example format)
    axios.post(this.endpoint, logMessage, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${this.token}`,
      },
    }).then(() => {
      // Success - log sent
    }).catch(err => {
      // Silent fail - don't break app if logging fails
      if (err.response) {
        console.error('Papertrail log failed:', err.response.status, err.response.statusText);
        console.error('Response:', err.response.data);
      } else {
        console.error('Papertrail log failed:', err.message);
      }
    });

    callback();
  }
}

// Papertrail configuration
const papertrailEndpoint = process.env.PAPERTRAIL_ENDPOINT;
const papertrailToken = process.env.PAPERTRAIL_TOKEN;

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'culturekart-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console output (always enabled)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, environment, event, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          
          // Show full details for: locked IP events + successful admin logins
          if (event === 'admin_login_failed_locked' || 
              event === 'admin_login_blocked' || 
              event === 'admin_login_success') {
            msg += `\n${JSON.stringify(meta, null, 2)}`;
          }
          
          return msg;
        })
      ),
    }),
  ],
});

// Add Papertrail HTTP transport if configured
if (papertrailEndpoint && papertrailToken) {
  logger.add(new PapertrailHttpTransport({
    endpoint: papertrailEndpoint,
    token: papertrailToken,
  }));
  logger.info(`📡 SolarWinds Papertrail logging enabled`);
} else {
  logger.warn('⚠️  PAPERTRAIL_ENDPOINT/TOKEN not set - remote logging disabled');
}

module.exports = logger;
