const path = require( 'path' );

const SWC_JS_CONFIG = {
	jsc: {
		parser: {
			syntax: 'ecmascript',
			jsx: true,
		},
		transform: {
			react: {
				runtime: 'classic',
				pragma: 'React.createElement',
				pragmaFrag: 'React.Fragment',
				throwIfNamespace: false,
			},
		},
		target: 'es2020',
	},
	module: {
		type: 'commonjs',
	},
};

const paths = {
	currentDir: __dirname,
	webpackAlias: path.resolve( __dirname, '../../scripts/vite/shared/webpack.alias' ),
	jestSetup: path.resolve( __dirname, './setup-tests' ),
	mocks: {
		css: path.resolve( __dirname, './__mocks__/style-mock.js' ),
	},
};

module.exports = {
	verbose: true,
	testMatch: [ './**/?(*.)+(spec|test).[jt]s?(x)' ],
	setupFilesAfterEnv: [ paths.jestSetup ],
	transform: {
		'\\.jsx?$': [ '@swc/jest', SWC_JS_CONFIG ],
		'\\.tsx?$': '@swc/jest',
	},
	moduleNameMapper: {
		'^elementor/tests/jest/(.*)$': `${ paths.currentDir }/$1`,
		...transformWebpackAliasIntoJestAlias( require( paths.webpackAlias ).resolve.alias ),
		'\\.(css|less|sass|scss)$': paths.mocks.css,
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
