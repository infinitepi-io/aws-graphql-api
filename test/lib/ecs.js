const chai = require('chai')
chai.use(require('chai-as-promised'))
const { expect } = chai
const { mockClient } = require('aws-sdk-client-mock')
const sinon = require("sinon");
const {
  ECSClient,
  DescribeServicesCommand,
  ListServicesCommand,
  DescribeClustersCommand
} = require('@aws-sdk/client-ecs')
const ecsMock = mockClient(ECSClient)
const ecs = require('../../src/lib/ecs')
describe('lib/ecs.js', () => {
  describe('ecsCalls', () => {
    afterEach(() => {
      ecsMock.reset()
    })
    describe('listServiceNames', () => {
      it('split-success', async () => {
        const serviceNames = 'echo, gds-data'
        const result = await ecs.listServiceNames(serviceNames)
        expect(result).to.be.an('array')
        expect(result).to.deep.equal(['echo', 'gds-data'])
      })
      it('split-failure:service-name-without-comma', async () => {
        const serviceNames = 'echo gds-data'
        const result = await ecs.listServiceNames(serviceNames)
        expect(result).to.be.an('array')
        expect(result).to.not.deep.equal(['echo', 'gds-data'])
      })
    })
    describe('listService', () => {
      it('missing-arg:fullClusterName', async () => {
        await expect(
          ecs.listService({
            client: ecsMock,
            serviceCount: 10
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'clusterName is required'
        )
      })
      it('missing-arg:client', async () => {
        await expect(
          ecs.listService({
            fullClusterName: 'v2-i03',
            serviceCount: 10
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'client is required'
        )
      })
      it('missing-arg:serviceCount', async () => {
        await expect(
          ecs.listService({
            clusterName: 'v2-i03',
            client: ecsMock
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'serviceCount is required'
        )
      })
      it('missing-arg:serviceCount', async () => {
        await expect(
          ecs.listService({
            clusterName: 'v2-i03',
            client: ecsMock
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'serviceCount is required'
        )
      })
      it('listService:pass-more-than-10-services', async () => {
        ecsMock.on(ListServicesCommand).resolves({
          serviceArns: [
            'arn:aws:ecs:something1',
            'arn:aws:ecs:something2',
            'arn:aws:ecs:something3',
            'arn:aws:ecs:something4',
            'arn:aws:ecs:something5',
            'arn:aws:ecs:something6',
            'arn:aws:ecs:something7',
            'arn:aws:ecs:something8',
            'arn:aws:ecs:something9',
            'arn:aws:ecs:something10',
            'arn:aws:ecs:something11',
            'arn:aws:ecs:something12',
            'arn:aws:ecs:something13'
          ]
        })
        ecsMock
          .on(DescribeServicesCommand)
          // resolveOnce helps to resolve the first call #https://github.com/m-radzikowski/aws-sdk-client-mock#aws-sdk-v3-client-mock#
          .resolvesOnce({
            services: [
              {
                serviceArn: 'arn:aws:ecs:something1'
              },
              {
                serviceArn: 'arn:aws:ecs:something2'
              },
              {
                serviceArn: 'arn:aws:ecs:something3'
              },
              {
                serviceArn: 'arn:aws:ecs:something4'
              },
              {
                serviceArn: 'arn:aws:ecs:something5'
              },
              {
                serviceArn: 'arn:aws:ecs:something6'
              },
              {
                serviceArn: 'arn:aws:ecs:something7'
              },
              {
                serviceArn: 'arn:aws:ecs:something8'
              },
              {
                serviceArn: 'arn:aws:ecs:something9'
              },
              {
                serviceArn: 'arn:aws:ecs:something10'
              }
            ]
          })
          .resolves({
            services: [
              {
                serviceArn: 'arn:aws:ecs:something11'
              },
              {
                serviceArn: 'arn:aws:ecs:something12'
              },
              {
                serviceArn: 'arn:aws:ecs:something13'
              }
            ]
          })
        const result = await ecs.listService({
          client: ecsMock,
          clusterName: 'v2-i03',
          serviceCount: 13
        })
        const serviceArns = result.services.map((service) => service.serviceArn)
        expect(serviceArns).to.have.lengthOf(13)
      })
      it('describeServices:pass', async () => {
        ecsMock.on(DescribeServicesCommand).resolves({
          services: [
            {
              serviceArn: 'arn:aws:ecs:something',
              clusterName: 'v2-i03'
            },
            {
              serviceArn: 'arn:aws:ecs:bla-bla',
              clusterName: 'v2-i03'
            }
          ]
        })
        const result = await ecs.describeServices({
          client: ecsMock,
          clusterName: 'v2-i03',
          serviceArns: ['something', 'bla-bla']
        })
        expect(
          ecsMock.commandCalls(DescribeServicesCommand)[0].firstArg.input
        ).to.deep.equal({
          cluster: 'v2-i03',
          services: ['something', 'bla-bla'],
          include: ['TAGS']
        })
        expect(result[0]).to.have.property('clusterName')
        expect(result[1]).to.have.property('clusterName')
      })
    })
    describe('describeClusters', async () => {
      it('describeClusters:pass', async () => {
        const clusterName = 'v2-i03'
        ecsMock.on(DescribeClustersCommand).resolves({
          clusters: [
            {
              clusterArn: 'arn:aws:ecs:us-east-1:868468680417:cluster/v2-i03',
              clusterName: 'v2-i03',
              status: 'ACTIVE',
              registeredContainerInstancesCount: 16,
              runningTasksCount: 162,
              pendingTasksCount: 0,
              activeServicesCount: 84
            }
          ]
        })
        const result = await ecs.describeClusters({
          client: ecsMock,
          clusterName
        })
        expect(result).to.haveOwnProperty('clusters')
        expect(result.clusters[0]).to.haveOwnProperty('activeServicesCount')
        expect(result.clusters).to.have.lengthOf.above(0)
      })
      it('describeClusters:clusters-length-is-zero', async () => {
        const clusterName = 'v2-i03'
        ecsMock.on(DescribeClustersCommand).resolves({
          clusters: []
        })
        const result = await ecs.describeClusters({
          client: ecsMock,
          clusterName
        })
        expect(result).to.haveOwnProperty('clusters')
        expect(result.clusters).to.have.lengthOf(0)
      })
      it('describeClusters:missing-client', async () => {
        const clusterName = 'v2-i03'
        await expect(
          ecs.describeClusters({
            clusterName
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'client is required'
        )
      })
      it('describeClusters:missing-clusterName', async () => {
        await expect(
          ecs.describeClusters({
            client: ecsMock
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'clusterName is required'
        )
      })
    })
    describe('gdsServiceInfo', async () => {
      it('missing-arg:serviceNames', async () => {
        await expect(
          ecs.gdsServiceInfo({
            clusterName: 'i03',
            clusterDeployedRegion: 'us-east-1'
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'serviceNames is required'
        )
      })
      it('missing-arg:clusterName', async () => {
        await expect(
          ecs.gdsServiceInfo({
            serviceNames: 'something1, something2',
            clusterDeployedRegion: 'us-east-1'
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'clusterName is required'
        )
      })
      it('missing-arg:clusterDeployedRegion', async () => {
        await expect(
          ecs.gdsServiceInfo({
            serviceNames: 'something1, something2',
            clusterName: 'i03',
          })
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'clusterDeployedRegion is required'
        )
      })
    })
    describe('getClusterResourcesInfo', async () => {
      it('pass:getClusterResourcesInfo', async () => {
        const getlistofService = {
          services: [
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-1' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-2' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-3' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-4' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-5' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-6' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-7' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-8' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-9' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-10' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-11' }
          ]
        }
        const fullserviceNames = ['v2-i03_bla-bla-1', 'v2-i03_bla-bla-2', 'v2-i03_bla-bla-3', 'v2-i03_bla-bla-4', 'v2-i03_bla-bla-5', 'v2-i03_bla-bla-6',
          'v2-i03_bla-bla-7', 'v2-i03_bla-bla-8', 'v2-i03_bla-bla-9', 'v2-i03_bla-bla-10', 'v2-i03_bla-bla-11'
        ]
        const result = await ecs.getClusterResourcesInfo(getlistofService, fullserviceNames)
        expect(result).to.be.an('array')
        expect(result).to.be.deep.equal(getlistofService.services)
      })
      it('fail:getClusterResourcesInfo', async () => {
        const fullserviceNames = ['v2-i03_bla-bla-1', 'v2-i03_bla-bla-2', 'v2-i03_bla-bla-3', 'v2-i03_bla-bla-4', 'v2-i03_bla-bla-5', 'v2-i03_bla-bla-6',
          'v2-i03_bla-bla-7', 'v2-i03_bla-bla-8', 'v2-i03_bla-bla-9', 'v2-i03_wrong-service'
        ]
        const getlistofService = {
          services: [
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-1' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-2' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-3' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-4' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-5' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-6' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-7' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-8' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-9' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-10' },
            { clusterName: 'v2-i03', serviceName: 'v2-i03_bla-bla-11' }
          ]
        }
        await expect(
          ecs.getClusterResourcesInfo(getlistofService, fullserviceNames)
        ).to.eventually.be.rejected.and.has.property(
          'message',
          'invalidServiceName'
        )
      })
    })
  })
  
})
