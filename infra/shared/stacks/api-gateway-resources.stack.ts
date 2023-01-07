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
		 * This policy denies private API to be invoked by something which is not in the same VPC
		 */

		// const privateApiResourcePolicy = new iam.PolicyDocument({
		// 	statements: [
		// 		new iam.PolicyStatement({
		// 			effect: iam.Effect.DENY,
		// 			principals: [new iam.AnyPrincipal()],
		// 			actions: ['execute-api:Invoke'],
		// 			resources: [`arn:aws:execute-api:${this.region}:${this.account}:*/*/*/*`],
		// 			conditions: {
		// 				StringNotEquals: {
		// 					// FIXME: This vpce-082b67e2fcfa76410 is a VPC Endpoint from the root account. That is the only
		// 					// way we could make things work. We should have better alternatives since we can't create one
		// 					// VPCE for each reagion and account
		// 					'aws:sourceVpce': [this.getMainVpcId(), 'vpce-082b67e2fcfa76410'],
		// 				},
		// 			},
		// 		}),
		// 		new iam.PolicyStatement({
		// 			effect: iam.Effect.ALLOW,
		// 			principals: [new iam.AnyPrincipal()],
		// 			actions: ['execute-api:Invoke'],
		// 			resources: [`arn:aws:execute-api:${this.region}:${this.account}:*/*/*/*`],
		// 		}),
		// 	],
		// });

		// const privateApi = new apigateway.RestApi(this, 'PrivateApi', {
		// 	restApiName: this.addPrefix`private-api`,
		// 	description: `newpet ${this.stage} private API`,
		// 	endpointConfiguration: {
		// 		types: [apigateway.EndpointType.PRIVATE],
		// 		vpcEndpoints: [
		// 			ec2.InterfaceVpcEndpoint.fromInterfaceVpcEndpointAttributes(this, 'OrchestratorVpc', {
		// 				vpcEndpointId: Fn.importValue(this.orcInfraAddPrefix(constants.ORC_INFRA_MAIN_VPC_ENDPOINT_ID)),
		// 				port: 443, // Defined at https://github.com/combateafraude/orchestrator-infra/blob/faef9ed3c88bc1f98e8959283e19cd6bce891a7c/infra/stacks/resources/vpcs/vpc-endpoint-resources.stack.ts#L41
		// 			}),
		// 		],
		// 	},
		// 	parameters: {
		// 		Project: this.getProjectName() as string,
		// 		Stage: this.stage,
		// 	},
		// 	policy: privateApiResourcePolicy,
		// 	deploy: false,
		// 	defaultCorsPreflightOptions: {
		// 		allowOrigins: Cors.ALL_ORIGINS,
		// 		allowMethods: Cors.ALL_METHODS,
		// 		allowHeaders: Cors.DEFAULT_HEADERS,
		// 	},
		// 	defaultMethodOptions: this.defaultMethodOptions,
		// });

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

		// new CfnOutput(this, 'PrivateApiId', {
		// 	value: privateApi.restApiId,
		// 	exportName: this.addPrefix(constants.PRIVATE_API_ID),
		// });

		// new CfnOutput(this, 'PrivateApiIdRootResourceId', {
		// 	value: privateApi.restApiRootResourceId,
		// 	exportName: this.addPrefix(constants.PRIVATE_API_ROOT_RESOURCE_ID),
		// });
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
