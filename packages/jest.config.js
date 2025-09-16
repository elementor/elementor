module.exports = {
	verbose: true,
	rootDir: __dirname,
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest',
	},
	moduleNameMapper: {
		'^@elementor/(?!ui|icons|design-tokens)(.*)$': [
			'<rootDir>/packages/core/$1/src',
			'<rootDir>/packages/libs/$1/src',
			'<rootDir>/packages/tools/$1/src',
		],
		// Fix React context resolution issues
		'^react$': '<rootDir>/node_modules/react',
		'^react-dom$': '<rootDir>/node_modules/react-dom',
	},
	// By default, jest will treat everything under `__tests__` as a test file, we only need `__tests__/*.test.ts`.
	testMatch: [ '<rootDir>/packages/**/__tests__/**/*.test.[jt]s?(x)' ],
	// Setup files to run for all the tests.
	setupFilesAfterEnv: [ '<rootDir>/tests/setup.ts' ],
	// Code coverage.
	collectCoverageFrom: [
		'packages/**/*.{js,jsx,ts,tsx}',
		'!packages/**/__tests__/**/*.{js,jsx,ts,tsx}', // Avoid running coverage on test utils.
		'!packages/**/dist/**/*.{js,jsx,ts,tsx}', // Avoid running coverage on dist.
		'!packages/**/typedoc.config.js', // Avoid running coverage on typedoc config.
	],
	moduleDirectories: [ 'node_modules', 'tests' ],
	coverageThreshold: {
		global: {
			lines: 80,
		},
	},
	// Fix React context issues
	resolver: undefined,
	// Ensure React context works properly
	globals: {
		React: require( 'react' ),
	},
};
