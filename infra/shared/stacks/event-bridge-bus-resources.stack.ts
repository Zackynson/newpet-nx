import { StageStack } from '@shared/infra';
import { Construct } from 'constructs';

import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { CUSTOM_EVENT_BUS_ARN } from '../config/constants';

export class EventBridgeBusResourcesStack extends StageStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const bus = new EventBus(this, id, {
			eventBusName: 'NewpetCustomEventBus',
		});

		bus.archive('NewpetCustomEventBusArchive', {
			archiveName: 'NewpetCustomEventBusArchive',
			description: 'NewpetCustomEventBus Archive',
			eventPattern: {
				account: [Stack.of(this).account],
			},
			retention: Duration.days(365),
		});

		new CfnOutput(this, CUSTOM_EVENT_BUS_ARN, {
			exportName: CUSTOM_EVENT_BUS_ARN,
			value: bus.eventBusArn,
		});
	}
}
