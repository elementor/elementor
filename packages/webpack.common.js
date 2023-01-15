const path = require( 'path' );
const { readdirSync } = require( 'fs' );

const globalObjectKey = '__UNSTABLE__elementorPackages';

// Elementor's internal packages
const internalPackages = readdirSync( path.resolve( __dirname, 'packages' ), { withFileTypes: true } )
	.filter( ( dirent ) => dirent.isDirectory() )
	.map( ( dirent ) => dirent.name )
	.map( ( name ) => ( {
		name,
		path: path.resolve( __dirname, `./packages/${ name }/src` ),
	} ) );

// Packages that live outside the `packages` directory, but we want to treat them as if they were a part of the monorepo.
const externalPackages = [
	{
		name: 'ui',
		path: path.resolve( __dirname, `./node_modules/@elementor/ui` ),
	},
];

// Packages that exists in WordPress, and we use them as externals.
const wordpressPackages = [
	{
		fullName: '@wordpress/i18n',
		runtimePath: 'wp.i18n',
	},
];

const packages = [
	...internalPackages,
	...externalPackages,
];

function generateEntry() {
	return packages.reduce( ( acc, { name, path: packagePath } ) => ( {
		...acc,
		[ name ]: {
			import: packagePath,
			library: {
				name: [ globalObjectKey, kebabToCamelCase( name ) ],
				type: 'window',
			},
		},
	} ), {} );
}

function generateExternals() {
	const externals = packages.reduce( ( acc, { name } ) => ( {
		...acc,
		[ `@elementor/${ name }` ]: `${ globalObjectKey }.${ kebabToCamelCase( name ) }`,
	} ), {} );

	wordpressPackages.forEach( ( { fullName, runtimePath } ) => {
		externals[ fullName ] = runtimePath;
	} );

	return externals;
}

function kebabToCamelCase( kebabCase ) {
	return kebabCase.replace( /-(\w)/g, ( match, w ) => {
		return w.toUpperCase();
	} );
}

module.exports = {
	entry: generateEntry(),
	externals: {
		...generateExternals(),
		react: 'React',
		'react-dom': 'ReactDOM',
	},
	module: {
		rules: [
			{
				test: /\.(j|t)sx?$/,
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
	output: {
		filename: '[name].js',
		path: path.resolve( __dirname, '../assets/js/packages/' ),
	},
};
