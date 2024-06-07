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

fastify.listen({ port }, (err, address) => {
  if (err) {
    logger.error(err)
    process.exit(1)
  }
  logger.info(`server listening on ${address}`)
})


