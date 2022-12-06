import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PluginsTester } from './src/PluginsTester.js';
import { Logger } from './src/Logger.js';
import topPluginsConfig from './config/plugins.js';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

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

const pluginsToTest = getConfig( {
	envVar: 'PLUGINS_TESTER__PLUGINS_TO_TEST',
	default: topPluginsConfig,
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
