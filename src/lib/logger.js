const winston = require('winston')
const logLevel = process.env.LOG_LEVEL || 'info'

const log = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

module.exports = log
