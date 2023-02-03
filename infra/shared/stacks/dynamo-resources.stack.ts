import { StageStack } from '@shared/infra';
import { StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';

export class DynamoResourcesStack extends StageStack {
	constructor(scope: Construct, id: string, regions: string[], props?: StackProps) {
		super(scope, id, props);

		regions = regions.filter((region) => this.region !== region);
	}
}
