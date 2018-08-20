/**
 * Grunt webpack task config
 * @package Elementor
 */
const path = require('path');
UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const aliasList = {
	alias: {
		'elementor-editor': path.resolve( __dirname, '../assets/dev/js/editor'),
		'elementor-behaviors': path.resolve( __dirname, '../assets/dev/js/editor/elements/views/behaviors'),
		'elementor-layouts': path.resolve( __dirname, '../assets/dev/js/editor/layouts'),
		'elementor-controls': path.resolve( __dirname, '../assets/dev/js/editor/controls'),
		'elementor-elements': path.resolve( __dirname, '../assets/dev/js/editor/elements'),
		'elementor-views': path.resolve( __dirname, '../assets/dev/js/editor/views'),
		'elementor-editor-utils': path.resolve( __dirname, '../assets/dev/js/editor/utils'),
		'elementor-panel': path.resolve( __dirname, '../assets/dev/js/editor/layouts/panel'),
		'elementor-templates': path.resolve( __dirname, '../assets/dev/js/editor/components/template-library'),
		'elementor-dynamic-tags': path.resolve( __dirname, '../assets/dev/js/editor/components/dynamic-tags'),
		'elementor-frontend': path.resolve( __dirname, '../assets/dev/js/frontend'),
		'elementor-revisions': path.resolve( __dirname, '../assets/dev/js/editor/components/revisions'),
		'elementor-validator': path.resolve( __dirname, '../assets/dev/js/editor/components/validator'),
		'elementor-admin': path.resolve( __dirname, '../assets/dev/js/admin'),
		'elementor-utils': path.resolve( __dirname, '../assets/dev/js/utils'),
		'modules': path.resolve( __dirname, '../modules')
	}
};

const moduleRules = {
	rules: [
		{
			test: /\.js$/,
			exclude: /node_modules/,
			use: [
				{
					loader: 'babel-loader',
					query: {
						presets: ['env'],
					}
				}
			],
		}
	]
};

const entry = {
	'admin': path.resolve( __dirname, '../assets/dev/js/admin/admin.js'),
	'admin-feedback': path.resolve( __dirname, '../assets/dev/js/admin/admin-feedback.js'),
	'gutenberg': path.resolve( __dirname, '../assets/dev/js/admin/gutenberg.js'),
	'frontend': path.resolve( __dirname, '../assets/dev/js/frontend/frontend.js'),
	'editor': [
		path.resolve( __dirname, '../assets/dev/js/editor/utils/jquery-serialize-object.js'),
		path.resolve( __dirname, '../assets/dev/js/editor/utils/jquery-html5-dnd.js'),
		path.resolve( __dirname, '../assets/dev/js/editor/editor.js'),
	],
};

const webpackConfig = {
	target: 'web',
	context: __dirname,
	devtool: 'source-map',
	mode: 'development',
	output: {
		path: path.resolve( __dirname, '../assets/js' ),
		filename: '[name].js',
	},
	module: moduleRules,
	resolve: aliasList,
	entry: entry
};

const webpackProductionConfig = {
	target: 'web',
	context: __dirname,
	devtool: 'source-map',
	mode: 'production',
	output: {
		path: path.resolve( __dirname, '../assets/js' ),
		filename: '[name].js'
	},
	module: moduleRules,
	resolve: aliasList,
	entry: {},
	performance: { hints: false },
	optimization: {
		minimize: true,
		minimizer: [
			new UglifyJsPlugin({
				include: /\.min\.js$/
			})
		]
	}
};

// Add minified entry points
for ( var entryPoint  in  entry ) {
	webpackProductionConfig.entry[ entryPoint ] = entry[ entryPoint ];
	webpackProductionConfig.entry[ entryPoint + '.min' ] = entry[ entryPoint ];
}

const gruntWebpackConfig = {
	options: {
		stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
	},
	dev: webpackConfig,
	prod: webpackProductionConfig
};

module.exports = gruntWebpackConfig;