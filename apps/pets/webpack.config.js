// Helper for combining webpack config objects
const { merge } = require('webpack-merge');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const { sync: findUpSync } = require('find-up');

const basePackage = {
	name: 'pets',
	version: '0.0.1',
	main: 'main.js',
};

module.exports = (config, context) => {
	return merge(config, {
		plugins: [
			new GeneratePackageJsonPlugin(basePackage, {
				resolveContextPaths: [findUpSync('node_modules', { type: 'directory' })],
				debug: false,
			}),
		],
		output: {
			libraryTarget: 'commonjs2',
		},
	});
};
