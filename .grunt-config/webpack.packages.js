const path = require("path");
const fs = require("fs");
const { GenerateWordPressAssetFileWebpackPlugin } = require("@elementor/generate-wordpress-asset-file-webpack-plugin");
const { ExtractI18nExpressionsWebpackPlugin } = require("@elementor/extract-i18n-expressions-webpack-plugin");
const { ExternalizeWordPressAssetsWebpackPlugin } = require("@elementor/externalize-wordpress-assets-webpack-plugin");

const { dependencies } = require("../package.json");

const packages = Object.keys( dependencies )
	.filter( ( packageName ) => !! packageName.startsWith( '@elementor/' ) )
	.map( ( packageName ) => {
		const pkgJSON = fs.readFileSync( path.resolve( __dirname, `../node_modules/${packageName}/package.json` ) );

		const { main, module } = JSON.parse( pkgJSON );

		return {
			mainFile: module || main,
			packageName,
		}
	})
	.filter( ( { mainFile } ) => !! mainFile )
	.map( ( { mainFile, packageName } ) => {
		return {
			packageName,
			name: packageName.replace( '@elementor/', ''),
			path: path.resolve( __dirname, `../node_modules/${ packageName }`, mainFile ),
		}
	} );

const kebabToCamelCase = ( kebabCase ) => kebabCase.replace(
	/-(\w)/g,
	( match, w ) => w.toUpperCase()
);

const buildEntry = ( packages ) => {
	return packages.reduce((acc, {name, path}) => ({
		...acc,
		[ name ]: {
			import: path,
			library: {
				name: [ '__UNSTABLE__elementorPackages', kebabToCamelCase( name ) ],
				type: 'window',
			},
		},
	} ), {} );
}

const common = {
	name: 'packages',
	plugins: [
		// GenerateWordPressAssetFileWebpackPlugin,
		new GenerateWordPressAssetFileWebpackPlugin( { handlePrefix: 'elementor-packages-' } ),
		new ExternalizeWordPressAssetsWebpackPlugin(),
	],
	output: {
		path: path.resolve( __dirname, '../assets/js/packages/' ),
	},
}

const devConfig = {
	...common,
	entry: buildEntry( packages ),
	mode: 'development',
	devtool: false, // TODO: Need to check what to do with source maps.
	watch: true, // All the webpack config in the plugin that are dev, should have this property.
	output: {
		...( common.output || {} ),
		filename: '[name].js',
	}
}

const prodConfig = {
	...common,
	entry: buildEntry( packages ),
	mode: 'production',
	devtool: false, // TODO: Need to check what to do with source maps.
	optimization: {
		...( common.optimization || {} ),
		minimize: true,
	},
	plugins: [
		...( common.plugins || [] ),
		new ExtractI18nExpressionsWebpackPlugin(),
	],
	output: {
		...( common.output || {} ),
		filename: '[name].min.js',
	}
}

module.exports = {
	dev: devConfig,
	prod: prodConfig,
};
