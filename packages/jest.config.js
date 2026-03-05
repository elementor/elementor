module.exports = {
	verbose: true,
	rootDir: __dirname,
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest',
	},
	moduleNameMapper: {
		'^@elementor/(?!ui|icons|design-tokens)(.*)$': [
			'<rootDir>/core/$1/src',
			'<rootDir>/libs/$1/src',
			'<rootDir>/tools/$1/src',
		],
	},
	// By default, jest will treat everything under `__tests__` as a test file, we only need `__tests__/*.test.ts`.
	testMatch: [ '<rootDir>/**/__tests__/**/*.test.[jt]s?(x)' ],
	// Setup files to run for all the tests.
	setupFilesAfterEnv: [ '<rootDir>/tests/setup.ts' ],
	// Code coverage.
	collectCoverageFrom: [
		'{core,libs,tools,apps}/**/*.{js,jsx,ts,tsx}',
		'!{core,libs,tools,apps}/**/__tests__/**/*.{js,jsx,ts,tsx}', // Avoid running coverage on test utils.
		'!{core,libs,tools,apps}/**/dist/**/*.{js,jsx,ts,tsx}', // Avoid running coverage on dist.
		'!{core,libs,tools,apps}/**/typedoc.config.js', // Avoid running coverage on typedoc config.
	],
	moduleDirectories: [ 'node_modules', 'tests' ],
	coverageThreshold: {
		global: {
			lines: 80,
		},
	},
};
