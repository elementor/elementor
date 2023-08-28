import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PluginsTester } from './src/PluginsTester.js';
import { Logger } from './src/Logger.js';
import topPluginsConfig from './config/plugins.js';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );
let _default = topPluginsConfig;

const logger = new Logger( {
	debug: true,
} );

const getConfig = ( args ) => {
	if ( process.env[ args.envVar ] ) {
		args.logger.log( 'Get config from process.env.' + args.envVar );

		return process.env[ args.envVar ].split( ',' );
	}

	return args.default;
};

if ( 'part1' === process.env.TEST_SUITE ) {
	_default = topPluginsConfig.slice( 0, topPluginsConfig.length / 2 );
}

if ( 'part2' === process.env.TEST_SUITE ) {
	_default = topPluginsConfig.slice( topPluginsConfig.length / 2, topPluginsConfig.length );
}

const pluginsToTest = getConfig( {
	envVar: 'PLUGINS_TESTER__PLUGINS_TO_TEST',
	default: _default,
	logger,
} );

const diffThreshold = getConfig( {
	envVar: 'PLUGINS_TESTER__DIFF_THRESHOLD',
	default: 0.9,
	logger,
} );

logger.log(
	pluginsToTest.length + ' plugins',
	pluginsToTest,
	'diffThreshold',
	diffThreshold,
);

new PluginsTester( {
	runServer: ! process.env.CI,
	debug: true,
	pluginsToTest,
	diffThreshold,
	cwd: __dirname,
	logger,
} );
