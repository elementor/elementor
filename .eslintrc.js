module.exports = {
	extends: [
		'plugin:react/recommended',
		'plugin:no-jquery/deprecated',
		'plugin:@wordpress/eslint-plugin/recommended-with-formatting',
		'plugin:@elementor/editor/recommended',
		'plugin:import/typescript',
	],
	plugins: [
		'babel',
		'react',
		'@elementor/editor',
		'no-jquery',
		'@typescript-eslint',
	],
	parser: '@typescript-eslint/parser',
	globals: {
		wp: true,
		window: true,
		document: true,
		_: false,
		jQuery: false,
		JSON: false,
		elementorFrontend: true,
		require: true,
		elementor: true,
		DialogsManager: true,
		module: true,
		React: true,
		PropTypes: true,
		__: true,
	},
	parserOptions: {
		ecmaVersion: 2017,
		requireConfigFile: false,
		sourceType: 'module',
		babelOptions: {
			plugins: [
				'@babel/plugin-syntax-import-assertions',
			],
			parserOpts: {
				plugins: [ 'jsx' ],
			},
		},
	},
	overrides: [
		{
			files: [ '*.ts', '*.tsx' ],
			extends: [
				'plugin:@typescript-eslint/recommended',
			],
			rules: {
				'@typescript-eslint/await-thenable': 'error',
				'@typescript-eslint/no-var-requires': 'error',
				'@typescript-eslint/ban-ts-comment': 'error',
			},
			parserOptions: {
				project: [ './tsconfig.json' ],
			},
		},
	],
	rules: {
		// Custom canceled rules
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
		// End of custom canceled rules
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
				selector: 'CallExpression[callee.name=/^__|_n|_x$/]:not([arguments.0.type=/^Literal|BinaryExpression$/])',
				message: 'Translate function arguments must be string literals.',
			},
			{
				selector: 'CallExpression[callee.name=/^_n|_x$/]:not([arguments.1.type=/^Literal|BinaryExpression$/])',
				message: 'Translate function arguments must be string literals.',
			},
			{
				selector: 'CallExpression[callee.name=_nx]:not([arguments.2.type=/^Literal|BinaryExpression$/])',
				message: 'Translate function arguments must be string literals.',
			},
		],
		'prefer-const': 'error',
		yoda: [ 'error', 'always', {
			onlyEquality: true,
		} ],
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'error',
		'react/no-deprecated': 'error',
		'babel/semi': 1,
		'jsdoc/check-tag-names': [ 'error', { definedTags: [ 'jest-environment' ] } ],
		'jsdoc/require-returns-description': 'off', // We prefer self-explanatory method names
		'import/default': 'error',
		'import/no-unresolved': [ 2, { ignore: [ 'elementor', 'modules', '@wordpress/i18n', 'e-utils', 'e-styles', 'react' ] } ],
		'import/no-extraneous-dependencies': 'off',
		'@wordpress/i18n-ellipsis': 'off', // We don't use the ellipsis char because everything is already translated with regular '...'
		'capitalized-comments': [
			'error',
			'always',
			{
				ignorePattern: 'webpackChunkName|webpackIgnore|jQuery',
				ignoreConsecutiveComments: true,
			},
		],
		'spaced-comment': [ 'error', 'always', { markers: [ '!' ] } ],
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: [ '.js', '.jsx', '.ts', '.tsx', '.json' ],
			},
		},
		jsdoc: { mode: 'typescript' },
	},
};
