const path = require( 'path' );
const { readdirSync } = require( 'fs' );
const ExtractDependenciesWebpackPlugin = require( './tools/webpack/extract-depndencies-webpack-plugin' );

const globalObjectKey = '__UNSTABLE__elementorPackages';

const kebabToCamelCase = ( kebabCase ) => kebabCase.replace(
	/-(\w)/g,
	( match, w ) => w.toUpperCase()
);

const packages = [
	// Elementor packages from the monorepo.
	...readdirSync( path.resolve( __dirname, 'packages' ), { withFileTypes: true } )
		.filter( ( dirent ) => dirent.isDirectory() )
		.map( ( dirent ) => dirent.name )
		.map( ( name ) => ( {
			name,
			path: path.resolve( __dirname, `./packages/${ name }/src` ),
		} ) ),
	// Elementor packages that lives outside the monorepo.
	{
		name: 'ui',
		path: path.resolve( __dirname, `./node_modules/@elementor/ui` ),
	},
];

const externals = [
	// Elementor packages.
	...packages.map( ( { name } ) => ( {
		name: `@elementor/${ name }`,
		global: `${ globalObjectKey }.${ kebabToCamelCase( name ) }`,
	} ) ),
	// Packages that exist in WordPress environment, and we use them as externals.
	{
		name: '@wordpress/i18n',
		global: 'wp.i18n',
	},
	{
		name: 'react',
		global: 'React',
	},
	{
		name: 'react-dom',
		global: 'ReactDOM',
	},
];

module.exports = {
	entry: packages.reduce( ( acc, pkg ) => ( {
		...acc,
		[ pkg.name ]: {
			import: pkg.path,
			library: {
				name: [ globalObjectKey, kebabToCamelCase( pkg.name ) ],
				type: 'window',
			},
		},
	} ), {} ),
	externals: externals.reduce( ( acc, { name, global } ) => ( {
		...acc,
		[ name ]: global,
	} ), {} ),
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
		new ExtractDependenciesWebpackPlugin(),
	],
	output: {
		clean: true,
		path: path.resolve( __dirname, '../assets/js/packages/' ),
	},
};
