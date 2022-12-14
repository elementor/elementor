const path = require( 'path' );
const packages = require( './package.json' ).workspaces.map( ( packagePath ) => {
	const packageName = packagePath.replace( /^(apps|features|utils)\//, '' );

	return {
		packagePath,
		packageName,
		packageNameCamelCase: kebabToCamelCase( packageName ),
	};
} );

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
		filename: '[name].js',
		path: path.resolve( __dirname, '../assets/js/editor-packages/' ),
	},
};

module.exports = ( env, argv ) => {
	if ( 'development' === argv.mode ) {
		config.devtool = 'source-map';
	}

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
