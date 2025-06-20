const path = require( 'path' );
const fs = require( 'fs' );
const { GenerateWordPressAssetFileWebpackPlugin } = require( path.resolve( __dirname, '../elementor-packages/packages/tools/generate-wordpress-asset-file-webpack-plugin' ) );
const { ExtractI18nWordpressExpressionsWebpackPlugin } = require( path.resolve( __dirname, '../elementor-packages/packages/tools/extract-i18n-wordpress-expressions-webpack-plugin' ) );
const { ExternalizeWordPressAssetsWebpackPlugin } = require( path.resolve( __dirname, '../elementor-packages/packages/tools/externalize-wordpress-assets-webpack-plugin' ) );
const { EntryInitializationWebpackPlugin } = require( path.resolve( __dirname, '../elementor-packages/packages/tools/entry-initialization-webpack-plugin' ) );
const TerserPlugin = require('terser-webpack-plugin');

const packages = getLocalRepoPackagesEntries();

const REGEXES = {
	// @elementor/ui/SvgIcon. Used inside @elementor/icons
	elementorPathImports: /^@elementor\/(ui|icons)\/(.+)$/,

	// @elementor/editor
	// We want to bundle `@elementor/design-tokens` inside the UI package since it's an internal thing.
	elementorPackages: /^@elementor\/(?!design-tokens)(.+)$/,

	// @wordpress/components
	wordpressPackages: /^@wordpress\/(.+)$/,
};

const common = {
	name: 'packages',
	entry: Object.fromEntries(
		packages.map( ( { name, path } ) => [ name, path ] )
	),
	module: {
		rules: [
			{
				test: /\.[jt]sx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-typescript',
							'@babel/preset-react',
						],
					},
				},
			},
		],
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
	},
	plugins: [
		new GenerateWordPressAssetFileWebpackPlugin( {
			handle: ( entryName ) => `elementor-v2-${entryName}`,
			map: [
				{ request: REGEXES.elementorPathImports, handle: 'elementor-v2-$1' },
				{ request: REGEXES.elementorPackages, handle: 'elementor-v2-$1' },
				{ request: REGEXES.wordpressPackages, handle: 'wp-$1' },
				{ request: 'react', handle: 'react' },
				{ request: 'react-dom', handle: 'react-dom' },
			]
		} ),
		new ExternalizeWordPressAssetsWebpackPlugin( {
			global: ( entryName ) => [ 'elementorV2', entryName ],
			map: [
				{ request: REGEXES.elementorPathImports, global: [ 'elementorV2', '$1', '$2' ] },
				{ request: REGEXES.elementorPackages, global: [ 'elementorV2', '$1' ] },
				{ request: REGEXES.wordpressPackages, global: [ 'wp', '$1' ] },
				{ request: 'react', global: 'React' },
				{ request: 'react-dom', global: 'ReactDOM' },
			]
		} ),
		new EntryInitializationWebpackPlugin( {
			initializer: ( { entryName } ) => {
				return `window.elementorV2.${ entryName }?.init?.();`;
			},
		} ),
	],
	output: {
		path: path.resolve( __dirname, '../assets/js/packages/' ),
	},
}

const devConfig = {
	...common,
	mode: 'development',
	devtool: 'source-map',
	watch: true, // All the webpack config in the plugin that are dev, should have this property.
	optimization: {
		...( common.optimization || {} ),
		// Intentionally minimizing the dev assets to reduce the bundle size.
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_classnames: true,
					keep_fnames: true,
				}
			})
		]
	},
	output: {
		...( common.output || {} ),
		filename: '[name]/[name].js',
	},
}

const prodConfig = {
	...common,
	mode: 'production',
	devtool: false, // TODO: Need to check what to do with source maps.
	optimization: {
		...( common.optimization || {} ),
		minimize: true,
	},
	plugins: [
		...( common.plugins || [] ),
		new ExtractI18nWordpressExpressionsWebpackPlugin( {
			pattern: ( entryPath ) => path.resolve( entryPath, '../../src/**/*.{ts,tsx,js,jsx}' ),
		} ),
	],
	output: {
		...( common.output || {} ),
		filename: '[name]/[name].min.js',
	}
}

module.exports = {
	dev: devConfig,
	prod: prodConfig,
};

function getLocalRepoPackagesEntries() {
	const repoPath = path.resolve( __dirname, '../elementor-packages' );
	const relevantDirs = [ 'packages/core', 'packages/libs' ]

	const packages = relevantDirs.flatMap( ( dir ) =>
		fs.readdirSync( path.resolve( repoPath, dir ) )
			.map( ( name ) => ( {
				name,
				path: path.resolve( repoPath, dir, `${name}/src/index.ts` ),
			} ) )
			.filter( ( { path } ) => fs.existsSync( path ) )
	);

	packages.push( {
		name: 'ui',
		path: './node_modules/@elementor/ui/index.js'
	} );

	packages.push( {
		name: 'icons',
		path: './node_modules/@elementor/icons/index.js'
	} );

	return packages;
}
