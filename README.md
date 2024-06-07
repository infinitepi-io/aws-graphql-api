# aws-graphql-api

This is a[ GraphQL](https://graphql.org/) API designed to retrieve service information by querying the cluster name, service name, and the region where the cluster is deployed. The long-term plan for this API is to expand its capabilities to interact with various AWS resources.

## Docs

- [Install](#install)
- [Quick Start](#quick-start)
- [Running the tests](running-the-tests)
- [Examples](#examples)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Getting Started

### Install

```bash
npm install
```

### Quick Start

```bash
npm start
```

Server will be running on:

Playground:

```bash
localhost:3000/graphiql
```

API Endpoint:

```bash
localhost:3000/graphql
```

## Running the tests

```bash
npm test
```

## Examples

Query:

```graphql
query getService($serviceNames: String!, $clusterName: String!, $clusterDeployedRegion: String!){
  gdsServicesInfo(serviceNames: $serviceNames, clusterName: $clusterName, clusterDeployedRegion: $clusterDeployedRegion){
    clusterArn
    loadBalancers{
      containerName
      containerPort
      targetGroupArn
    }
  }
}

# Varables
{
  "serviceNames": "my-service-1,my-service-2",
  "clusterName": "my-cluster",
  "clusterDeployedRegion": "us-east-1"
}
```

The AWS SDK and CLI have certain limitations when it comes to retrieving service information. For instance, the [describe-services](vscode-file://vscode-app/Applications/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/workbench.html "https://docs.aws.amazon.com/cli/latest/reference/ecs/describe-services.html") command can only handle up to 10 services at a time. However, this API overcomes that limitation, allowing you to query information for as many services as you need in a single request. This makes it a more efficient and flexible tool for managing large-scale AWS environments.

More query examples will be added [here]([https://infinitepi-io.github.io/](https://github.com/your_username/repo_name)).

## Acknowledgements

[David Dai ](https://github.com/ddai1)and [Phil Hadviger](https://github.com/datfinesoul) have significantly contributed to the development of this API with their valuable suggestions and improvements.

## Contributing

follow the guideline [here](https://github.com/infinitePi-io/ecs-graphql-api/blob/development/CONTRIBUTING.md)

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[Apache License 2.0](https://github.com/infinitePi-io/ecs-graphql-api/blob/development/LICENSE)

## Contact
