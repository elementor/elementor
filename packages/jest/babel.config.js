module.exports = {
	presets: [
		[
			'@babel/preset-react', {
				runtime: 'automatic',
			},
		],
	],
	plugins: [
		[ '@babel/plugin-transform-modules-commonjs' ],
	],
};
