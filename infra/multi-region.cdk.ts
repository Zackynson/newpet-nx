/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { App } from 'aws-cdk-lib';

import { addPrefix, Config, isValidRegion } from '@shared/infra';

/** Resources */

import { AuthStack } from '../apps/auth/infra/auth.stack';
import { PetsStack } from '../apps/pets/infra/pets.stack';
import { UsersStack } from '../apps/users/infra/users.stack';
import { ApiGatewayDeploymentStack } from './shared/stacks/api-gateway-deployment.stack';
import { ApiGatewayResourcesStack } from './shared/stacks/api-gateway-resources.stack';
import { EventBridgeBusResourcesStack } from './shared/stacks/event-bridge-bus-resources.stack';
import { EventBridgeIntegrationsStack } from './shared/stacks/event-bridge-integrations.stack';
import { SecurityGroupResourcesStack } from './shared/stacks/security-group-resources.stack';
import { SqsResourcesStack } from './shared/stacks/sqs-resources.stack';
export interface MultiRegionConfig {
	stage: string;
	project: string;
}

export class MultiRegion {
	private app: App;
	private config: Config;
	/** Region that the resources will be deployed */
	private region: string;

	constructor(app: App, config: Config, region: string) {
		if (!isValidRegion(region)) {
			throw new Error('Invalid Region: ' + region);
		}

		this.app = app;
		this.config = config;
		this.region = region;

		this.bootstrap();
	}

	/**
	 * Method to prefix stack name with the project name and stage.
	 */
	prefix(name: TemplateStringsArray) {
		return addPrefix({
			project: this.config.project,
			stage: this.config.stage,
			region: this.region,
			name,
		});
	}

	/**
	 * Method to bootstrap the infrastructure with the resources.
	 */
	private bootstrap() {
		/** env prop that is passed to all Stacks. */
		const env = { account: this.config.account, region: this.region };

		/**
		 * Shared Stacks
		 *
		 * Here you might define stacks that define resources
		 * that can be shared across other shared/app stacks.
		 */
		const securityGroupResourcesStack = new SecurityGroupResourcesStack(this.app, this.prefix`SecurityGroupResourcesStack`, {
			env,
		});

		const sqsResourcesStack = new SqsResourcesStack(this.app, this.prefix`SqsResourcesStack`, { env });

		const eventBridgeBusResourcesStack = new EventBridgeBusResourcesStack(
			this.app,
			this.prefix`EventBridgeBusResourcesStack`,
			{
				env,
			}
		);

		const eventBridgeIntegrationsStack = new EventBridgeIntegrationsStack(
			this.app,
			this.prefix`EventBridgeIntegrationsStack`,
			{ env }
		);

		eventBridgeIntegrationsStack.addDependency(
			eventBridgeBusResourcesStack,
			'We need to create SQS Queues to use them in EventBridge integrations.'
		);

		eventBridgeIntegrationsStack.addDependency(
			sqsResourcesStack,
			'We need to create SQS Queues to use them in EventBridge integrations.'
		);
		const apiGatewayResourcesStack = new ApiGatewayResourcesStack(this.app, this.prefix`ApiGatewayResourcesStack`, { env });
		new ApiGatewayDeploymentStack(this.app, this.prefix`ApiGatewayDeploymentStack`, { env }).addDependency(
			apiGatewayResourcesStack,
			'We need to create APIs before creating any deployment in them.'
		);

		/**
		 * App Stacks
		 *
		 * Here you might define stacks that define the applications resources.
		 * Each application should have its own Stack so it can be deployed as
		 * a single unit.
		 */
		const usersStack = new UsersStack(this.app, this.prefix`UsersStack`, { env });
		const petsStack = new PetsStack(this.app, this.prefix`PetsStack`, { env });
		const authStack = new AuthStack(this.app, this.prefix`AuthStack`, { env });

		// All apps
		const apps = [usersStack, petsStack, authStack];

		// All dependencies that those apps have
		const appsDependencies = [securityGroupResourcesStack, apiGatewayResourcesStack];

		// Apply the dependencies to the apps
		for (const app of apps) {
			for (const dep of appsDependencies) {
				app.addDependency(dep);
			}
		}
	}
}
