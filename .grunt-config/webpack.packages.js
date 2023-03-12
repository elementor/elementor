// TODO: THE REQUIRE NOT WORKING - dont know why.
const ExtractDependenciesWebpackPlugin = require("@elementor/extract-dependencies-webpack-plugin");
const ExtractI18nExpressionsWebpackPlugin = require("@elementor/extract-i18n-expressions-webpack-plugin");
const path = require("path");

const globalObjectKey = '__UNSTABLE__elementorPackages';

// TODO: Need to make sure it builds the packages before build them here.

const kebabToCamelCase = ( kebabCase ) => kebabCase.replace(
	/-(\w)/g,
	( match, w ) => w.toUpperCase()
);

const { dependencies } = require("../package.json");

const packages = Object.keys( dependencies )
	.filter( ( packageName ) => !! packageName.startsWith( '@elementor/' ) && packageName !== '@elementor/ui' )
	.map( ( packageName ) => {
		return {
			name: packageName.replace( '@elementor/', ''),
			packageName,
			path: path.resolve( __dirname, `../node_modules/${ packageName }/dist/index.mjs` ),
		}
	} );

// TODO: Need to find a better way to handle this, maybe the ui package should be the same as all the other packages.
packages.push( {
	name: 'ui',
	packageName: '@elementor/ui',
	path: path.resolve( __dirname, `../node_modules/@elementor/ui/index.js` ),
});


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
	module: {
		// TODO: `rules` is no required when "@elementor/ui" will be build as the other packages.
		rules: [
			{
				test: /\.[jt]sx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [ '@babel/preset-react', {
							runtime: 'classic', // We have to use classic runtime because of WordPress which do not expose the new runtime.
						} ],
					},
				},
			},
		],
	},
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
