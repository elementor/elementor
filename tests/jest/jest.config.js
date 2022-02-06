const path = require( 'path' );

const paths = {
	currentDir: __dirname,
	webpackAlias: path.resolve( __dirname, '../../.grunt-config/webpack.alias' ),
	babelConfig: path.resolve( __dirname, './babel.config' ),
	jestSetup: {
		libraries: path.resolve( __dirname, './setup/libraries.js' ),
		editor: path.resolve( __dirname, './setup/editor.js' ),
	},
	libraries: {
		jquery: path.resolve( __dirname, './vendor/jquery.min.js' ),
		tipsy: path.resolve( __dirname, './vendor/tipsy.min.js' ),
		react: path.resolve( __dirname, './vendor/react.min.js' ),
		reactDom: path.resolve( __dirname, './vendor/react-dom.min.js' ),
	},
};

module.exports = {
	verbose: true,
	testEnvironment: 'jsdom',
	testMatch: [ './**/?(*.)+(spec|test).[jt]s?(x)' ],
	setupFilesAfterEnv: Object.values( paths.jestSetup ),
	transform: {
		'\\.js$': [ 'babel-jest', { configFile: paths.babelConfig } ],
	},
	moduleNameMapper: {
		'^elementor/tests/jest/(.*)$': `${ paths.currentDir }/$1`,
		...transformWebpackAliasIntoJestAlias( require( paths.webpackAlias ).resolve.alias ),
		'^jquery': paths.libraries.jquery,
		'^tipsy': paths.libraries.tipsy,
		'^react$': paths.libraries.react,
		'^react-dom(.*)$': paths.libraries.reactDom,
	},
};

function transformWebpackAliasIntoJestAlias( webpackAlias ) {
	return Object.keys( webpackAlias )
		.reduce( ( current, aliasKey ) => ( {
			...current,
			[ `^${ aliasKey }/(.*)$` ]: `${ webpackAlias[ aliasKey ] }/$1`,
		} ), {} );
}
