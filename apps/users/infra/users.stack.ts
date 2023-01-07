import { constants } from '@infra';
import { isValidStackId, StageStack } from '@shared/infra';
import { Duration, Fn, StackProps } from 'aws-cdk-lib';

import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import * as path from 'path';

export class UsersStack extends StageStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		if (!isValidStackId(id, UsersStack.name)) {
			throw new Error('Invalid id for stack ' + UsersStack.name);
		}

		if (!this.bundlingRequired) {
			// We must skip undesired stacks to be able to deploy specific stacks.
			// Refer to: https://github.com/aws/aws-cdk/issues/6743
			console.info('Skipping ' + this.stackName);
			return;
		}

		const securityGroupAllowFullEgress = ec2.SecurityGroup.fromSecurityGroupId(
			this,
			'LambdasAllowFullEgress',
			Fn.importValue(this.addPrefix(constants.LAMBDA_ALLOW_FULL_EGRESS_SD_ID))
		);

		const mongoURLSecret = sm.Secret.fromSecretNameV2(this, 'MongoURLSecret', 'dev/newpet/mongouri');

		const lambdaResource = new lambda.Function(this, 'UsersFn', {
			// NOTE: If you change the runtime, please be aware that you might change the
			// tsconfig.app.json target and lib properties. For the correct mapping
			// refer to https://github.com/microsoft/TypeScript/wiki/Node-Target-Mapping.
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'main.handler',
			functionName: this.addPrefix`users`,
			code: lambda.Code.fromAsset(path.join(__dirname, '../../../dist/apps/users')),
			// NOTE: You should choose the memory size considering the speed you need for
			// your application but also thinking about the costs.
			memorySize: 256,
			timeout: Duration.seconds(30),
			environment: {
				STAGE: this.stage,
				PROJECT: this.getProjectName() as string,
				MONGO_URI: mongoURLSecret.secretValue.unsafeUnwrap(),
			},
			securityGroups: [securityGroupAllowFullEgress],
			// vpc: this.getMainVpc(),
		});

		/**
		 * Permissions
		 */

		const vpcPolicy = new iam.PolicyStatement({
			actions: ['sts:AssumeRole', 'lambda:InvokeFunction'],
			resources: ['arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole', '*'],
		});

		const dynamoPolicy = new iam.PolicyStatement({
			effect: iam.Effect.ALLOW,
			actions: ['dynamodb:*'],
			resources: ['*'],
		});

		const s3Policy = new iam.PolicyStatement({
			effect: iam.Effect.ALLOW,
			actions: ['s3:*'],
			resources: ['*'],
		});

		lambdaResource.role?.attachInlinePolicy(
			new iam.Policy(this, 'UsersPolicys', {
				statements: [vpcPolicy, dynamoPolicy, s3Policy],
			})
		);

		lambdaResource.grantInvoke({ grantPrincipal: new iam.ServicePrincipal('apigateway.amazonaws.com') });

		/**
		 * Triggers
		 */

		const publicApi = apigateway.RestApi.fromRestApiAttributes(this, 'PublicApi', {
			restApiId: Fn.importValue(this.addPrefix(constants.PUBLIC_API_ID)),
			rootResourceId: Fn.importValue(this.addPrefix(constants.PUBLIC_API_ROOT_RESOURCE_ID)),
		});

		const publicTransactionsResource = publicApi.root.addResource('users');

		const allowedMethods = ['GET'];

		for (const method of allowedMethods) {
			publicTransactionsResource.addMethod(method, new apigateway.LambdaIntegration(lambdaResource));
		}
	}
}
