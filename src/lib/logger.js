import winston from 'winston'

export function createLogger () {
  return winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'ecs-graphql-api' },
    transports: [new winston.transports.Console()]
  })
}
