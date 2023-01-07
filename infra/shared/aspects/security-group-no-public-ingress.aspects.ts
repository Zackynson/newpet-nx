import { Annotations, IAspect, Stack, Tokenization } from 'aws-cdk-lib';
import { CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { IConstruct } from 'constructs';

/**
 * Checks public ingress rule of security groups.
 *
 * For more information about Aspects refer to: https://docs.aws.amazon.com/cdk/v2/guide/aspects.html
 */
export class SecurityGroupNoPublicIngressAspect implements IAspect {
	public visit(node: IConstruct) {
		if (node instanceof CfnSecurityGroup) {
			this.checkRules(node, Stack.of(node).resolve(node.securityGroupIngress));
		}
	}

	private checkRules(node: IConstruct, rules: Array<CfnSecurityGroup.IngressProperty>) {
		if (rules) {
			for (const rule of rules.values()) {
				if (!Tokenization.isResolvable(rule) && (rule.cidrIp == '0.0.0.0/0' || rule.cidrIp == '::/0')) {
					Annotations.of(node).addError('Security Group allows ingress from public internet.');
				}
			}
		}
	}
}
