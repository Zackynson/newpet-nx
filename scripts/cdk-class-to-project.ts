/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { addPrefix, StageStack } from '@shared/infra';
import * as estree from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import { Stack } from 'aws-cdk-lib';
import * as fs from 'fs';
import * as minimatch from 'minimatch';
import { join } from 'path';

/**
 * Finds the CDK Stack Class and returns the CDK Project associated
 * with it.It relies on the {@link addPrefix} method, so all projects
 * must use the output of the {@link addPrefix} method.
 *
 * NOTE: `STAGE` env variable is looked up to pass into the {@link addPrefix} method.
 */
export function cdkClassToProject(absoluteFilePath: string, shellOutput = false) {
	const sourceCode = fs.readFileSync(absoluteFilePath, 'utf-8');

	const ast = estree.parse(sourceCode);

	function isExportNamedDeclaration(node: TSESTree.BaseNode): node is TSESTree.ExportNamedDeclaration {
		return node.type === AST_NODE_TYPES.ExportNamedDeclaration;
	}

	const exportNamedDeclarations = ast.body.filter((node) =>
		isExportNamedDeclaration(node)
	) as TSESTree.ExportNamedDeclaration[];

	const cdkStackExportNode = exportNamedDeclarations.find(({ declaration }) => {
		if (
			declaration?.type === AST_NODE_TYPES.ClassDeclaration &&
			declaration.superClass?.type === AST_NODE_TYPES.Identifier
		) {
			// The extended class should be one of the two below
			return [StageStack.name, Stack.name].includes(declaration.superClass.name);
		}

		return false;
	});

	if (!cdkStackExportNode)
		throw Error(
			'No exported CDK Stack found. Are you sure that the class is exported and extends one of the `Stack` or `StageStack` classes?'
		);

	const stackClassDeclaration = cdkStackExportNode.declaration as TSESTree.ClassDeclarationWithOptionalName;

	const cdkProject = JSON.parse(fs.readFileSync(join(__dirname, '../cdk.json'), { encoding: 'utf-8' }));

	const stage = process.env['STAGE']!;
	const regionGlob = process.env['REGION'];
	const stackGlob = process.env['STACK_GLOB'] || '*';

	const project = cdkProject.context.project;

	let regions: string[] = cdkProject.context[stage].regions;
	if (regionGlob) {
		// Filters the region to deploy using the provided glob expression
		regions = regions.filter(minimatch.filter(regionGlob));
	}

	let stacksToDeploy = regions.map((region) =>
		addPrefix({
			name: stackClassDeclaration.id!.name,
			stage,
			project,
			region,
		})
	);

	stacksToDeploy = stacksToDeploy.filter(minimatch.filter(stackGlob));

	if (shellOutput) {
		// Converts an array of strings into one string with all
		// items sepparated by the end-of-line
		return stacksToDeploy.reduce((p, c) => p + '\n' + c, '');
	}

	return stacksToDeploy;
}
