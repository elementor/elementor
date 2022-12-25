module.exports = {
	verbose: true,
	rootDir: __dirname,
	transform: {
		'\\.(j|t)sx?$': [ 'babel-jest', {
			presets: [
				[
					'@babel/preset-react', {
						runtime: 'automatic',
					},
				],
				'@babel/preset-typescript',
			],
			plugins: [
				[ '@babel/plugin-transform-modules-commonjs' ],
			],
		} ],
	},
	testEnvironment: 'jsdom',
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
