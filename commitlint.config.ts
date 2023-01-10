import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
	/*
	 * Resolve and load @commitlint/config-conventional from node_modules.
	 * Referenced packages must be installed
	 */
	extends: ['@commitlint/config-conventional'],
	/*
	 * Any rules defined here will override rules from @commitlint/config-conventional
	 */
	rules: {
		'subject-case': [2, 'always', ['sentence-case', 'start-case', 'pascal-case', 'upper-case', 'lower-case']],
		'type-enum': [
			2,
			'always',
			['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'sample'],
		],
		'scope-case': [2, 'always', ['lower-case', 'kebab-case']],
		'scope-enum': [2, 'always', ['nx', 'infra', 'users', 'shared-interfaces', 'database', 'pets']],
		'body-max-line-length': [0, 'always', 100],
		'header-max-length': [0, 'always', 100],
	},
	/*
	 * Whether commitlint uses the default ignore rules.
	 */
	defaultIgnores: true,
	/*
	 * Custom URL to show upon failure
	 */
	helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};

module.exports = Configuration;
