import { StageStack } from '@shared/infra';
import { Fn, StackProps } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import { Construct } from 'constructs';
import * as constants from '../config/constants';

export class ApiGatewayDeploymentStack extends StageStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		/**
		 * Public API deployment
		 */

		const publicApi = apigateway.RestApi.fromRestApiAttributes(this, 'PublicApi', {
			restApiId: Fn.importValue(this.addPrefix(constants.PUBLIC_API_ID)),
			rootResourceId: Fn.importValue(this.addPrefix(constants.PUBLIC_API_ROOT_RESOURCE_ID)),
		});

		const publicApiDeployment = new apigateway.Deployment(this, 'PublicApiDeployment', {
			api: publicApi,
		});

		const publicApiStage = new apigateway.Stage(this, 'PublicApiDeploymentStage', {
			deployment: publicApiDeployment,
			stageName: this.stage,
		});

		publicApi.deploymentStage = publicApiStage;

		publicApi.node.addDependency(publicApiStage);

		// /**
		//  * Private API deployment
		//  */

		// const privateApi = apigateway.RestApi.fromRestApiAttributes(this, 'PrivateApi', {
		// 	restApiId: Fn.importValue(this.addPrefix(constants.PRIVATE_API_ID)),
		// 	rootResourceId: Fn.importValue(this.addPrefix(constants.PRIVATE_API_ROOT_RESOURCE_ID)),
		// });

		// const privateApiDeployment = new apigateway.Deployment(this, 'PrivateApiDeployment', {
		// 	api: privateApi,
		// });

		// const privateApiStage = new apigateway.Stage(this, 'PrivateApiDeploymentStage', {
		// 	deployment: privateApiDeployment,
		// 	stageName: this.stage,
		// });

		// privateApi.deploymentStage = privateApiStage;

		// privateApi.node.addDependency(privateApiStage);
	}
}
