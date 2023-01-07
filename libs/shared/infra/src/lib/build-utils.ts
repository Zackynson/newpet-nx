import { App, Tags } from 'aws-cdk-lib';
import { Fact } from 'aws-cdk-lib/region-info';
import { Construct } from 'constructs';

export enum Stage {
	DEV = 'dev',
	BETA = 'beta',
	PROD = 'prod',
}

export interface Config {
	/** Project name  */
	project: string;
	/** Orchestrator Infra Project name  */
	orchestratorInfraProject: string;
	/** Account ID  */
	account: string;
	/** Regions that the project is present  */
	regions: string[];
	mainInfo: {
		/** Main region */
		region: string;
		/** Main VPC whithin the main region */
		vpc: string;
	};
	/** Stage with the configurations of this object */
	stage: string;
}

export interface AddPrefixOptions {
	project?: string;
	stage?: string;
	region?: string;
	name: string | TemplateStringsArray;
}

/**
 * Get the project name defined in the context.
 */
export function getProjectName(scope: App | Construct): string | undefined {
	return scope.node.tryGetContext('project');
}

/**
 * Get the Orchestrator Infra project name defined in the context.
 */
export function getOrchestratorInfraProjectName(scope: App | Construct): string | undefined {
	return scope.node.tryGetContext('orchestratorInfraProject');
}

/**
 * Get the stage passed via the STAGE env variable.
 * If no STAGE variable is present then the default value
 * is returned.
 *
 * @default dev
 */
export function getStage(): string {
	const stage = process.env['STAGE'];

	if (!stage) {
		return Stage.DEV.toString();
	}

	if (Object.values(Stage).includes(stage as Stage)) {
		return stage;
	} else {
		throw new Error(`
      Unrecognized application environment stage supplied. \n
      Please supply one of [${Stage.DEV}, ${Stage.BETA}, ${Stage.PROD}] valid variable.
    `);
	}
}

export function isValidRegion(region: string) {
	return Fact.regions.includes(region);
}

/**
 * Returns the current region defined in the AWS_REGION env variable.
 */
export function getRegion(): string {
	const region = process.env['AWS_REGION'];

	if (!region) {
		throw new Error('The AWS_REGION should be set');
	}

	if (!isValidRegion(region)) {
		throw new Error('The AWS_REGION value is invalid: ' + region);
	}

	return region;
}

/**
 * Gets the config from the context for the current stage.
 * The stage might be defined via the STAGE env variable.
 * If no variable is set, the config for the `dev`
 * stage is returned.
 */
export function getConfig(scope: App | Construct, stage?: string) {
	stage = stage || getStage();
	const context = scope.node.tryGetContext(stage);
	const project = getProjectName(scope);
	const orchestratorInfraProject = getOrchestratorInfraProjectName(scope);

	if (!project) {
		throw new Error('You must define a project name in the context file.');
	}

	if (!orchestratorInfraProject) {
		throw new Error('You must define the Orchestrator Infra project name in the context file.');
	}

	const conf: Config = {
		project: project,
		orchestratorInfraProject,
		account: context.account,
		regions: context.regions,
		mainInfo: context.mainInfo,
		stage,
	};

	return conf;
}

/**
 * Checks if the region provided is the main region for the specific stage.
 * - If no region is provided, default to the AWS_REGION env variable.
 * - If no stage is provided, it defaults to dev.
 */
export function isMainRegion(scope: App | Construct, region?: string, stage?: string) {
	const { mainInfo } = getConfig(scope, stage);

	return mainInfo.region === region;
}

export function getMainVpcId(scope: App | Construct, stage?: string): string {
	const { mainInfo } = getConfig(scope, stage);

	return mainInfo.vpc;
}

const camelize = (s: string) => s.replace(/-./g, (x: string) => x[1].toUpperCase());

/**
 * Method to prefix stack name with the project name and stage.
 */
export function addPrefix(options: AddPrefixOptions) {
	// eslint-disable-next-line prefer-const
	let { project, stage, region } = options;

	region = region ? camelize(region) : region;

	const prefix = [project, stage, region].filter((v) => v).join('-');

	return `${prefix}-${options.name}`;
}

export function applyDefaultTags(scope: App | Construct) {
	Tags.of(scope).add('Owner', 'owner@caf.io');
	Tags.of(scope).add('Team-Email', 'team@caf.io');
	Tags.of(scope).add('Project-Name', 'projectName');
}
