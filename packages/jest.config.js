module.exports = {
	verbose: true,
	rootDir: __dirname,
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest',
	},
	moduleNameMapper: {
		'^@elementor/(?!ui|icons|design-tokens)(.*)$': [
			'<rootDir>/libs/$1/src',
		],
	},
	testMatch: [ '<rootDir>/libs/**/__tests__/**/*.test.[jt]s?(x)' ],
	// Setup files to run for all the tests.
	setupFilesAfterEnv: [ '<rootDir>/tests/setup.ts' ],
	// Code coverage.
	collectCoverageFrom: [
		'libs/**/*.{js,jsx,ts,tsx}',
		'!libs/**/__tests__/**/*.{js,jsx,ts,tsx}',
		'!libs/**/dist/**/*.{js,jsx,ts,tsx}',
		'!libs/**/typedoc.config.js',
	],
	moduleDirectories: [ 'node_modules', 'tests' ],
	coverageThreshold: {
		global: {
			lines: 80,
		},
	},
};
