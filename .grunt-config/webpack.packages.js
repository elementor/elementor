const ExtractDependenciesWebpackPlugin = require("../packages/tools/webpack/extract-depndencies-webpack-plugin");
const ExtractI18nExpressionsWebpackPlugin = require("../packages/tools/webpack/extract-i18n-expressions-webpack-plugin");
const path = require("path");

const globalObjectKey = '__UNSTABLE__elementorPackages';

const kebabToCamelCase = ( kebabCase ) => kebabCase.replace(
	/-(\w)/g,
	( match, w ) => w.toUpperCase()
);

const { dependencies } = require("../package.json");

const packages = Object.keys( dependencies )
	.filter( ( packageName ) => !! packageName.startsWith( '@elementor/' ) )
	.map( ( packageName ) => {
		return {
			name: packageName.replace( '@elementor/', ''),
			packageName,
			path: path.resolve( __dirname, `../node_modules/${ packageName }/dist/index` ),
		}
	} );


const externals = [
	// Elementor packages.
	...packages.map( ( { packageName, name } ) => ( {
		packageName,
		global: `${ globalObjectKey }.${ kebabToCamelCase( name ) }`,
	} ) ),
	// Packages that exist in WordPress environment, and we use them as externals.
	{
		packageName: '@wordpress/i18n',
		global: 'wp.i18n',
	},
	{
		packageName: 'react',
		global: 'React',
	},
	{
		packageName: 'react-dom',
		global: 'ReactDOM',
	},
];

const common = {
	name: 'packages',
	entry: packages.reduce((acc, {name, path}) => ({
		...acc,
		[ name ]: {
			import: path,
			library: {
				name: [ globalObjectKey, kebabToCamelCase( name ) ],
				type: 'window',
			},
		},
	} ), {} ),
	externals: externals.reduce( ( acc, { packageName, global } ) => ( {
		...acc,
		[ packageName ]: global,
	} ), {} ),
	resolve: {
		extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
	},
	plugins: [
		new ExtractDependenciesWebpackPlugin(),
	],
	output: {
		clean: true,
		path: path.resolve( __dirname, '../assets/js/packages/' ),
	},
}

module.exports = {
	dev: {
		...common,
		mode: 'development',
		devtool: 'source-map',
		output: {
			...(common.output || {}),
			filename: '[name].js',
		},
	},
	prod: {
		mode: 'production',
		optimization: {
			...(common.optimization || {}),
			minimize: true,
		},
		plugins: [
			...(common.plugins || []),
			new ExtractI18nExpressionsWebpackPlugin(),
		],
	}
}
