const path = require( 'path' );

const paths = {
	root: path.resolve( __dirname, '../' ),
	babelConfig: path.resolve( __dirname, './babel.config' ),
	libraries: {
		react: path.resolve( __dirname, './vendor/react.min.js' ),
		reactDom: path.resolve( __dirname, './vendor/react-dom.min.js' ),
	},
};

module.exports = {
	verbose: true,
	rootDir: paths.root,
	transform: {
		'\\.js$': [ 'babel-jest', {
			configFile: paths.babelConfig,
		} ],
	},
	moduleNameMapper: {
		'^react$': paths.libraries.react,
		'^react-dom$': paths.libraries.reactDom,
	},
	testEnvironment: 'jsdom',
};
