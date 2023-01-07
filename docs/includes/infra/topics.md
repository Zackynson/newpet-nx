## Infra

- [Infra](#infra)
  - [Deploy tool](#deploy-tool)
  - [Deploy entry point](#deploy-entry-point)
  - [How the Project Graph is Built](#how-the-project-graph-is-built)
  - [How affected apps are built and deployed](#how-affected-apps-are-built-and-deployed)

### Deploy tool

We use the AWS Cloud Development Kit (AWS CDK) as our main deploy tool. A quick overview of how this tool works can be seen in the image below. If you have worked with CloudFormation or any other IaC tool it might be easy to get started since it share the same concept as the CloudFormation, except it is easier. Here we work with TypeScript to define our stacks.

![Overview of how the CDK works](https://docs.aws.amazon.com/pt_br/cdk/v2/guide/images/AppStacks.png)

For more information on how the CDK works, please refer to the [AWS Developer Guide](https://docs.aws.amazon.com/pt_br/cdk/v2/guide/home.html).

### Deploy entry point

The minimum entry point for this project to be deploy is the file located at `infra/main.cdk.ts`. The `main.cdk` file instantiates the `MultiRegion` class for each available region in the CDK Context. The idea is that the `MultiRegion` class should bootstrap all resources that should be deployed in multiple regions. For example if the bootstrap method of the `MultiRegion` class looks like this:

```typescript
private bootstrap() {
   /** env prop that is passed to all Stacks. */
   const env = { account: this.config.account, region: this.region };
   new BucketResourcesStack(this.app, this.prefix`BucketResourcesStack`, { env });
}
```

and we have two regions in the CDK Context, let's say us-east-1 and us-east-2, it would generate two different stacks:

```sh
$ cdk list
projectName-dev-usEast1-BucketResourcesStack
projectName-dev-usEast2-BucketResourcesStack
```

From the [CDK Docs](https://docs.aws.amazon.com/cdk/v2/guide/stacks.html) we have:

> When you run the cdk synth command for an app with multiple stacks, the cloud assembly includes a separate template for each stack instance. Even if the two stacks are instances of the same class, the AWS CDK emits them as two individual templates.

This means that the two are completely different Cloudformation Templates. If you want to create a bunch of resources that are not multi-region but rather single-region, you can follow the same concept and create a class called `MainRegion` or `NorthVirginiaRegion`. Just be aware that if you end up creating one class for each region that might not be the best approach for you. Moreover, BE AWARE that refactoring the classes that create your resources will result in re-creating them. So please try to think in the possible future cases to avoid refactoring the infrastructure (I know this is hard 😬).

Below is a basic diagram that briefly shows how the deploy process works:
![CDK Deploy Diagram](media://infra/cdk-workflow.drawio.png)

### How the Project Graph is Built

Nx creates a graph dependecy between all projects in the repository, so each application/lib is a node in this graph. You might have noticed that the `infra` folder has a `project.json` in it, which turns it into a project. This was necessary because we need the Infra to interact with the applications so we can infer the affected application. See below the graph generated for this template repository:

![Nx Graph](media://infra/nx-graph.png)

This graph can be generated with:

```sh
nx graph
```

Also note that the `infra` project is implictly referenced by all Application nodes in the graph. This implict dependecy allow us to redeploy all the applications when anything in the `infra` changes (the same behaviour as the package.json), this way we will never have a resource changed and not reflected in the applications that might use it.

If you have notice, none of the `project.json` files of the application projects have a implict dependecy explicitly set. This is achieved with the `infra-project-graph-plugin` plugin, located at `tools/plugins/infra-project-graph-plugin`. This plugin checks for every project that has an application type add adds this implicit dependecy to the `infra` project. It also remove the dependecy that the `infra` project has in every other application. Such dependecy is useless for us and would only make the graph more tangled than it needs.

### How affected apps are built and deployed

We use Nx to discover which projects were affected and should be re-deployed. For example, if we change something in the `infra` project, all projects would be affects since they all depend on the `infra` (see [How the Project Graph is Built](#how-the-project-graph-is-built) for reference). Let's see how Nx sees affected projects in the graph. For this we should run the below command:

```sh
nx affected:graph --base=HEAD~1 --head=HEAD
```

This would give us the following graph:

![Nx Affected Graph](media://infra/affected-graph.png)

There are some steps from build to deploy. Refer to the workflow below and the following decription of each step:

![Build Workflow](media://infra/build-workflow.drawio.png)

Steps Description:

1. We want only the affected apps to build. This ensures that our deploy process will be as quick as possible. This step is pretty straightforward since Nx does everything for us. Since it has the projects graph (see [How the Project Graph is Built](#how-the-project-graph-is-built) for reference), it knows which one are affected and target the build script only for those. The command that achieves this is `nx affected --target=build --configuration=production` which is also aliased as `npm run build:affected`.
2. Since we need to deploy each lambda as a single unit, it need the packages that are in the root node_modules folder. We also want only the packages used by the project, this way our lambda would be small.
   1. **🏗️ `package.json` generation:** For our lambda to keep small we would need to traverse the project and create a `package.json` that only has the packages that are really being used. Thankfully all the application projects are baked with `generate-package-json-webpack-plugin`, this plugin does exaclty what we have described and creates the `package.json`.
   2. **📌 Ensuring pinned package versions:** We need to make sure that we have the same packaged versions as the ones described in the root `package-lock.json`. To achieve this, we would need to run `npm ci` for those built applications, but notice that the `ci` command tell us that **"The project must have an existing package-lock.json"** ([refer to the documentation](https://docs.npmjs.com/cli/v8/commands/npm-ci)). So we just copy the root `package-lock.json` to the project dist folder and run `npm ci`. This would ensure that we have evrything for our lambda to run.
3. Now we must deploy those built projects. We already know who they are because they have a name, for example `functions-example-http`. But this is the Nx name, and in CDK we have different names. For this same project, the name in the CDK stack is `projectName-dev-ExampleHTTPStack`. The way it works is:
   1. We first need to ensure that every application project (lets say example-project) has a infra stack at `functions/example-project/infra/*.stack.ts`.
   2. Secondly, we need to ensure that every stack id in the CDK would be the project stack class name with the `prefix` function applied. So if the project stack class name is ExampleProjectStack, we would have the following in the main.cdk: `new ExampleProjectStack(app, prefix('ExampleProjectStack'), { env });`.
   3. Now that those rules are followed, we just get the class name, apply the `prefix` function and append it to a file called `.cdk-deploy-registered`. From now on, we can run the CDK Workflow and deploy the stacks. It would get the build assets and deploy in the cloud.
