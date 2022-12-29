module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'plugin:@wordpress/eslint-plugin/recommended-with-formatting',
		'plugin:@typescript-eslint/eslint-recommended',
	],
	settings: {
		'import/resolver': {
			node: {
				extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
			},
		},
	},
	rules: {
		// ignore when trying to use '@elementor/*' packages
		'import/no-unresolved': [ 'error', { ignore: [ '@elementor/.+' ] } ],

		// Don't allow relative import from package to package
		'import/no-relative-packages': [ 'error' ],
		'no-restricted-syntax': [
			'error',
			{
				selector: 'ImportDeclaration[source.value=/^@elementor\\u002F.+\\u002F/]',
				message: 'Path access on Elementor dependencies is not allowed, please access using only root level, e.g: "@elementor/locations" and not "@elementor/locations/src/index.ts".',
			},
		],

		// Disable import/named rule, TS will handle it.
		'import/named': [ 'off' ],

		// Disable the js no-unused-vars rule, and enable the ts version.
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [ 'error' ],
	},
	overrides: [
		{
			// Development files.
			files: [
				'**/@(__mocks__|__tests__|test)/**/*.[tj]s?(x)',
			],
			rules: {
				// In tests, we are importing dev dependencies of the workspace, so we need to disable this rule.
				'import/no-extraneous-dependencies': 'off',
			},
		},
	],
};
