import { StageStack } from '@shared/infra';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import * as constants from '../config/constants';

export class ApiGatewayResourcesStack extends StageStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// We do not need to set any prop here because all
		// the defaults are enough for us.

		const publicApi = new apigateway.RestApi(this, 'PublicApi', {
			restApiName: this.addPrefix`public-api`,
			description: `newpet ${this.stage} public API`,
			endpointConfiguration: {
				types: [apigateway.EndpointType.EDGE],
			},
			parameters: {
				Project: this.getProjectName() as string,
				Stage: this.stage,
			},
			deploy: false,
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
				allowMethods: Cors.ALL_METHODS,
				allowHeaders: Cors.DEFAULT_HEADERS,
			},
			defaultMethodOptions: this.defaultMethodOptions,
		});

		/**
		 * Exports
		 */
		new CfnOutput(this, 'PublicApiId', {
			value: publicApi.restApiId,
			exportName: this.addPrefix(constants.PUBLIC_API_ID),
		});

		new CfnOutput(this, 'PublicApiIdRootResourceId', {
			value: publicApi.restApiRootResourceId,
			exportName: this.addPrefix(constants.PUBLIC_API_ROOT_RESOURCE_ID),
		});
	}

	private get defaultMethodOptions(): apigateway.MethodOptions {
		return {
			methodResponses: [
				{
					statusCode: '200',
					responseParameters: {
						'method.response.header.Access-Control-Allow-Headers': true,
						'method.response.header.Access-Control-Allow-Methods': true,
						'method.response.header.Access-Control-Allow-Origin': true,
					},
					responseModels: {
						'application/json': {
							modelId: 'Empty',
						},
					},
				},
			],
		};
	}
}
