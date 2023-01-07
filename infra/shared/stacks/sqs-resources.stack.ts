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
	// Transactions
	// private transactionsCreationDLQ: sqs.Queue;
	// private transactionsCreationEventBridgeRuleDLQ: sqs.Queue;
	// private transactionsCreationQueue: sqs.Queue;
	// private stepFinishEventBridgeRuleDLQ: sqs.Queue;
	// private transactionCreatedNotifyEventBridgeRuleDLQ: sqs.Queue;
	// private transactionFinishedNotifyEventBridgeRuleDLQ: sqs.Queue;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// /**
		//  * TransactionCreate Event Bridge Rule DLQ
		//  */
		// this.transactionsCreationEventBridgeRuleDLQ = new sqs.Queue(this, 'TransactionsCreationEventBridgeRuleDLQ', {
		// 	queueName: this.addPrefix`transactions-creation-event-bridge-rule-deadletter`,
		// });

		// this.transactionsCreationEventBridgeRuleDLQ.grantSendMessages(new iam.AnyPrincipal());
		// this.transactionsCreationEventBridgeRuleDLQ.grantConsumeMessages(new iam.AnyPrincipal());

		// /**
		//  * DLQ of the Queue that receives the Transactions
		//  */
		// this.transactionsCreationDLQ = new sqs.Queue(this, 'TransactionsCreationDLQ', {
		// 	contentBasedDeduplication: true,
		// 	queueName: this.addPrefix`transactions-creation-deadletter.fifo`,
		// 	fifo: true,
		// });

		// /**
		//  * Queue that receives the Transactions
		//  */
		// this.transactionsCreationQueue = new sqs.Queue(this, 'TransactionsCreationQueue', {
		// 	contentBasedDeduplication: true,
		// 	fifo: true,
		// 	queueName: this.addPrefix`transactions-creation.fifo`,
		// 	receiveMessageWaitTime: Duration.seconds(10),
		// 	visibilityTimeout: Duration.seconds(60),
		// 	deadLetterQueue: {
		// 		maxReceiveCount: 2,
		// 		queue: this.transactionsCreationDLQ,
		// 	},
		// });

		// // TODO: change to allow only send from this account and not any other
		// this.transactionsCreationQueue.grantSendMessages(new iam.AnyPrincipal());
		// this.transactionsCreationQueue.grantConsumeMessages(new iam.AnyPrincipal());

		// /**
		//  * DLQ of event bridge rule that filters step finish event
		//  */
		// this.stepFinishEventBridgeRuleDLQ = new sqs.Queue(this, 'StepFinishEventBridgeRuleDLQ', {
		// 	queueName: this.addPrefix`step-finish-event-bridge-rule-deadletter`,
		// });

		// this.stepFinishEventBridgeRuleDLQ.grantSendMessages(new iam.AnyPrincipal());
		// this.stepFinishEventBridgeRuleDLQ.grantConsumeMessages(new iam.AnyPrincipal());

		// /**
		//  * DLQ of event bridge rule that filters transaction created event for notifying side projects
		//  */
		// this.transactionCreatedNotifyEventBridgeRuleDLQ = new sqs.Queue(this, 'TransactionCreatedNotifyEventBridgeRuleDLQ', {
		// 	queueName: this.addPrefix`transaction-created-notify-event-bridge-rule-deadletter`,
		// });

		// this.transactionCreatedNotifyEventBridgeRuleDLQ.grantSendMessages(new iam.AnyPrincipal());
		// this.transactionCreatedNotifyEventBridgeRuleDLQ.grantConsumeMessages(new iam.AnyPrincipal());

		// /**
		//  * DLQ of event bridge rule that filters transaction finished event for notifying side projects
		//  */
		// this.transactionFinishedNotifyEventBridgeRuleDLQ = new sqs.Queue(this, 'TransactionFinishedNotifyEventBridgeRuleDLQ', {
		// 	queueName: this.addPrefix`transaction-finished-notify-event-bridge-rule-deadletter`,
		// });

		// this.transactionFinishedNotifyEventBridgeRuleDLQ.grantSendMessages(new iam.AnyPrincipal());
		// this.transactionFinishedNotifyEventBridgeRuleDLQ.grantConsumeMessages(new iam.AnyPrincipal());

		// /**
		//  * Exports
		//  */
		// new CfnOutput(this, 'TransactionsCreationQueueArn', {
		// 	value: this.transactionsCreationQueue.queueArn,
		// 	exportName: this.addPrefix`transactions-creation-queue-arn`,
		// });

		// new CfnOutput(this, 'TransactionsCreationDLQArn', {
		// 	value: this.transactionsCreationDLQ.queueArn,
		// 	exportName: this.addPrefix`transactions-creation-deadletter-queue-arn`,
		// });

		// new CfnOutput(this, 'TransactionsCreationEventBridgeRuleDLQArn', {
		// 	value: this.transactionsCreationEventBridgeRuleDLQ.queueArn,
		// 	exportName: this.addPrefix`transactions-creation-event-bridge-rule-deadletter-queue-arn`,
		// });

		// new CfnOutput(this, 'StepFinishEventBridgeRuleDLQArn', {
		// 	value: this.stepFinishEventBridgeRuleDLQ.queueArn,
		// 	exportName: this.addPrefix`step-finish-event-bridge-rule-deadletter-queue-arn`,
		// });

		// new CfnOutput(this, 'TransactionCreatedNotifyEventBridgeRuleDLQArn', {
		// 	value: this.transactionCreatedNotifyEventBridgeRuleDLQ.queueArn,
		// 	exportName: this.addPrefix`transaction-created-notify-event-bridge-rule-deadletter-queue-arn`,
		// });

		// new CfnOutput(this, 'TransactionFinishedNotifyEventBridgeRuleDLQArn', {
		// 	value: this.transactionFinishedNotifyEventBridgeRuleDLQ.queueArn,
		// 	exportName: this.addPrefix`transaction-finished-notify-event-bridge-rule-deadletter-queue-arn`,
		// });
	}
}
