// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
'use strict'

const {
  DescribeServicesCommand,
  ListServicesCommand,
  DescribeClustersCommand,
  ECSClient
} = require('@aws-sdk/client-ecs')
const logger = require('./logger')
const isRequired = (paramName) => {
  throw new Error(`${paramName} is required`)
}

const listServiceNames = (serviceNames) => {
  if (serviceNames) {
    // Split the input string by commas, trim whitespace from each service name.
    return serviceNames.split(',').map((serviceName) => serviceName.trim())
  } else {
    logger.info(
      'Zero Services queried, please add services to see the result!'
    )
    throw new Error('zeroServicesQueried')
  }
}

const listService = async ({
  client = isRequired('client'),
  clusterName = isRequired('clusterName'),
  serviceCount = isRequired('serviceCount')
}) => {
  const serviceResponseSet = { services: [] }
  const listservices = await client.send(
    new ListServicesCommand({
      cluster: clusterName,
      maxResults: serviceCount
    })
  )
  const batchSize = 10
  const serviceArns = listservices.serviceArns
  const describePromises = []
  const numBatches = Math.ceil(serviceArns.length / batchSize)
  for (let startIndex = 0; startIndex < numBatches; startIndex++) {
    const serviceArnBatch = serviceArns.slice(
      startIndex * batchSize,
      (startIndex + 1) * batchSize
    )
    const describePromise = describeServices({
      client,
      clusterName,
      serviceArns: serviceArnBatch
    })
    describePromises.push(describePromise)
  }
  const getallDescribedService = await Promise.all(describePromises)
  for (const describedService of getallDescribedService) {
    serviceResponseSet.services =
      serviceResponseSet.services.concat(describedService)
  }
  logger.info('Listing & Describing All Services within the queried Cluster!')
  return serviceResponseSet
}

const throwServiceError = () => {
  logger.error(
    'One or more of the service names you provided in your query are invalid. Please adjust your query criteria and try again!'
  )
  throw new Error('invalidServiceName')
}

const describeServices = async ({ client, clusterName, serviceArns }) => {
  const args = {
    cluster: clusterName,
    include: ['TAGS'],
    services: serviceArns
  }
  const response = await client.send(new DescribeServicesCommand(args))
  let filteredClusterNameServices = response.services
  if (filteredClusterNameServices.length === serviceArns.length) {
    logger.info('Retrieving the Services Information Based on the Query!')
    filteredClusterNameServices = filteredClusterNameServices.map((v) => {
      v.clusterName = clusterName
      return v
    })
    return filteredClusterNameServices
  } else {
    throwServiceError()
  }
}

const describeClusters = async ({
  client = isRequired('client'),
  clusterName = isRequired('clusterName')
}) => {
  return await client.send(
    new DescribeClustersCommand({
      clusters: [clusterName],
      include: ['TAGS']
    })
  )
}

const getClusterResourcesInfo = async (getlistofService, fullserviceNames) => {
  let filteredServices
  if (Array.isArray(getlistofService.services)) {
    filteredServices = getlistofService.services.filter(service => fullserviceNames.includes(service.serviceName))
    logger.info(`Number of services queried request received!:${fullserviceNames.length}`)
    if (filteredServices.length === fullserviceNames.length) {
      return getlistofService.services
    } else {
      throwServiceError()
    }
  }
}

const gdsServiceInfo = async ({
  serviceNames = isRequired('serviceNames'),
  clusterName = isRequired('clusterName'),
  clusterDeployedRegion = isRequired('clusterDeployedRegion')
}) => {
  const fullserviceNames = listServiceNames(serviceNames)
  const region = clusterDeployedRegion
  const client = new ECSClient({ region })
  // if the length of requested service is greater then 10 then we need to use batch to get all the services information as AWS describe service operation supports 10 services at a time.
  // This operation takes 10-11 seconds.
  logger.info(`Number of services queried:${fullserviceNames.length}`)
  const describeCluster = await describeClusters({ client, clusterName })
  // if the cluster exist the clusters will have some information otherwise it will be empty.
  // {"clusters": [{"clusterArn": "arn:aws:ecs:us-east-1:988857891049:cluster/v6-i06","clusterName": "v6-i06","status": "ACTIVE","registeredContainerInstancesCount": 1,"runningTasksCount": 12,
  // "pendingTasksCount": 0,"activeServicesCount": 5,"statistics": [],"tags": [],"settings": [],"capacityProviders": ["capacity-provider-v6-i06"],"defaultCapacityProviderStrategy": [{
  // "capacityProvider": "capacity-provider-v6-i06","weight": 100,"base": 0 }]}]}}
  if (describeCluster.clusters.length > 0) {
    if (fullserviceNames.length > 10) {
      const serviceCount = describeCluster.clusters[0].activeServicesCount
      const getlistofService = await listService({
        client,
        clusterName,
        serviceCount
      })
      return getClusterResourcesInfo(getlistofService, fullserviceNames)
    } else if (fullserviceNames.length !== 0 && fullserviceNames.length <= 10) {
      const response = await describeServices({
        client,
        clusterName,
        serviceArns: fullserviceNames
      })
      return response
    } else {
      logger.info('Please modify the query to retrieve the result!')
      throw new Error('modifyQuery')
    }
  } else {
    // if the cluster doesn't exist then clusters will be empty.
    // {"clusters": [],"failures": [{"arn": "arn:aws:ecs:us-east-1:988857891049:cluster/v2-i06","reason": "MISSING"}]}
    logger.error(
      `The queried cluster, ${clusterName}, is not found within GDS.`
    )
    throw new Error('clusterNotFound')
  }
}

module.exports = {
  gdsServiceInfo,
  listServiceNames,
  listService,
  describeServices,
  describeClusters,
  getClusterResourcesInfo
}
