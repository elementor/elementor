const { merge } = require( 'webpack-merge' );
const common = require( './webpack.common.js' );

module.exports = merge( common, {
	mode: 'development',
	devtool: 'source-map',
	output: {
		filename: '[name].js',
	},
} );
