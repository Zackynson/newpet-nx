import {
	Tree,
	formatFiles,
	installPackagesTask,
	addProjectConfiguration,
	generateFiles,
	joinPathFragments,
	getWorkspaceLayout,
	addDependenciesToPackageJson,
} from '@nrwl/devkit';
import { Schema } from './schema';
import { camelize, capitalize } from './utils';

export default async function (tree: Tree, schema: Schema) {
	interface PackageDeps {
		deps: Record<string, string>;
		devDeps: Record<string, string>;
	}

	const packagesToInstall: { [K in Schema['type']]?: PackageDeps } = {
		standalone: {
			deps: {},
			devDeps: {},
		},
		'full-http-featured': {
			deps: {
				'@vendia/serverless-express': '^4.5.4',
				'@nestjs/platform-express': '^8.0.0',
				express: '^4.18.1',
			},
			devDeps: {
				serverless: 'latest',
				'@ns3/nx-serverless': 'latest',
				'serverless-offline': 'latest',
			},
		},
	};
	const name = schema.name;
	const nameCamelCase = capitalize(camelize(schema.name));
	const { appsDir } = getWorkspaceLayout(tree);
	const appProjectRoot = joinPathFragments(appsDir, name);
	const projectName = appProjectRoot.replace(/\//g, '-');
	addProjectConfiguration(tree, projectName, { root: appProjectRoot });
	const packages = packagesToInstall[schema.type] as PackageDeps;
	addDependenciesToPackageJson(tree, packages.deps, packages.devDeps);

	generateFiles(
		tree, // the virtual file system
		joinPathFragments(__dirname, './files', schema.type), // path to the templates
		appProjectRoot, // destination path of the files
		{
			name,
			nameCamelCase,
			appsDir,
			projectName,
			tmpl: '',
		} // config object to replace variable in file templates
	);

	// if (schema.includeAssets) {
	//   const projectConfig = readProjectConfiguration(tree, appProjectRoot);
	//   projectConfig.targets.build.options.assets = [`${appsDir}/${name}/src/assets`];
	//   tree.write(joinPathFragments(appProjectRoot, 'assets/.gitkeep'), '');
	//   updateProjectConfiguration(tree, name, projectConfig);
	// }

	await formatFiles(tree);
	return () => {
		installPackagesTask(tree);
	};
}
