// Graphql Schema.
export const schema = `
  type CapacityProviderStrategy {
    base: Int
    capacityProvider: String!
    weight: Int
  }
  type loadBalancerInfo {
    targetGroupArn: String!
    containerName: String!
    containerPort: Int!
  }
  type serviceEvents{
    id: ID!
    createdAt: String!
    message: String!
  }
  type queriedServicesdetailedInfo {
    "ECS Cluster capacity provider details."
    capacityProviderStrategy: [CapacityProviderStrategy]
    "A list of Elastic Load Balancing load balancer objects. It contains the load balancer name, the container name, and the container port to access from the load balancer. The container name is as it appears in a container definition"
    loadBalancers: [loadBalancerInfo]
    "The event stream for your service. A maximum of 100 of the latest events are displayed."
    events: [serviceEvents]
    "The Amazon Resource Name (ARN) of the cluster that hosts the service."
    clusterArn: String!
    "Name of the cluster"
    clusterName: String!
    "The Unix timestamp for the time when the task set was created."
    createdAt: Float!
    "The principal that created the service."
    createdBy: String
    "The desired number of instantiations of the task definition to keep running on the service. This value is specified when the service is created with CreateService , and it can be modified with UpdateService ."
    desiredCount: Int!
    "Determines whether to use Amazon ECS managed tags for the tasks in the service. For more information, see Tagging Your Amazon ECS Resources in the Amazon Elastic Container Service Developer Guide ."
    enableECSManagedTags: Boolean
    "Determines whether the execute command functionality is enabled for the service. If true , the execute command functionality is enabled for all containers in tasks as part of the service."
    enableExecuteCommand: Boolean
    "The period of time, in seconds, that the Amazon ECS service scheduler ignores unhealthy Elastic Load Balancing target health checks after a task has first started."
    healthCheckGracePeriodSeconds: Int
    "The number of tasks in the cluster that are in the PENDING state."
    pendingCount: Int
    "Determines whether to propagate the tags from the task definition or the service to the task. If no value is specified, the tags aren't propagated."
    propagateTags: String!
    "The ARN of the IAM role that's associated with the service. It allows the Amazon ECS container agent to register container instances with an Elastic Load Balancing load balancer."
    roleArn: String!
    "The number of tasks in the cluster that are in the RUNNING state."
    runningCount: Int
    "The scheduling strategy to use for the service. For more information, see [service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html)."
    schedulingStrategy: String!
    "The status of the service. The valid values are ACTIVE , DRAINING , or INACTIVE ."
    status: String!
    "The name of the service."
    serviceName: String!
    "The Amazon Resource Name (ARN) of the service the task set exists in."
    serviceArn: String!
    "The task definition that the task set is using."
    taskDefinition: String!
  }
  type Query {
    getServicesInfo(
      "A list of services to query. The Graphql API expects a comma seperated full name of the service."
      serviceNames: String!, 
      "Full name of the cluster."
      clusterName: String!
      "AWS region where the cluster is hosted."
      region: String!
      ): [queriedServicesdetailedInfo]
  }
`
