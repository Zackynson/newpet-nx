import { StageStack } from '@shared/infra';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { Construct } from 'constructs';

import { LAMBDA_ALLOW_FULL_EGRESS_SD_ID } from '../config/constants';

export class SecurityGroupResourcesStack extends StageStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const lambdasSecurityGroupAllowFullEgress = new ec2.SecurityGroup(this, 'LambdasSecurityGroupAllowFullEgress', {
			securityGroupName: this.addPrefix`lambdas-sg-allow-full-egress`,
			allowAllOutbound: true,
			description: this.addPrefix`lambdas-sg-allow-full-egress`,
			vpc: this.getMainVpc(),
		});

		new CfnOutput(this, 'LambdasSecurityGroupAllowFullEgressOutput', {
			value: lambdasSecurityGroupAllowFullEgress.securityGroupId,
			exportName: this.addPrefix(LAMBDA_ALLOW_FULL_EGRESS_SD_ID),
		});
	}
}
