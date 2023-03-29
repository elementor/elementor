const path = require( 'path' );

const paths = {
	currentDir: __dirname,
	webpackAlias: path.resolve( __dirname, '../../.grunt-config/webpack.alias' ),
	babelConfig: path.resolve( __dirname, './babel.config' ),
	jestSetup: path.resolve( __dirname, './setup-tests' ),
	libraries: {
		react: path.resolve( __dirname, './vendor/react.min.js' ),
		reactDom: path.resolve( __dirname, './vendor/react-dom.min.js' ),
	},
};

module.exports = {
	verbose: true,
	testMatch: [ './**/?(*.)+(spec|test).[jt]s?(x)' ],
	setupFilesAfterEnv: [ paths.jestSetup ],
	transform: {
		'\\.js$': [ 'babel-jest', { configFile: paths.babelConfig } ],
	},
	moduleNameMapper: {
		'^elementor/tests/jest/(.*)$': `${ paths.currentDir }/$1`,
		...transformWebpackAliasIntoJestAlias( require( paths.webpackAlias ).resolve.alias ),
		'^react$': paths.libraries.react,
		'^react-dom(.*)$': paths.libraries.reactDom,
	},
	testEnvironment: 'jsdom',
};

function transformWebpackAliasIntoJestAlias( webpackAlias ) {
	return Object.keys( webpackAlias )
		.reduce( ( current, aliasKey ) => ( {
			...current,
			[ `^${ aliasKey }/(.*)$` ]: `${ webpackAlias[ aliasKey ] }/$1`,
		} ), {} );
}
