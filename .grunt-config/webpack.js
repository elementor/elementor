/**
 * Grunt webpack task config
 * @package Elementor
 */
const path = require( 'path' );

const packagesConfigs = require( './webpack.packages.js' );

// Handling minification for production assets.
const TerserPlugin = require( 'terser-webpack-plugin' );

const aliasList = require('./webpack.alias.js').resolve;

const webpack = require('webpack');

// Cleaning up existing chunks before creating new ones.
const RemoveChunksPlugin = require('./remove-chunks');

const WatchTimePlugin = require('./plugins/watch-time/index');

// Preventing auto-generated long names of shared sub chunks (optimization.splitChunks.minChunks) by using only the hash.
const getChunkName = ( chunkData, environment ) => {
	const minSuffix = 'production' === environment ? '.min' : '',
		name = chunkData.chunk.name ? '[name].' : '';

	return `${ name }[contenthash].bundle${ minSuffix }.js`;
};

const getModuleRules = ( presets ) => {
	return {
		rules: [
			{
				test: /app.*\.(s)?css$/i,
				use: [
					{
						loader: './loaders/app-imports.js',
					},
				],
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets,
							plugins: [
								[ '@wordpress/babel-plugin-import-jsx-pragma' ],
								[ '@babel/plugin-transform-react-jsx', {
									'pragmaFrag': 'React.Fragment',
								} ],
								[ '@babel/plugin-transform-runtime' ],
								[ '@babel/plugin-transform-modules-commonjs' ],
							],
						},
					},
				],
			},
		],
	};
};

const moduleRules = getModuleRules( [ '@wordpress/default' ] );

const frontendRulesPresets = [ [
	'@babel/preset-env',
	{
		targets: {
			browsers: [
				'last 3 versions',
				'Chrome >= 100',
				'Firefox >= 100',
				'Edge >= 100',
				'Safari >= 15.5',
				'iOS >= 15.5',
				'Android >= 100',
				'ChromeAndroid >= 100',
				'not dead',
			],
		},
		"useBuiltIns": "usage",
		"corejs": "3.23",
	}
] ];

const frontendModuleRules = getModuleRules( frontendRulesPresets );

const entry = {
	'editor': [
		path.resolve( __dirname, '../assets/dev/js/editor/utils/jquery-serialize-object.js' ),
		path.resolve( __dirname, '../assets/dev/js/editor/utils/jquery-html5-dnd.js' ),
		path.resolve( __dirname, '../assets/dev/js/editor/editor.js' ),
	],
	'admin': path.resolve( __dirname, '../assets/dev/js/admin/admin.js' ),
	'admin-feedback': path.resolve( __dirname, '../assets/dev/js/admin/admin-feedback.js' ),
	'announcements-app': path.resolve( __dirname, '../modules/announcements/assets/js/index.js' ),
	'common': path.resolve( __dirname, '../core/common/assets/js/common.js' ),
	'dev-tools': path.resolve( __dirname, '../modules/dev-tools/assets/js/index.js' ),
	'elementor-admin-bar': path.resolve( __dirname, '../modules/admin-bar/assets/js/frontend/module.js' ),
	'gutenberg': path.resolve( __dirname, '../assets/dev/js/admin/gutenberg.js' ),
	'new-template': path.resolve( __dirname, '../assets/dev/js/admin/new-template/new-template.js' ),
	'app': path.resolve( __dirname, '../app/assets/js/index.js' ),
	'app-loader': path.resolve( __dirname, '../app/assets/js/app-loader' ),
	'app-packages': path.resolve( __dirname, '../app/assets/js/app-packages' ),
	'beta-tester': path.resolve( __dirname, '../assets/dev/js/admin/beta-tester/beta-tester.js' ),
	'common-modules': path.resolve( __dirname, '../core/common/assets/js/modules' ),
	'editor-modules': path.resolve( __dirname, '../assets/dev/js/editor/modules.js' ),
	'admin-modules': path.resolve( __dirname, '../assets/dev/js/admin/modules.js' ),
	'editor-document': path.resolve( __dirname, '../assets/dev/js/editor/editor-document.js' ),
	'qunit-tests': path.resolve( __dirname, '../tests/qunit/main.js' ),
	'admin-top-bar': path.resolve( __dirname, '../modules/admin-top-bar/assets/js/admin.js' ),
	'checklist': path.resolve( __dirname, '../modules/checklist/assets/js/editor.js' ),
	'nested-elements': path.resolve( __dirname, '../modules/nested-elements/assets/js/editor/index.js' ),
	'nested-tabs': path.resolve( __dirname, '../modules/nested-tabs/assets/js/editor/index.js' ),
	'nested-accordion': path.resolve( __dirname, '../modules/nested-accordion/assets/js/editor/index.js' ),
	'container-converter': path.resolve( __dirname, '../modules/container-converter/assets/js/editor/module.js' ),
	'atomic-widgets-editor': path.resolve( __dirname, '../modules/atomic-widgets/assets/js/editor/module.js' ),
	'notes': path.resolve( __dirname, '../modules/notes/assets/js/notes.js' ),
	'web-cli': path.resolve( __dirname, '../modules/web-cli/assets/js/index.js' ),
	'import-export-admin': path.resolve( __dirname, '../app/modules/import-export/assets/js/admin.js' ),
	'kit-elements-defaults-editor': path.resolve( __dirname, '../modules/kit-elements-defaults/assets/js/editor/index.js' ),
	'editor-loader-v1': path.resolve( __dirname, '../core/editor/loader/v1/js/editor-loader-v1.js' ),
	'editor-loader-v2': path.resolve( __dirname, '../core/editor/loader/v2/js/editor-loader-v2.js' ),
	'editor-environment-v2': path.resolve( __dirname, '../core/editor/loader/v2/js/editor-environment-v2.js' ),
	'responsive-bar': path.resolve( __dirname, '../assets/dev/js/editor/regions/responsive-bar/index.js' ),
	'ai': path.resolve( __dirname, '../modules/ai/assets/js/editor/index.js' ),
	'admin-notifications': path.resolve( __dirname, '../modules/notifications/assets/js/admin.js' ),
	'editor-notifications': path.resolve( __dirname, '../modules/notifications/assets/js/editor.js' ),
	'ai-layout': path.resolve( __dirname, '../modules/ai/assets/js/editor/layout-module.js' ),
	'ai-gutenberg': path.resolve( __dirname, '../modules/ai/assets/js/gutenberg/index.js' ),
	'element-manager-admin': path.resolve( __dirname, '../modules/element-manager/assets/js/admin.js' ),
	'media-hints': path.resolve( __dirname, '../assets/dev/js/admin/hints/media.js' ),
	'ai-media-library': path.resolve( __dirname, '../modules/ai/assets/js/media-library/index.js' ),
	'ai-unify-product-images': path.resolve( __dirname, '../modules/ai/assets/js/woocommerce/index.js' ),
	// Temporary solution for the AI App in the Admin.
	'ai-admin': path.resolve( __dirname, '../modules/ai/assets/js/admin/index.js' ),
	'styleguide': path.resolve( __dirname, '../modules/styleguide/assets/js/styleguide.js' ),
	'styleguide-app-initiator': path.resolve( __dirname, '../modules/styleguide/assets/js/styleguide-app-initiator.js' ),
	'e-home-screen': path.resolve( __dirname, '../modules/home/assets/js/app.js' ),
	'e-react-promotions': path.resolve( __dirname, '../modules/promotions/assets/js/react/index.js' ),
	'e-wc-product-editor': path.resolve( __dirname, '../modules/wc-product-editor/assets/js/e-wc-product-editor.js' ),
	'floating-elements-modal': path.resolve( __dirname, '../assets/dev/js/admin/floating-elements/new-floating-elements.js' ),
};

const frontendEntries = {
	'frontend-modules': path.resolve( __dirname, '../assets/dev/js/frontend/modules.js' ),
	'frontend': { import: path.resolve( __dirname, '../assets/dev/js/frontend/frontend.js' ), dependOn: 'frontend-modules' },
};

const externals = [
	{
		'@wordpress/i18n': 'wp.i18n',
		react: 'React',
		'react-dom': 'ReactDOM',
		'@elementor/app-ui': 'elementorAppPackages.appUi',
		'@elementor/components': 'elementorAppPackages.components',
		'@elementor/hooks': 'elementorAppPackages.hooks',
		'@elementor/site-editor': 'elementorAppPackages.siteEditor',
		'@elementor/router': 'elementorAppPackages.router',
		'@elementor/ui': 'elementorV2.ui',
		'@elementor/icons': 'elementorV2.icons',
		'@elementor/editor-app-bar': 'elementorV2.editorAppBar',
		'@elementor/editor-v1-adapters': 'elementorV2.editorV1Adapters',
		'@wordpress/dom-ready': 'wp.domReady',
		'@wordpress/components': 'wp.components',
		'@wordpress/core-data': 'wp.coreData',
		'@wordpress/data': 'wp.data',
		'@wordpress/plugins': 'wp.plugins',
		'@woocommerce/admin-layout': 'wc.adminLayout',
	},
	// Handle tree-shaking imports for ui and icons packages (@elementor/ui/xxx) to be pointed to the external object (elementorV2.ui.xxx).
	function ( { request }, callback ) {
		const matches = request.match( /^@elementor\/(ui|icons)\/(.+)$/ );

		if ( matches?.length ) {
			return callback( null, `elementorV2.${ matches[ 1 ] }['${ matches[ 2 ] }']` );
		}

		callback();
	},
];

const plugins = [
	new webpack.ProvidePlugin( {
		React: 'react',
		ReactDOM: 'react-dom',
		PropTypes: 'prop-types',
		__: ['@wordpress/i18n', '__'],
		sprintf: ['@wordpress/i18n', 'sprintf'],
	} ),
	new WatchTimePlugin(),
];

const baseConfig = {
	target: 'web',
	context: __dirname,
	externals,
	resolve: aliasList,
};

const devSharedConfig = {
	...baseConfig,
	devtool: 'source-map',
	mode: 'development',
	output: {
		path: path.resolve( __dirname, '../assets/js' ),
		chunkFilename: ( chunkData ) => getChunkName( chunkData, 'development' ),
		filename: '[name].js',
		devtoolModuleFilenameTemplate: '../[resource]',
		// Prevents the collision of chunk names between different bundles.
		uniqueName: 'elementor',
	},
	watch: true,
};

const webpackConfig = [
	{
		...devSharedConfig,
		module: moduleRules,
		plugins: [
			...plugins,
		],
		name: 'base',
		entry: entry,
	},
	{
		...devSharedConfig,
		module: frontendModuleRules,
		plugins: [
			new RemoveChunksPlugin( '.bundle.js' ),
			...plugins,
		],
		name: 'frontend',
		optimization: {
			runtimeChunk:  {
				name: 'webpack.runtime',
			},
			splitChunks: {
				minChunks: 2,
			},
		},
		entry: frontendEntries,
	},
	packagesConfigs.dev,
];

const prodSharedOptimization = {
	minimize: true,
	minimizer: [
		new TerserPlugin( {
			terserOptions: {
				keep_fnames: true,
			},
			include: /\.min\.js$/
		} ),
	],
};

const prodSharedConfig = {
	...baseConfig,
	mode: 'production',
	output: {
		path: path.resolve( __dirname, '../assets/js' ),
		chunkFilename: ( chunkData ) => getChunkName( chunkData, 'production' ),
		filename: '[name].js',
		// Prevents the collision of chunk names between different bundles.
		uniqueName: 'elementor',
	},
	performance: { hints: false },
};

const webpackProductionConfig = [
	{
		...prodSharedConfig,
		module: moduleRules,
		plugins: [
			...plugins,
		],
		name: 'base',
		entry: {
			// Clone.
			...entry,
		},
		optimization: {
			...prodSharedOptimization,
		},
	},
	{
		...prodSharedConfig,
		module: frontendModuleRules,
		plugins: [
			new RemoveChunksPlugin( '.bundle.min.js' ),
			...plugins,
		],
		name: 'frontend',
		entry: {
			// Clone.
			...frontendEntries,
		},
		optimization: {
			...prodSharedOptimization,
			runtimeChunk: {
				name: 'webpack.runtime.min',
			},
			splitChunks: {
				minChunks: 2,
			},
		},
	},
];

// Adding .min suffix to production entries.
webpackProductionConfig.forEach( ( config, index ) => {
	for ( const entryPoint in config.entry ) {
		let entryValue = config.entry[ entryPoint ];

		if ( entryValue.dependOn ) {
			// We duplicate the 'entryValue' obj for not affecting the 'entry' obj used by the dev process.
			entryValue = { ...entryValue };

			entryValue.dependOn += '.min';
		}

		delete config.entry[ entryPoint ];
		config.entry[ entryPoint + '.min' ] = entryValue;
	}
} );

// The 'packages' config doesn't need a `.min` suffix (it has its own config).
webpackProductionConfig.push( packagesConfigs.prod );

const developmentNoWatchConfig = webpackConfig.map( ( config ) => {
	return { ...config, watch: false };
} );

const productionWatchConfig = webpackProductionConfig.map( ( config ) => {
	return { ...config, watch: true };
} );

const gruntWebpackConfig = {
	development: webpackConfig,
	developmentNoWatch: developmentNoWatchConfig,
	production: webpackProductionConfig,
	productionWatch: productionWatchConfig,
	packages: packagesConfigs.dev,
};

module.exports = gruntWebpackConfig;
