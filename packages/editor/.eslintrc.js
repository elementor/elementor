module.exports = {
	root: true,
	extends: [
		'plugin:react/recommended',
		'plugin:@wordpress/eslint-plugin/recommended-with-formatting',

		// Typescript rules should be last in order to override default eslint rules the conflicts with typescript.
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended',
	],
	plugins: [
		'react',
		'@typescript-eslint',
	],
	parser: '@typescript-eslint/parser',
	rules: {
		'computed-property-spacing': [ 'error', 'always' ],
		'comma-dangle': [ 'error', 'always-multiline' ],
		'dot-notation': 'error',
		'no-shadow': 'error',
		'no-lonely-if': 'error',
		'no-mixed-operators': 'error',
		'no-nested-ternary': 'error',
		'no-cond-assign': 'error',
		indent: [ 'error', 'tab', {
			SwitchCase: 1,
			// Prevent conflicts with `react/jsx-indent-props`.
			ignoredNodes: [
				'JSXAttribute',
				'JSXSpreadAttribute',
			],
		} ],
		'padded-blocks': [ 'error', 'never' ],
		'one-var-declaration-per-line': 'error',
		'array-bracket-spacing': [ 'error', 'always' ],
		'no-else-return': 'error',
		'arrow-parens': [ 'error', 'always' ],
		'brace-style': [ 'error', '1tbs' ],
		'jsx-quotes': 'error',
		'no-bitwise': [ 'error', { allow: [ '^' ] } ],
		'no-caller': 'error',
		'no-eval': 'error',
		yoda: [ 'error', 'always', {
			onlyEquality: true,
		} ],
		'capitalized-comments': [
			'error',
			'always',
			{
				ignoreConsecutiveComments: true,
			},
		],
		'spaced-comment': [ 'error', 'always', { markers: [ '!' ] } ],
	},
};
