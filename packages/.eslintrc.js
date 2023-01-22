module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'plugin:@wordpress/eslint-plugin/recommended-with-formatting',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:import/typescript',
	],
	settings: {
		'import/resolver': {
			typescript: {},
			node: {},
		},
	},
	rules: {
		// Don't allow relative import from package to package.
		'import/no-relative-packages': [ 'error' ],
		'no-restricted-syntax': [
			'error',
			{
				// \u002F - forward slash
				selector: 'ImportDeclaration[source.value=/^@elementor\\u002F.+\\u002F/]',
				message: 'Path import of Elementor dependencies is not allowed, please use the package root (e.g: use "@elementor/locations" instead of "@elementor/locations/src/index.ts").',
			},
		],

		// Disable the js no-unused-vars rule, and enable the TS version.
		'no-unused-vars': [ 'off' ],
		'@typescript-eslint/no-unused-vars': [ 'error' ],
	},
	overrides: [
		{
			// Development files.
			files: [
				'**/@(__mocks__|__tests__|test)/**/*.[tj]s?(x)',
			],
			rules: {
				// In tests, we are importing dev dependencies of the root directory, so we need to disable this rule.
				'import/no-extraneous-dependencies': [ 'off' ],
			},
		},
	],
};
