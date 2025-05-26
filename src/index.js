const fastify = require('fastify')({
  logger: false
})
const logger = require('./lib/logger')
const mercurius = require('mercurius')
const { loadSchemaSync } = require('@graphql-tools/load')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')
const { join } = require('path')
const schemaPath = join(__dirname, 'graphql/schema/ecs-service-schema.graphql')
const schema = loadSchemaSync(schemaPath, {
  loaders: [new GraphQLFileLoader()]
})
const port = 3000

const { resolvers } = require('./graphql/resolvers/ecs-service-resolvers')
fastify.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
})

// Graceful shutdown handling
const closeGracefully = async (signal) => {
  try {
    await fastify.close()
    logger.info('Server closed successfully')
    process.exit(0)
  } catch (err) {
    logger.error('Error during shutdown:', err)
    process.exit(1)
  }
}
process.on('SIGTERM', () => closeGracefully('SIGTERM'))
process.on('SIGINT', () => closeGracefully('SIGINT'))

fastify.listen({ 
  port: port,
  host: '0.0.0.0'
}, (err, address) => {
  if (err) {
    logger.error(err)
    process.exit(1)
  }
  logger.info(`server listening on ${address}`)
})
