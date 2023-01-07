import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as buildUtils from './build-utils';

/**
 * Stack class augmented with some methods for introspection
 * about the stage and to avoid code duplication.
 *
 * All extra methods are also exported from @shared/infra
 * lib. Those methods are: `getProjectName`, `getStage` and `getConfig`.
 */
export class StageStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		this.applyDefaultTags(this);
	}

	protected getProjectName(): string | undefined {
		return buildUtils.getProjectName(this);
	}

	protected get stage(): buildUtils.Stage {
		return buildUtils.getStage() as buildUtils.Stage;
	}

	protected getConfig() {
		return buildUtils.getConfig(this);
	}

	/**
	 * Returns the ID of the most used VPC in the projects.
	 *
	 * WARNING: Your project might need a diferent VPC. Always make sure that the correct one
	 * is set in the CDK Context.
	 * NOTE: you SHOULD NOT create a similar method for every VPC.
	 */
	protected getMainVpcId(): string {
		return buildUtils.getMainVpcId(this, this.stage);
	}

	/**
	 * Returns the most used VPC in the projects.
	 *
	 * WARNING: Your project might need a diferent VPC. Always make sure that the correct one
	 * is set in the CDK Context.
	 * NOTE: you SHOULD NOT create a similar method for every VPC.
	 */
	protected getMainVpc(): ec2.IVpc {
		return ec2.Vpc.fromLookup(this, 'NewpetMainVpc', {
			vpcId: this.getMainVpcId(),
		});
	}

	protected addPrefix(name: string | TemplateStringsArray) {
		return buildUtils.addPrefix({
			project: this.getProjectName(),
			stage: this.stage,
			name,
		});
	}

	/**
	 * Add the Orchestrator Infra project prefix. This is useful if you want to
	 * import a resource from that project.
	 */
	protected orcInfraAddPrefix(name: string | TemplateStringsArray) {
		return buildUtils.addPrefix({
			project: buildUtils.getOrchestratorInfraProjectName(this),
			stage: this.stage,
			region: this.region,
			name,
		});
	}

	protected isMainRegion(region?: string, stage?: string) {
		return buildUtils.isMainRegion(this, region ?? this.region, stage);
	}

	protected applyDefaultTags(scope: App | Construct) {
		return buildUtils.applyDefaultTags(scope);
	}
}
