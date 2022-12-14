module.exports = {
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
};
