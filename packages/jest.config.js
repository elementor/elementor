module.exports = {
	verbose: true,
	rootDir: __dirname,
	testEnvironment: 'jsdom',
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
	moduleNameMapper: {
		'^@elementor/(?!ui)(.*)$': '<rootDir>/packages/$1/src',
	},
	// By default jest avoids transforming files in node_modules.
	transformIgnorePatterns: [
		// Excluding elementor ui which is external package without commonjs build.
		'node_modules/(?!@elementor/ui)',
	],
	// Code coverage.
	collectCoverageFrom: [
		'packages/*/src/**/*.{js,jsx,ts,tsx}',
	],
	coverageThreshold: {
		global: {
			lines: 80,
		},
	},
};
