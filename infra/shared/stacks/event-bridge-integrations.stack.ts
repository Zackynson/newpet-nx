import { StageStack } from '@shared/infra';
import { Construct } from 'constructs';

import { Fn, StackProps } from 'aws-cdk-lib';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import { enums } from '@shared/config';
import { CUSTOM_EVENT_BUS_ARN } from '../config/constants';

export class EventBridgeIntegrationsStack extends StageStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		const { EventBridgeDetailTypes } = enums;
		super(scope, id, props);

		const mainEventBus = EventBus.fromEventBusArn(this, 'NewpetEventBus', Fn.importValue(CUSTOM_EVENT_BUS_ARN));

		const petCreationQueue = sqs.Queue.fromQueueAttributes(this, 'PetCreationQueue', {
			queueArn: Fn.importValue(this.addPrefix`pets-creation-queue-arn`),
			fifo: true,
		});

		const petCreationEventBridgeDLQ = sqs.Queue.fromQueueAttributes(this, 'PetCreationEventBridgeDLQ', {
			queueArn: Fn.importValue(this.addPrefix`pets-creation-event-bridge-rule-deadletter-queue-arn`),
		});

		new Rule(this, 'PetCreatedRule', {
			eventBus: mainEventBus,
			ruleName: 'PetCreated',
			eventPattern: {
				detailType: [EventBridgeDetailTypes.PET_CREATED],
			},
			targets: [
				new SqsQueue(petCreationQueue, {
					messageGroupId: 'pets',
					deadLetterQueue: petCreationEventBridgeDLQ,
				}),
			],
		});
	}
}
