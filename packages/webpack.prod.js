const { merge } = require( 'webpack-merge' );
const common = require( './webpack.common.js' );
const ExtractI18nExpressionsWebpackPlugin = require( './tools/webpack/extract-i18n-expressions-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );

// TODO: We probably need to add `@babel/preset-env` here.
module.exports = merge( common, {
	mode: 'production',
	optimization: {
		minimize: true,
	},
	output: {
		filename: '[name].min.js',
	},
	plugins: [
		new ReadableJsAssetsWebpackPlugin(),
		new ExtractI18nExpressionsWebpackPlugin(),
	],
} );
