const path = require( 'path' );

// TODO: use `glob` or something to read it automatically and use `*` in the pacakge.json
const packages = require( './package.json' ).workspaces.map( ( packagePath ) => {
	const packageName = packagePath.replace( /^packages\/(apps|features|utils)\//, '' );

	return {
		packagePath,
		packageName,
		packageNameCamelCase: kebabToCamelCase( packageName ),
	};
} );

// TODO: Do we wanna expose everything to the global scope? Because curently we do.
const entry = packages.reduce( ( acc, { packagePath, packageName, packageNameCamelCase } ) => {
	return {
		...acc,
		[ packageName ]: {
			import: path.resolve( __dirname, `./${ packagePath }/src/index` ),
			library: {
				name: [ 'elementorEditorPackages', packageNameCamelCase ],
				type: 'window',
			},
		},
	};
}, {} );

const externals = packages.reduce( ( acc, { packageName, packageNameCamelCase } ) => {
	return {
		...acc,
		[ `@elementor/${ packageName }` ]: `elementorEditorPackages.${ packageNameCamelCase }`,
	};
}, {} );

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
		extensions: [ '.tsx', '.ts', '.js' ],
	},
	output: {
		// TODO: Maybe the output should contain the package type? Currently it's just the pacakge name.
		filename: '[name].js',
		path: path.resolve( __dirname, '../assets/js/editor-packages/' ),
	},
};

module.exports = ( env, argv ) => {
	if ( 'development' === argv.mode ) {
		config.devtool = 'source-map';
	}

	if ( 'production' === argv.mode ) {
		// TODO: We probably need `@babel/preset-env` here
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
