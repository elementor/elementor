const path = require( 'path' );

const paths = {
	currentDir: __dirname,
	webpackAlias: path.resolve( __dirname, '../../.grunt-config/webpack.alias' ),
	babelConfig: path.resolve( __dirname, './babel.config' ),
};

module.exports = {
	verbose: true,
	testMatch: [ './**/?(*.)+(spec|test).[jt]s?(x)' ],
	transform: {
		'\\.js$': [ 'babel-jest', { configFile: paths.babelConfig } ],
	},
	moduleNameMapper: {
		'^elementor/tests/jest/(.*)$': `${ paths.currentDir }/$1`,
		...transformWebpackAliasIntoJestAlias( require( paths.webpackAlias ).resolve.alias ),
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
