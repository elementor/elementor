const path = require( 'path' );

const paths = {
	root: __dirname,
	babelConfig: path.resolve( __dirname, './babel.config' ),
};

module.exports = {
	verbose: true,
	rootDir: paths.root,
	transform: {
		'\\.(j|t)sx?$': [ 'babel-jest', {
			configFile: paths.babelConfig,
		} ],
	},
	testEnvironment: 'jsdom',
	testMatch: [
		'**/tests/**/*.[jt]s?(x)', '**/?(*.)+.(spec|test).[jt]s?(x)',
	],
};
