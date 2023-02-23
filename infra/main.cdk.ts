#!/usr/bin/env node
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import * as buildUtils from '@shared/infra';
import { App } from 'aws-cdk-lib';
import { MultiRegion } from './multi-region.cdk';

/**
 * The App construct doesn't require any initialization arguments, because it's the only
 * construct that can be used as a root for the construct tree.
 * You can use the App instance as a scope for defining a single instance of your stack.
 */
const app = new App();

/**
 * Project configuration.
 */
const config = buildUtils.getConfig(app); // Get the config from the CDK Context for the current stage

// const prefix = (name: TemplateStringsArray) => {
// 	return buildUtils.addPrefix({
// 		project: config.project,
// 		stage: config.stage,
// 		name,
// 	});
// };

/**
 * All the regions the stacks should be deployed to.
 * We sort it so we always have the same order of regions.
 */
const regionsToDeploy = config.regions.sort();

// /**
//  * Create resources which are not necessary to be created in each region
//  */
// new DynamoResourcesStack(app, prefix`DynamoResourcesStack`, regionsToDeploy, {
// 	env: { account: config.account, region: config.mainInfo.region },
// });

/**
 * Iterate through all regions and deploy the resources
 */
for (const region of regionsToDeploy) {
	new MultiRegion(app, config, region);
}
