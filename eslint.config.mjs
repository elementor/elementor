import { createRequire } from 'node:module';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import wordpress from '@wordpress/eslint-plugin';
import noJquery from 'eslint-plugin-no-jquery';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

const require = createRequire( import.meta.url );
const compat = new FlatCompat( {
	baseDirectory: import.meta.dirname,
	resolvePluginsRelativeTo: import.meta.dirname,
} );

const localRules = require( './eslint-local-rules.js' );

const noJqueryRules = fixupConfigRules(
	compat.extends( 'plugin:no-jquery/deprecated' ),
).reduce( ( rules, config ) => ( { ...rules, ...config.rules } ), {} );

const elementorGlobals = {
	wp: 'writable',
	window: 'writable',
	document: 'writable',
	_: 'readonly',
	jQuery: 'readonly',
	JSON: 'readonly',
	elementorFrontend: 'writable',
	require: 'writable',
	elementor: 'writable',
	DialogsManager: 'writable',
	module: 'writable',
	React: 'writable',
	PropTypes: 'writable',
	__: 'writable',
};

export default [
	{
		ignores: [
			'assets/lib/**/*.js',
			'assets/js/',
			'**/*.min.js',
			'**/node_modules/**',
			'**/vendor/**',
			'**/vendor_prefixed/**',
			'build/**',
			'tests/qunit/setup/tinymce.js',
			'/tmp/**',
			'packages/**',
			'eslint-local-rules.js',
			'.eslintrc.js',
			'scripts/create-version-change.js',
			'scripts/lint-packages-staged.js',
			'coverage-report/',
			'node_modules/',
			'.sass-cache/',
			'log/',
			'vendor/',
			'local-site/',
			'tmp/',
			'8888/',
			'8889/',
			'data/languages/',
			'tests/data',
			'http-playground/',
			'assets/css/',
			'assets/lib/swiper/css/swiper*.css',
			'*.log',
			'*.map',
			'/templates/',
			'/hello-elementor/',
			'.turbo/',
			'yarn.lock',
			'.project/',
			'.vscode/',
			'!.vscode/extensions.json',
			'.idea/',
			'Thumbs.db',
			'*.DS_Store',
			'coverage/',
			'.zimud.json',
			'.phpunit.result.cache',
			'.npmrc',
			'.cursor/',
			'!.cursor/rules/',
			'.claude/',
			'*.cache',
			'test-results/',
			'**/storageState-*.json',
			'tests/playwright/config/local.config.js',
			'playwright-report',
			'tests/playwright/blob-report',
			'**/allure-results',
			'playwright-test-results',
			'**/.env',
			'docker-output/',
			'.lighthouserc.js',
			'.grunt-config/**',
		],
	},
	...wordpress.configs[ 'recommended-with-formatting' ],
	...fixupConfigRules( compat.extends( 'plugin:import/typescript' ) ),
	{
		plugins: {
			'no-jquery': noJquery,
			'local-rules': { rules: localRules },
		},
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: elementorGlobals,
			parserOptions: {
				requireConfigFile: false,
				babelOptions: {
					plugins: [ '@babel/plugin-syntax-import-assertions' ],
					parserOpts: {
						plugins: [ 'jsx' ],
					},
				},
			},
		},
		settings: {
			'import/resolver': {
				node: {
					extensions: [ '.js', '.jsx', '.ts', '.tsx', '.json' ],
				},
			},
			jsdoc: { mode: 'typescript' },
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'off',
		},
		rules: {
			...noJqueryRules,
			'no-var': 'off',
			'wrap-iife': 'off',
			'computed-property-spacing': [ 'error', 'always' ],
			'comma-dangle': [ 'error', 'always-multiline' ],
			'no-undef': 'off',
			'no-unused-vars': [ 'error', { ignoreRestSiblings: true } ],
			'dot-notation': 'error',
			'no-shadow': 'error',
			'no-lonely-if': 'error',
			'no-mixed-operators': 'error',
			'no-nested-ternary': 'error',
			'no-cond-assign': 'error',
			indent: [ 1, 'tab', { SwitchCase: 1 } ],
			'padded-blocks': [ 'error', 'never' ],
			'one-var-declaration-per-line': 'error',
			'array-bracket-spacing': [ 'error', 'always' ],
			'no-else-return': 'error',
			'no-console': 'error',
			'arrow-parens': [ 'error', 'always' ],
			'brace-style': [ 'error', '1tbs' ],
			'jsx-quotes': 'error',
			'no-bitwise': [ 'error', { allow: [ '^' ] } ],
			'no-caller': 'error',
			'no-debugger': 'error',
			'no-eval': 'error',
			'no-restricted-syntax': [
				'error',
				{
					selector:
						'CallExpression[callee.name=/^__|_n|_x$/]:not([arguments.0.type=/^Literal|BinaryExpression$/])',
					message: 'Translate function arguments must be string literals.',
				},
				{
					selector:
						'CallExpression[callee.name=/^_n|_x$/]:not([arguments.1.type=/^Literal|BinaryExpression$/])',
					message: 'Translate function arguments must be string literals.',
				},
				{
					selector:
						'CallExpression[callee.name=_nx]:not([arguments.2.type=/^Literal|BinaryExpression$/])',
					message: 'Translate function arguments must be string literals.',
				},
			],
			'prefer-const': 'error',
			yoda: [
				'error',
				'always',
				{
					onlyEquality: true,
				},
			],
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'error',
			'react/no-deprecated': 'error',
			semi: 'warn',
			'jsdoc/check-tag-names': [
				'error',
				{ definedTags: [ 'jest-environment' ] },
			],
			'jsdoc/require-returns-description': 'off',
			'import/default': 'error',
			'import/no-unresolved': [
				2,
				{
					ignore: [
						'elementor',
						'modules',
						'@wordpress/i18n',
						'e-utils',
						'e-styles',
						'react',
					],
				},
			],
			'import/no-extraneous-dependencies': 'off',
			'@wordpress/i18n-ellipsis': 'off',
			'capitalized-comments': [
				'error',
				'always',
				{
					ignorePattern: 'webpackChunkName|webpackIgnore|jQuery',
					ignoreConsecutiveComments: true,
				},
			],
			'spaced-comment': [ 'error', 'always', { markers: [ '!' ] } ],
			'space-in-parens': 'off',
			'template-curly-spacing': 'off',
			'quote-props': 'off',
		},
	},
	{
		files: [ 'scripts/**/*.mjs' ],
		languageOptions: {
			sourceType: 'module',
			ecmaVersion: 'latest',
			globals: {
				...elementorGlobals,
				...require( 'globals' ).node,
			},
		},
		rules: {
			'no-console': 'off',
			'jsdoc/require-param': 'off',
		},
	},
	{
		files: [ '.github/scripts/**/*.js' ],
		languageOptions: {
			globals: {
				...elementorGlobals,
				...require( 'globals' ).node,
			},
		},
		rules: {
			'no-console': 'off',
		},
	},
	...tseslint.config(
		{
			files: [ '**/*.ts', '**/*.tsx' ],
			extends: [ ...tseslint.configs.recommended ],
			languageOptions: {
				parserOptions: {
					project: [ './tsconfig.json' ],
				},
			},
			rules: {
				'@typescript-eslint/await-thenable': 'error',
				'@typescript-eslint/no-var-requires': 'error',
				'@typescript-eslint/ban-ts-comment': 'error',
				'local-rules/no-react-namespace': 'error',
			},
		},
	),
	{
		files: [ 'tests/**/*.ts', 'tests/**/*.tsx' ],
		rules: {
			'local-rules/no-react-namespace': 'off',
		},
	},
	{
		...playwright.configs[ 'flat/recommended' ],
		files: [
			'tests/playwright/**/*.ts',
			'tests/elements-regression/**/*.ts',
		],
		rules: {
			...playwright.configs[ 'flat/recommended' ].rules,
			'playwright/no-networkidle': 'warn',
			'playwright/expect-expect': 'off',
			'playwright/no-conditional-in-test': 'off',
			'playwright/no-wait-for-selector': 'off',
			'playwright/prefer-locator': 'off',
			'playwright/no-wait-for-timeout': 'off',
			'playwright/prefer-web-first-assertions': 'off',
			'playwright/valid-title': 'off',
			'playwright/prefer-to-have-count': 'off',
			'playwright/no-unsafe-references': 'off',
			'playwright/no-nested-step': 'off',
			'playwright/no-conditional-expect': 'off',
			'playwright/no-wait-for-navigation': 'off',
			'playwright/valid-describe-callback': 'off',
		},
	},
];
