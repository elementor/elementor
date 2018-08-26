/**
 * Grunt webpack task config
 * @package Elementor
 */
const path = require( 'path' );

UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );

const aliasList = {
	alias: {
		'elementor-editor': path.resolve( __dirname, '../assets/dev/js/editor' ),
		'elementor-behaviors': path.resolve( __dirname, '../assets/dev/js/editor/elements/views/behaviors' ),
		'elementor-regions': path.resolve( __dirname, '../assets/dev/js/editor/regions' ),
		'elementor-controls': path.resolve( __dirname, '../assets/dev/js/editor/controls' ),
		'elementor-elements': path.resolve( __dirname, '../assets/dev/js/editor/elements' ),
		'elementor-views': path.resolve( __dirname, '../assets/dev/js/editor/views' ),
		'elementor-editor-utils': path.resolve( __dirname, '../assets/dev/js/editor/utils' ),
		'elementor-panel': path.resolve( __dirname, '../assets/dev/js/editor/regions/panel' ),
		'elementor-templates': path.resolve( __dirname, '../assets/dev/js/editor/components/template-library' ),
		'elementor-dynamic-tags': path.resolve( __dirname, '../assets/dev/js/editor/components/dynamic-tags' ),
		'elementor-frontend': path.resolve( __dirname, '../assets/dev/js/frontend' ),
		'elementor-revisions': path.resolve( __dirname, '../assets/dev/js/editor/components/revisions' ),
		'elementor-validator': path.resolve( __dirname, '../assets/dev/js/editor/components/validator' ),
		'elementor-utils': path.resolve( __dirname, '../assets/dev/js/utils' ),
		'elementor-admin': path.resolve( __dirname, '../assets/dev/js/admin' ),
		'modules': path.resolve( __dirname, '../modules' ),
	}
};

const moduleRules = {
	rules: [
		//{
		//	enforce: 'pre',
		//	test: /\.js$/,
		//	exclude: /node_modules/,
		//	loader: 'eslint-loader',
		//	options: {
		//		//failOnError: true,
		//	}
		//},
		{
			test: /\.js$/,
			exclude: /node_modules/,
			use: [
				{
					loader: 'babel-loader',
					query: {
						presets: ['env'],
					},
				},
			],
		},
	],
};

const entry = {
	'editor': [
		path.resolve( __dirname, '../assets/dev/js/editor/utils/jquery-serialize-object.js' ),
		path.resolve( __dirname, '../assets/dev/js/editor/utils/jquery-html5-dnd.js' ),
		path.resolve( __dirname, '../assets/dev/js/editor/editor.js' ),
	],
	'admin': path.resolve( __dirname, '../assets/dev/js/admin/admin.js' ),
	'admin-feedback': path.resolve( __dirname, '../assets/dev/js/admin/admin-feedback.js' ),
	'gutenberg': path.resolve( __dirname, '../assets/dev/js/admin/gutenberg.js' ),
	'new-template': path.resolve( __dirname, '../assets/dev/js/admin/new-template/new-template.js' ),
	'frontend': path.resolve( __dirname, '../assets/dev/js/frontend/frontend.js' ),
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
	entry: entry,
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
			new UglifyJsPlugin( {
				include: /\.min\.js$/
			} ),
		],
	},
};

// Add minified entry points
for ( var entryPoint  in  entry ) {
	webpackProductionConfig.entry[ entryPoint ] = entry[ entryPoint ];
	webpackProductionConfig.entry[ entryPoint + '.min' ] = entry[ entryPoint ];
}

const gruntWebpackConfig = {
	development: webpackConfig,
	production: webpackProductionConfig
};

module.exports = gruntWebpackConfig;
