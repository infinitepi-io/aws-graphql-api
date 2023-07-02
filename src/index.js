import Fastify from 'fastify'
import mercurius from 'mercurius'
import { createLogger } from './lib/logger.js'
import {schema} from './lib/schema.js'
import {getdescribedService} from './lib/aws.js'

const fastify = Fastify()
const port = 3000
let logger = createLogger()


// Resolvers Defination!
const resolvers = {
  Query: {
    getServicesInfo: async (_, { serviceNames, clusterName, region }) => {
      let service
      if(serviceNames.length != 0){
        service = await getdescribedService(serviceNames, clusterName, region)
      } else {
        logger.error('The ECS Service name can not be empty!')
        throw new Error('serviceNameEmpty')
      }
      if (Array.isArray(service)) {
        return service
      }
    }
  }
}

// https://www.npmjs.com/package/mercurius
fastify.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
})

fastify.listen({ port }, (err) => {
  logger.info(`ECS Graphql API listening on port ${port}!`)
  if (err) {
    logger = createLogger('error')
    logger.error({ error: err.message })
    throw err
  }
})
