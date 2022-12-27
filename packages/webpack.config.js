const path = require( 'path' );
const { readdirSync } = require( 'fs' );

const globalObjectKey = '__UNSTABLE__elementorPackages';

const packages = [
	...readdirSync( path.resolve( __dirname, 'packages' ), { withFileTypes: true } )
		.filter( ( dirent ) => dirent.isDirectory() )
		.map( ( dirent ) => dirent.name )
		.map( ( name ) => ( {
			name,
			path: path.resolve( __dirname, `./packages/${ name }/src` ),
		} ) ),
	{
		name: 'ui',
		path: path.resolve( __dirname, `./node_modules/@elementor/ui` ),
	},
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
	return packages.reduce( ( acc, { name } ) => ( {
		...acc,
		[ `@elementor/${ name }` ]: `${ globalObjectKey }.${ kebabToCamelCase( name ) }`,
	} ), {} );
}

function kebabToCamelCase( kebabCase ) {
	return kebabCase.replace( /-(\w)/g, ( match, w ) => {
		return w.toUpperCase();
	} );
}

const config = {
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

module.exports = ( env, argv ) => {
	if ( 'development' === argv.mode ) {
		config.devtool = 'source-map';
	}

	// TODO: We probably need to add `@babel/preset-env` here
	if ( 'production' === argv.mode ) {
		config.optimization = {
			minimize: true,
		};

		config.output.filename = '[name].min.js';
	}

	return config;
};
