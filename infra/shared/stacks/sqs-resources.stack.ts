// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StageStack } from '@shared/infra';
import {
	//  CfnOutput, Duration,
	StackProps,
} from 'aws-cdk-lib';
// import * as iam from 'aws-cdk-lib/aws-iam';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import { Construct } from 'constructs';

export class SqsResourcesStack extends StageStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);
	}
}
