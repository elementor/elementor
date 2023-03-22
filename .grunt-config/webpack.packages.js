const path = require("path");
const fs = require("fs");
const { ExtractDependenciesWebpackPlugin } = require("@elementor/extract-dependencies-webpack-plugin");
const { ExtractI18nExpressionsWebpackPlugin } = require("@elementor/extract-i18n-expressions-webpack-plugin");
const { ExternalWordPressAssetsWebpackPlugin } = require("@elementor/external-wordpress-assets-webpack-plugin");

const { dependencies } = require("../package.json");

const globalObjectKey = '__UNSTABLE__elementorPackages';

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
				name: [ globalObjectKey, kebabToCamelCase( name ) ],
				type: 'window',
			},
		},
	} ), {} );
}

const common = {
	name: 'packages',
	plugins: [
		// GenerateWordPressAssetFileWebpackPlugin,
		new ExtractDependenciesWebpackPlugin( {
			handlePrefix: 'elementor-packages-',
			handlesMap: {
				exact: {
					react: 'react',
					'react-dom': 'react-dom',
				},
				startsWith: {
					'@elementor/': 'elementor-packages-',
					'@wordpress/': 'wp-',
				}
			}
		} ),
		// ExternalizeWordPressAssetsWebpackPlugin,
		new ExternalWordPressAssetsWebpackPlugin( {
			externalsMap: {
				exact: {
					react: 'React',
					'react-dom': 'ReactDOM',
				},
				startsWith: {
					'@elementor/': '__UNSTABLE__elementorPackages',
					'@wordpress/': 'wp',
				}
			}
		} ),
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
