import { StageStack } from '@shared/infra';
import { StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';

export class DynamoResourcesStack extends StageStack {
	constructor(scope: Construct, id: string, regions: string[], props?: StackProps) {
		super(scope, id, props);

		regions = regions.filter((region) => this.region !== region);

		// const authAccessKeysTable = new dynamodb.Table(this, 'AuthAccessKeysTable', {
		// 	tableName: this.addPrefix`auth-access-keys`,
		// 	billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
		// 	partitionKey: { name: 'tenantId', type: dynamodb.AttributeType.STRING },
		// 	sortKey: { name: 'id', type: dynamodb.AttributeType.STRING },
		// 	replicationRegions: regions,
		// });

		// new CfnOutput(this, 'AuthAccessKeysTableName', {
		// 	value: authAccessKeysTable.tableName,
		// 	exportName: this.addPrefix`auth-access-keys-table-name`,
		// });
	}
}
