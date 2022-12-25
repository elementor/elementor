const path = require( 'path' );
const { readdirSync } = require( 'fs' );

const globalObjectKey = '__UNSTABLE__elementorPackages';

const packages = readdirSync( path.resolve( __dirname, 'packages' ), { withFileTypes: true } )
	.filter( ( dirent ) => dirent.isDirectory() )
	.map( ( dirent ) => dirent.name )
	.map( ( packageName ) => ( {
		packageName,
		packageNameCamelCase: kebabToCamelCase( packageName ),
	} ) );

const entry = packages.reduce( ( acc, { packageName, packageNameCamelCase } ) => ( {
	...acc,
	[ packageName ]: {
		import: path.resolve( __dirname, `./packages/${ packageName }/src/index` ),
		library: {
			name: [ globalObjectKey, packageNameCamelCase ],
			type: 'window',
		},
	},
} ), {} );

const externals = packages.reduce( ( acc, { packageName, packageNameCamelCase } ) => ( {
	...acc,
	[ `@elementor/${ packageName }` ]: `${ globalObjectKey }.${ packageNameCamelCase }`,
} ), {} );

const config = {
	entry,
	externals: {
		...externals,
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

function kebabToCamelCase( kebabCase ) {
	return kebabCase.replace( /-(\w)/g, ( match, w ) => {
		return w.toUpperCase();
	} );
}
