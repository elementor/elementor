import { createRequire } from 'node:module';

import jestDom from 'eslint-plugin-jest-dom';
import reactCompiler from 'eslint-plugin-react-compiler';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import testingLibrary from 'eslint-plugin-testing-library';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import wordpress from '@wordpress/eslint-plugin';

const require = createRequire( import.meta.url );
const compat = new FlatCompat( {
	baseDirectory: import.meta.dirname,
	resolvePluginsRelativeTo: import.meta.dirname,
} );

const localRules = require( '../eslint-local-rules.js' );

function getImportSortGroups() {
	return [
		[ '^\\u0000' ],
		[ '^node:' ],
		[ '^react$', '^react-dom$', '^react-dom\\/', '^\\w', '^@elementor\\/', '^@?\\w' ],
		[ '^' ],
		[ '^\\.' ],
	];
}

export default [
	{
		ignores: [ 'node_modules/', '**/dist/', 'docs/**', '!.github/', 'scripts/**', 'tests/**', 'eslint.config.mjs' ],
	},
	...wordpress.configs.recommended,
	...tseslint.configs.strict,
	...tanstackQuery.configs[ 'flat/recommended' ],
	...fixupConfigRules( compat.extends( 'plugin:import/typescript' ) ),
	{
		plugins: {
			'simple-import-sort': simpleImportSort,
			unicorn,
			'react-compiler': reactCompiler,
			'local-rules': { rules: localRules },
		},
		settings: {
			'import/internal-regex': false,
			'import/resolver': {
				typescript: {},
				node: {},
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
		},
		rules: {
			'local-rules/no-react-namespace': 'error',
			'local-rules/no-path-imports': 'error',
			'import/no-relative-packages': 'error',
			'no-restricted-syntax': [
				'error',
				{
					selector: 'TSEnumDeclaration',
					message: "Don't use enums. Prefer unions or constants.",
				},
			],
			'import/no-cycle': 'error',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@wordpress/no-unused-vars-before-return': 'off',
			'react-hooks/exhaustive-deps': 'error',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					fixStyle: 'inline-type-imports',
				},
			],
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'typeLike',
					format: [ 'PascalCase' ],
				},
			],
			'simple-import-sort/imports': [
				'error',
				{
					groups: getImportSortGroups(),
				},
			],
			'unicorn/filename-case': [
				'error',
				{
					case: 'kebabCase',
					checkDirectories: false,
				},
			],
			'import/no-restricted-paths': [
				'error',
				{
					zones: [
						{
							target: './packages/core',
							from: [ './packages/tools' ],
							message: 'Core cannot import from Tools.',
						},
						{
							target: './packages/libs',
							from: [ './packages/core', './packages/tools' ],
							message: 'Libraries can only import other libraries.',
						},
						{
							target: './packages/tools',
							from: [ './packages/*' ],
							message: 'Tools cannot import from Core, Libs or Tools.',
						},
					],
				},
			],
		},
	},
	{
		files: [ '**/packages/@(core|libs)/**/*.[tj]s?(x)' ],
		rules: {
			'@wordpress/i18n-text-domain': [ 'error', { allowedTextDomain: 'elementor' } ],
		},
	},
	{
		files: [ '**/@(__mocks__|__tests__|tests|test)/**/*.[tj]s?(x)' ],
		plugins: {
			...jestDom.configs[ 'flat/recommended' ].plugins,
			...testingLibrary.configs[ 'flat/react' ].plugins,
		},
		rules: {
			...jestDom.configs[ 'flat/recommended' ].rules,
			...testingLibrary.configs[ 'flat/react' ].rules,
			'import/no-extraneous-dependencies': 'off',
			'import/no-unresolved': [
				'error',
				{
					ignore: [ '^test-utils$' ],
				},
			],
			'testing-library/no-test-id-queries': 'error',
			'jsdoc/check-tag-names': [
				'error',
				{
					definedTags: [ 'jest-environment' ],
				},
			],
		},
	},
	{
		files: [ '**/src/*.[tj]s?(x)' ],
		rules: {
			'import/no-extraneous-dependencies': [
				'error',
				{
					devDependencies: false,
				},
			],
		},
	},
];
