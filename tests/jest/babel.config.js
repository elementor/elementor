module.exports = {
	presets: [ [ '@babel/preset-env', {
		useBuiltIns: 'usage',
		corejs: '3.23',
	} ] ],
	plugins: [
		[ '@wordpress/babel-plugin-import-jsx-pragma' ],
		[ '@babel/plugin-transform-react-jsx', {
			pragmaFrag: 'React.Fragment',
		} ],
		[ '@babel/plugin-transform-runtime' ],
		[ '@babel/plugin-transform-modules-commonjs' ],
	],
};
