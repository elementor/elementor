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
		'import/no-unresolved': [ 'error', { ignore: [ '@elementor/.+' ] } ],

		// Disable the js no-unused-vars rule, and enable the ts version.
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [ 'error' ],

		// Disable import/named rule, TS will handle it.
		'import/named': [ 'off' ],
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
