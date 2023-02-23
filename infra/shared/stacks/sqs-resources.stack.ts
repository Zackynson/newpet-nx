import { StageStack } from '@shared/infra';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import { Construct } from 'constructs';

export class SqsResourcesStack extends StageStack {
	// Pets
	private petsCreationDLQ: sqs.Queue;
	private petsCreationEventBridgeRuleDLQ: sqs.Queue;
	private petsCreationQueue: sqs.Queue;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		/**
		 * Pets Event Bridge Rule DLQ
		 */
		this.petsCreationEventBridgeRuleDLQ = new sqs.Queue(this, 'TransactionsCreationEventBridgeRuleDLQ', {
			queueName: this.addPrefix`transactions-creation-event-bridge-rule-deadletter`,
		});

		this.petsCreationEventBridgeRuleDLQ.grantSendMessages(new iam.AnyPrincipal());
		this.petsCreationEventBridgeRuleDLQ.grantConsumeMessages(new iam.AnyPrincipal());

		/**
		 * DLQ of the Queue that receives the pets creation messages
		 */
		this.petsCreationDLQ = new sqs.Queue(this, 'CreatePetDLQ', {
			contentBasedDeduplication: true,
			queueName: this.addPrefix`pets-creation-deadletter.fifo`,
			fifo: true,
		});

		/**
		 * Queue that receives the pets creation messages
		 */
		this.petsCreationQueue = new sqs.Queue(this, 'CreatePetQueue', {
			contentBasedDeduplication: true,
			fifo: true,
			queueName: this.addPrefix`pets-creation.fifo`,
			deadLetterQueue: {
				maxReceiveCount: 2,
				queue: this.petsCreationDLQ,
			},
		});

		// TODO: change to allow only send from this account and not any other
		this.petsCreationQueue.grantSendMessages(new iam.AnyPrincipal());
		this.petsCreationQueue.grantConsumeMessages(new iam.AnyPrincipal());

		/**
		 * Exports
		 */
		new CfnOutput(this, 'PetsCreationQueueArn', {
			value: this.petsCreationQueue.queueArn,
			exportName: this.addPrefix`pets-creation-queue-arn`,
		});

		new CfnOutput(this, 'PetsCreationDLQArn', {
			value: this.petsCreationDLQ.queueArn,
			exportName: this.addPrefix`pets-creation-deadletter-queue-arn`,
		});

		new CfnOutput(this, 'PetsCreationEventBridgeRuleDLQArn', {
			value: this.petsCreationEventBridgeRuleDLQ.queueArn,
			exportName: this.addPrefix`pets-creation-event-bridge-rule-deadletter-queue-arn`,
		});
	}
}
