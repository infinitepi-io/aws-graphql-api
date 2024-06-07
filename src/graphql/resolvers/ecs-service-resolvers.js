'use strict';

const ecs = require('../../lib/ecs')
const logger = require("../../lib/logger");

// Resolvers Defination!
const resolvers = {
    Query: {
      gdsServicesInfo: async (_, { serviceNames, clusterName, clusterDeployedRegion }) => {
        // Uncomment Below lines if your orgnaization uses specific cluster name pattern.
        // if (!/^(i|p|s)[0-9][0-9]$/.test(clusterName)) {
        //   logger.error('The cluster Name is incorrect, we only support i|p|s cluster.EX: i03,i76,s02')
        //   throw new Error('invalidClusterName')
        // }
        const service = await ecs.gdsServiceInfo({serviceNames, clusterName, clusterDeployedRegion})
        if (Array.isArray(service)) {
          return service
        } else {
          return []
        }
      }
    }
  }

  module.exports = {
    resolvers
  }
