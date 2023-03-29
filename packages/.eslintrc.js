module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'plugin:@wordpress/eslint-plugin/recommended-with-formatting',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/typescript',
	],
	settings: {
		// Override `import/internal-regex` that is defined in `@wordpress/eslint-plugin`.
		'import/internal-regex': false,
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
		'import/no-extraneous-dependencies': [
			'error',
			{
				// Don't allow importing dev dependencies.
				devDependencies: false,
			},
		],

		// Prevent circular dependencies (if the lint is slow, consider removing it).
		'import/no-cycle': [ 'error' ],

		// Strict mode.
		'@typescript-eslint/no-non-null-assertion': [ 'error' ],
		'@typescript-eslint/no-explicit-any': [ 'error' ],

		// Unused rules.
		'@typescript-eslint/no-var-requires': [ 'off' ],

		// Disable the js no-unused-vars rule, and enable the TS version.
		'no-unused-vars': [ 'off' ],
		'@typescript-eslint/no-unused-vars': [ 'error' ],

		// Make sure there are:
		// - No more than 1 empty line between blocks.
		// - No empty lines at the beginning of the file.
		// - No empty lines at the end of the file. (By default there is line break at the end of the file.)
		'no-multiple-empty-lines': [ 'error', { max: 1, maxEOF: 0, maxBOF: 0 } ],
	},
	overrides: [
		{
			// Development files.
			files: [
				'**/tools/**/*', // Tools files.
				'./*.[tj]s?(x)', // Root level files.
				'**/@(__mocks__|__tests__|tests|test)/**/*.[tj]s?(x)', // Test files.
			],
			rules: {
				// In tests, we are importing dev dependencies of the root directory, so we need to disable this rule.
				'import/no-extraneous-dependencies': [ 'off' ],
				'import/no-unresolved': [ 'error', {
					ignore: [
						'^test-utils$', // In tests, it should ignore the test-utils helper.
					],
				} ],
			},
		},
	],
};
