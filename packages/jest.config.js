const path = require( 'path' );

module.exports = {
	verbose: true,
	rootDir: __dirname,
	transform: {
		'\\.(j|t)sx?$': [ 'babel-jest', {
			configFile: path.resolve( __dirname, './babel.config' ),
		} ],
	},
	testEnvironment: 'jsdom',
	testMatch: [
		'**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+.(spec|test).[jt]s?(x)',
	],
	moduleNameMapper: {
		'@elementor/(.*)$': '<rootDir>/packages/$1/src',
	},

	/** Code coverage */
	collectCoverageFrom: [
		'packages/*/src/**/*.{js,jsx,ts,tsx}',
	],
	coverageThreshold: {
		global: {
			lines: 80,
		},
	},
};
