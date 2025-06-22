module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@elementor/editor',
		'@typescript-eslint',
		'@tanstack/query',
		'simple-import-sort',
		'unicorn',
		'react-compiler',
	],
	extends: [
		'plugin:@wordpress/eslint-plugin/recommended',
		'plugin:@typescript-eslint/strict',
		'plugin:@tanstack/eslint-plugin-query/recommended',
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
	reportUnusedDisableDirectives: true,
	rules: {
		// Don't allow relative import from package to package.
		'import/no-relative-packages': 'error',
		'no-restricted-syntax': [
			'error',
			{
				// \u002F - forward slash
				selector: 'ImportDeclaration[source.value=/^@elementor\\u002F.+\\u002F/]',
				message:
					'Path import of Elementor dependencies is not allowed, please use the package root (e.g: use "@elementor/locations" instead of "@elementor/locations/src/index.ts").',
			},
			{
				selector: 'TSEnumDeclaration',
				message: "Don't use enums. Prefer unions or constants.",
			},
		],

		// Prevent circular dependencies (if the lint is slow, consider removing it).
		'import/no-cycle': 'error',

		// Some file need `require` to work.
		'@typescript-eslint/no-require-imports': 'off',

		// This rule interferes with React rules of hooks when using our "private" methods convention
		// (e.g. `__useHook()` instead of `useHook()`).
		'@wordpress/no-unused-vars-before-return': 'off',

		// This is set to `warn` by WordPress, but we want to enforce it.
		'react-hooks/exhaustive-deps': 'error',

		'react-compiler/react-compiler': 'error',

		// Styling rules:
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
			},
		],

		'import/no-restricted-paths': [
			'error',
			{
				zones: [
					{
						target: './packages/core',
						from: [ './packages/pro', './packages/tools' ],
						message: 'Core cannot import from Pro or Tools.',
					},

					{
						target: './packages/pro',
						from: './packages/tools',
						message: 'Pro cannot import from Tools.',
					},

					{
						target: './packages/libs',
						from: [ './packages/core', './packages/pro', './packages/tools' ],
						message: 'Libraries can only import other libraries.',
					},
					{
						target: './packages/tools',
						from: [ './packages/*' ],
						message: 'Tools cannot import from Core, Pro, Libs or Tools.',
					},
				],
			},
		],

		// Internal rules.
		'@elementor/editor/no-react-namespace': 'error',
	},
	overrides: [
		{
			// Core Packages.
			files: [ '**/packages/@(core|libs)/**/*.[tj]s?(x)' ],
			rules: {
				'@wordpress/i18n-text-domain': [ 'error', { allowedTextDomain: 'elementor' } ],
			},
		},
		{
			// Pro Packages.
			files: [ '**/packages/pro/**/*.[tj]s?(x)' ],
			rules: {
				'@wordpress/i18n-text-domain': [ 'error', { allowedTextDomain: 'elementor-pro' } ],
			},
		},
		{
			// Test files.
			files: [ '**/@(__mocks__|__tests__|tests|test)/**/*.[tj]s?(x)' ],
			extends: [ 'plugin:jest-dom/recommended', 'plugin:testing-library/react' ],
			rules: {
				// In tests, we are importing dev dependencies of the root directory, so we need to disable this rule.
				'import/no-extraneous-dependencies': 'off',
				'import/no-unresolved': [
					'error',
					{
						ignore: [
							'^test-utils$', // In tests, it should ignore the test-utils helper.
						],
					},
				],

				'testing-library/no-test-id-queries': 'error',

				// Add support for `@jest-environment` in JSDocs.
				'jsdoc/check-tag-names': [
					'error',
					{
						definedTags: [ 'jest-environment' ],
					},
				],
			},
		},
		{
			// Production files.
			files: [ '**/src/*.[tj]s?(x)' ],
			rules: {
				// Don't allow importing dev dependencies in production files.
				'import/no-extraneous-dependencies': [
					'error',
					{
						devDependencies: false,
					},
				],
			},
		},
	],
};

function getImportSortGroups() {
	// Customized defaults from `eslint-plugin-simple-import-sort`:
	// https://github.com/lydell/eslint-plugin-simple-import-sort/blob/66d84f742/src/imports.js#L5-L19
	return [
		// Side effect imports.
		[ '^\\u0000' ],

		// Node.js builtins prefixed with `node:`.
		[ '^node:' ],

		[
			// React imports.
			'^react$',
			'^react-dom$',
			'^react-dom\\/',

			// Packages that don't start with @ ('fs', 'path', etc.)
			'^\\w',

			// Elementor imports.
			'^@elementor\\/',

			// Other Packages.
			// Things that start with a letter (or digit or underscore), or `@` followed by a letter.
			'^@?\\w',
		],

		// Absolute imports and other imports such as Vue-style `@/foo`.
		// Anything not matched in another group.
		[ '^' ],

		// Relative imports.
		// Anything that starts with a dot.
		[ '^\\.' ],
	];
}
