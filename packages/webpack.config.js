const path = require( 'path' );
const packages = require( './package.json' ).workspaces;

const entry = packages.reduce( ( acc, packageName ) => {
	return {
		...acc,
		[ packageName ]: {
			import: path.resolve( __dirname, `./${ packageName }/index.js` ),
			library: {
				name: [ 'elementorEditorPackages', kebabToCamelCase( packageName ) ],
				type: 'window',
			},
		},
	};
}, {} );

const externals = packages.reduce( ( acc, packageName ) => {
	return {
		...acc,
		[ `@elementor/${ packageName }` ]: `elementorEditorPackages.${ kebabToCamelCase( packageName ) }`,
	};
}, {} );

module.exports = {
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
						presets: [ '@babel/preset-react' ],
					},
				},
			},
		],
	},
	output: {
		filename: '[name].js',
		path: path.resolve( __dirname, '../assets/js/editor-packages/' ),
	},
	mode: 'development',
};

function kebabToCamelCase( kebabCase ) {
	return kebabCase.replace( /-(\w)/, ( match, w ) => {
		return w.toUpperCase();
	} );
}
