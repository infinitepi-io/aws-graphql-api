import { ECSClient, DescribeServicesCommand, ListServicesCommand, DescribeClustersCommand } from '@aws-sdk/client-ecs'
import { createLogger } from './logger.js'
let logger = createLogger()

// Check if the service exist!
const listServiceNames = (serviceNames) => {
  return serviceNames.split(',')
}
// Check if the requested service exist or not!
const checkQueriedServicesExist = async (serviceNames, describeServices) => {
  const listofService = listServiceNames(serviceNames)
  const serviceExists = listofService.every(name => describeServices.services.some(service => service.serviceName === name))
  return serviceExists
}

const listService = async (client, clusterName, serviceCount) => {
  const serviceResponseSet = { services: [] }
  const listservices = await client.send(new ListServicesCommand({ cluster: clusterName, maxResults: serviceCount }))
  const batchSize = 10
  const serviceArns = listservices.serviceArns
  const describePromises = []
  const numBatches = Math.ceil(serviceArns.length / batchSize)
  for (let startIndex = 0; startIndex < numBatches; startIndex++) {
    const serviceArnBatch = serviceArns.slice(startIndex * batchSize, (startIndex + 1) * batchSize)
    const describePromise = describeServices(client, clusterName, serviceArnBatch)
    describePromises.push(describePromise)
  }
  const getDescribedService = await Promise.all(describePromises)
  for (const describedService of getDescribedService) {
    serviceResponseSet.services = serviceResponseSet.services.concat(describedService.services)
  }

  logger.info('Listing & Describing All Services within the queried Cluster!')
  return serviceResponseSet
}

const describeServices = async (client, clusterName, serviceArns) => {
  return await client.send(new DescribeServicesCommand({ cluster: clusterName, include: ['TAGS'], services: serviceArns }))
}

const getlistofServices = async (client, clusterName, serviceCount) => {
  return await listService(client, clusterName, serviceCount)
}

const addClusterName = (filteredServices, clusterName) => {
  for (let i = 0; i < filteredServices.length; i++) {
    filteredServices[i].clusterName = clusterName
  }
  return filteredServices
}

const throwServiceError = () => {
  logger = createLogger('error')
  logger.error('One or more of the service names you provided in your query are invalid. Please adjust your query criteria and try again!')
  throw new Error('invalidServiceName')
}

const throwClusterNotFoundError = () => {
  logger = createLogger('error')
  logger.error('The requested cluster could not be found within the account that the GraphQL API has access to.')
  throw new Error('clusterNotFound')
}

export const getdescribedService = async (serviceNames, clusterName, region) => {
  logger.info(`Process ${process.pid} is Running!`)
  let serviceNamesList = listServiceNames(serviceNames)
  serviceNamesList = serviceNamesList.map(element => { return element.trim() })
  //Remove the duplicate services. 
  const fullserviceNames = [...new Set(serviceNamesList)]
  const client = new ECSClient({ region })
  let filteredServices
  // if the length of requested service is greater then 10 then this application uses batch to get all the services information as AWS supports only 10 services for DescribeServicesCommand operation.
  // This operation takes 10-11 seconds.
  logger.info(`Number of services queried:${fullserviceNames.length}`)
  const describeCluster = await client.send(new DescribeClustersCommand({ clusters: [clusterName], include: ['TAGS'] }))
  if (fullserviceNames.length > 10) {
    /// / Check if there is information in the cluster. With the DescribeClustersCommand command AWS always returns 200 even if the cluster Not found!
    if (describeCluster.clusters.length > 0) {
      const serviceCount = describeCluster.clusters[0].activeServicesCount > 5000 // AWS Allows 5k Service per Cluster.
        ? (() => { throw new Error('maxServiceCountExceeded') })()
        : describeCluster.clusters[0].activeServicesCount
      const getlistofService = await getlistofServices(client, clusterName, serviceCount)
      if (Array.isArray(getlistofService.services)) {
        console.log("before filteredServices service operation!")
        filteredServices = getlistofService.services.filter(service => fullserviceNames.includes(service.serviceName))
        logger.info(`Number of services queried request received!:${fullserviceNames.length}`)
        logger.info(`Number of services queried information received!:${filteredServices.length}`)
        if (filteredServices.length === fullserviceNames.length) {
          logger.info('Retrieving the Services Information Based on the Query!')
          return addClusterName(filteredServices, clusterName)
        } else {
          if (!await checkQueriedServicesExist(serviceNames, getlistofService)) {
            throwServiceError()
          }
        }
      }
    } else {
      throwClusterNotFoundError()
    }
    // if the length of requested services is less then 10 then we will be directly querying and getting the services information. it takes 5-6 seconds approx.
  } else {
    // Check if there is cluster exist with the queried name.
    if (describeCluster.clusters.length > 0) {
      const response = await describeServices(client, clusterName, fullserviceNames)
      filteredServices = response.services
      if (filteredServices.length === fullserviceNames.length) {
        logger.info('Retrieving the Services Information Based on the Query!')
        return addClusterName(filteredServices, clusterName)
      } else {
        if (!await checkQueriedServicesExist(serviceNames, response)) {
          throwServiceError()
        }
      }
    } else {
      throwClusterNotFoundError()
    }
  }
}
