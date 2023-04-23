module.exports = {
	extends: [
		'plugin:react/recommended',
		'plugin:no-jquery/deprecated',
		'plugin:@wordpress/eslint-plugin/recommended-with-formatting',
		'plugin:@elementor/editor/recommended',
	],
	plugins: [
		'babel',
		'react',
		'@elementor/editor',
		'no-jquery',
	],
	parser: '@babel/eslint-parser',
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
	rules: {
		// Custom canceled rules
		'no-var': 'off',
		'wrap-iife': 'off',
		'computed-property-spacing': [ 'error', 'always' ],
		'comma-dangle': [ 'error', 'always-multiline' ],
		'no-undef': 'off',
		'no-unused-vars': [ 'warn', { ignoreRestSiblings: true } ],
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
		'no-console': 'warn',
		// End of custom canceled rules
		'arrow-parens': [ 'error', 'always' ],
		'brace-style': [ 'error', '1tbs' ],
		'jsx-quotes': 'error',
		'no-bitwise': [ 'error', { allow: [ '^' ] } ],
		'no-caller': 'error',
		'no-debugger': 'warn',
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
		'prefer-const': 'warn',
		yoda: [ 'error', 'always', {
			onlyEquality: true,
		} ],
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'error',
		'babel/semi': 1,
		'jsdoc/check-tag-names': [ 'error', { definedTags: [ 'jest-environment' ] } ],
		'jsdoc/require-returns-description': 'off', // We prefer self-explanatory method names
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
		jsdoc: {
			mode: 'typescript',
		},
	},
};
