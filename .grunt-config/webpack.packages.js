const path = require( 'path' );
const fs = require( 'fs' );
const { GenerateWordPressAssetFileWebpackPlugin } = require( '@elementor/generate-wordpress-asset-file-webpack-plugin' );
const { ExtractI18nWordpressExpressionsWebpackPlugin } = require( '@elementor/extract-i18n-wordpress-experssions-webpack-plugin' );
const { ExternalizeWordPressAssetsWebpackPlugin } = require( '@elementor/externalize-wordpress-assets-webpack-plugin' );

const elementorPackages = [
	'editor',
	'editor-app-bar',
	'editor-documents',
	'editor-panels',
	'editor-responsive',
	'editor-site-navigation',
	'editor-v1-adapters',
	'env',
	'icons',
	'locations',
	'store',
	'ui',
]

const packages = elementorPackages
	.map( ( name ) => {
	   const pkgJSON = fs.readFileSync( path.resolve( __dirname, `../node_modules/@elementor/${name}/package.json` ) );

	   const { main, module } = JSON.parse( pkgJSON );

	   return { name, mainFile: module || main }
	} )
	.filter( ( { mainFile } ) => !! mainFile )
	.map( ( { mainFile, name } ) => {
	   return {
	       name,
	       path: path.resolve( __dirname, `../node_modules/@elementor/${ name }`, mainFile ),
	   }
	} );

const common = {
	name: 'packages',
	entry: Object.fromEntries(
		packages.map( ( { name, path } ) => [ name, path ] )
	),
	plugins: [
		new GenerateWordPressAssetFileWebpackPlugin( { handlePrefix: 'elementor-packages-' } ),
		new ExternalizeWordPressAssetsWebpackPlugin( { globalKey: '__UNSTABLE__elementorPackages' } ),
	],
	output: {
		path: path.resolve( __dirname, '../assets/js/packages/' ),
	},
}

const devConfig = {
	...common,
	mode: 'development',
	devtool: false, // TODO: Need to check what to do with source maps.
	watch: true, // All the webpack config in the plugin that are dev, should have this property.
	output: {
		...( common.output || {} ),
		filename: '[name]/[name].js',
	}
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
		new ExtractI18nWordpressExpressionsWebpackPlugin(),
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
