const { mockServer } = require('@graphql-tools/mock')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { loadSchemaSync } = require('@graphql-tools/load')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')
const { expect } = require("chai");
const { join } = require('path')
const schemaPath = join(__dirname, '../..', 'src/graphql/schema/ecs-service-schema.graphql')
const ecsGraphqlSchema = loadSchemaSync(schemaPath, {
  loaders: [new GraphQLFileLoader()]
})
const graphqlFixture = require('../fixtures/graphql-response.json')
const schema = makeExecutableSchema({ typeDefs: ecsGraphqlSchema })
const mocks = {
  Query: () => ({
    gdsServicesInfo: () => graphqlFixture.response
  })
}
const query = `{
  gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
    loadBalancers{
      targetGroupArn
      containerName
      containerPort
    }
  }
}`

// Mock the server passing the schema, mocks object and preserveResolvers arguments
const schemaWithMocks = mockServer(schema, mocks)

describe('validatingGraphqlSchema', () => {
  it('CapacityProviderStrategy:must-be-an-array', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        capacityProviderStrategy{
          base
          capacityProvider
          weight
        }
      }
    }`
    const result = await schemaWithMocks.query(query)
    // Make sure capacityProviderStrategy should have base property in the array.
    const capacityProviders = result.data.gdsServicesInfo[0].capacityProviderStrategy[0]
    // Make sure capacityProviderStrategy should have capacityProvider property in the array.
    expect(capacityProviders).to.haveOwnProperty('capacityProvider')
    // base should be an integer.
    expect(capacityProviders.base).to.satisfy(Number.isInteger)
    // capacityProvider should be a String.
    expect(capacityProviders.capacityProvider).to.be.an('string')
    // weight should be an integer.
    expect(capacityProviders.weight).to.satisfy(Number.isInteger)
  })
  it('capacityProviderStrategy:must-be-an-array', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        capacityProviderStrategy{
          base
          capacityProvider
          weight
        }
      }
    }`
    const result = await schemaWithMocks.query(query)
    const capacityProviders = result.data.gdsServicesInfo[0].capacityProviderStrategy[0]
    // Make sure capacityProviderStrategy should have base property in the array.
    expect(capacityProviders).to.haveOwnProperty('base')
    // base should be an integer.
    expect(capacityProviders.base).to.satisfy(Number.isInteger)
    // Make sure capacityProviderStrategy should have capacityProvider property in the array.
    expect(capacityProviders).to.haveOwnProperty('capacityProvider')
    // capacityProvider should be a String.
    expect(capacityProviders.capacityProvider).to.be.an('string')
    // Make sure capacityProviderStrategy should have weight property in the array.
    expect(capacityProviders).to.haveOwnProperty('weight')
    // weight should be an integer.
    expect(capacityProviders.weight).to.satisfy(Number.isInteger)
  })

  it('loadBalancers:must-be-an-array', async () => {
    const result = await schemaWithMocks.query(query)
    const loadBalancers = result.data.gdsServicesInfo[0].loadBalancers[0]
    // Make sure loadBalancers should have targetGroupArn property in the array.
    expect(loadBalancers).to.haveOwnProperty('targetGroupArn')
    // targetGroupArn should be an String.
    expect(loadBalancers.targetGroupArn).to.be.an('string')
    // Make sure loadBalancers should have containerName property in the array.
    expect(loadBalancers).to.haveOwnProperty('containerName')
    // containerName should be a String.
    expect(loadBalancers.containerName).to.be.an('string')
    // Make sure loadBalancers should have containerPort property in the array.
    expect(loadBalancers).to.haveOwnProperty('containerPort')
    // containerPort should be an integer.
    expect(loadBalancers.containerPort).to.satisfy(Number.isInteger)
  })

  it('serviceEvents:must-be-an-array', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        events{
          id
          createdAt
          message
        }
      }
    }`
    const result = await schemaWithMocks.query(query)
    const ecsEvents = result.data.gdsServicesInfo[0].events[0]
    // Make sure events should have id property in the array.
    expect(ecsEvents).to.haveOwnProperty('id')
    // Make sure events should have createdAt property in the array.
    expect(ecsEvents).to.haveOwnProperty('createdAt')
    // createdAt should DateTime Scaler.
    const parsedDate = new Date(ecsEvents.createdAt);
    expect(parsedDate.toISOString()).to.equal(ecsEvents.createdAt)
    // Make sure events should have message property in the array.
    expect(ecsEvents).to.haveOwnProperty('message')
    // message should be an string.
    expect(ecsEvents.message).to.be.an('string')
  })

  it('clusterArn:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        clusterArn
      }
    }`
    const result = await schemaWithMocks.query(query)
    const clusterArn = result.data.gdsServicesInfo[0].clusterArn
    // clusterArn should be a String.
    expect(clusterArn).to.be.a('string')
  })

  it('clusterName:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        clusterName
      }
    }`
    const result = await schemaWithMocks.query(query)
    const clusterName = result.data.gdsServicesInfo[0].clusterName
    // clusterName should be a String.
    expect(clusterName).to.be.a('string')
  })

  it('createdAt:must-be-in-scaler-date-time-format', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        createdAt
      }
    }`
    const result = await schemaWithMocks.query(query)
    const serviceCreatedAt = result.data.gdsServicesInfo[0].createdAt
    // createdAt should DateTime Scaler.
    const parsedDate = new Date(serviceCreatedAt);
    expect(parsedDate.toISOString()).to.equal(serviceCreatedAt)
  })

  it('createdBy:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        createdBy
      }
    }`
    const result = await schemaWithMocks.query(query)
    // createdBy should be a String.
    expect(result.data.gdsServicesInfo[0].createdBy).to.be.a('string')
  })

  it('desiredCount:must-be-an-integer', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        desiredCount
      }
    }`
    const result = await schemaWithMocks.query(query)
    // desiredCount should be a Integer.
    expect(result.data.gdsServicesInfo[0].desiredCount).to.satisfy(Number.isInteger)
  })

  it('enableECSManagedTags:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        enableECSManagedTags
      }
    }`
    const result = await schemaWithMocks.query(query)
    // enableECSManagedTags should be a boolen value.
    expect(result.data.gdsServicesInfo[0].enableECSManagedTags).to.be.false
  })

  it('enableExecuteCommand:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        enableExecuteCommand
      }
    }`
    const result = await schemaWithMocks.query(query)
    // enableExecuteCommand should be a boolen value.
    expect(result.data.gdsServicesInfo[0].enableExecuteCommand).to.be.false
  })

  it('healthCheckGracePeriodSeconds:must-be-an-integer', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        healthCheckGracePeriodSeconds
      }
    }`
    const result = await schemaWithMocks.query(query)
    // healthCheckGracePeriodSeconds should be an Integer.
    expect(result.data.gdsServicesInfo[0].healthCheckGracePeriodSeconds).to.satisfy(Number.isInteger)
  })

  it('pendingCount:must-be-an-integer', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        pendingCount
      }
    }`
    const result = await schemaWithMocks.query(query)
    // pendingCount should be an Integer.
    expect(result.data.gdsServicesInfo[0].pendingCount).to.satisfy(Number.isInteger)
  })

  it('propagateTags:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        propagateTags
      }
    }`
    const result = await schemaWithMocks.query(query)
    // propagateTags should be a string.
    expect(result.data.gdsServicesInfo[0].propagateTags).to.be.a('string')
  })

  it('roleArn:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        roleArn
      }
    }`
    const result = await schemaWithMocks.query(query)
    // roleArn should be a string.
    expect(result.data.gdsServicesInfo[0].roleArn).to.be.a('string')
  })

  it('runningCount:must-be-a-integer', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        runningCount
      }
    }`
    const result = await schemaWithMocks.query(query)
    // runningCount should be an integer.
    expect(result.data.gdsServicesInfo[0].runningCount).to.satisfy(Number.isInteger)
  })

  it('schedulingStrategy:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        schedulingStrategy
      }
    }`
    const result = await schemaWithMocks.query(query)
    // schedulingStrategy should be a string.
    expect(result.data.gdsServicesInfo[0].schedulingStrategy).to.be.a('string')
  })

  it('status:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        status
      }
    }`
    const result = await schemaWithMocks.query(query)
    // status should be a string.
    expect(result.data.gdsServicesInfo[0].status).to.be.a('string')
  })

  it('serviceName:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        serviceName
      }
    }`
    const result = await schemaWithMocks.query(query)
    // serviceName should be a string.
    expect(result.data.gdsServicesInfo[0].serviceName).to.be.a('string')
  })

  it('serviceArn:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        serviceArn
      }
    }`
    const result = await schemaWithMocks.query(query)
    // serviceArn should be a string.
    expect(result.data.gdsServicesInfo[0].serviceArn).to.be.a('string')
  })

  it('taskDefinition:must-be-a-string', async () => {
    const query = `{
      gdsServicesInfo(serviceNames: "v8-x58_graphql-api", clusterName: "v8-x58", clusterDeployedRegion: "us-east-1") {
        taskDefinition
      }
    }`
    const result = await schemaWithMocks.query(query)
    // taskDefinition should be a string.
    expect(result.data.gdsServicesInfo[0].taskDefinition).to.be.a('string')
  })
})
