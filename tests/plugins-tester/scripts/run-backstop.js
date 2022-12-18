// eslint-disable-next-line
import backstop from 'backstopjs'; // It's not included in global package.json.
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mergeReportFromDir } from '../src/merge-images-utils.js';
import config from '../backstop.json' assert {type: 'json'};

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

// Extract all arg and split to key => value
const args = process.argv.slice( 2 ).reduce( ( acc, arg ) => {
	const [ key, value ] = arg.replace( /^--/, '' ).split( '=' );
	acc[ key ] = value;
	return acc;
}, {} );

// Config
const { slug, diffThreshold } = args;

const backstopConfig = Object.assign( config, {
	paths: {
		bitmaps_reference: 'backstop_data/bitmaps_reference',
		engine_scripts: 'backstop_data/engine_scripts',
		bitmaps_test: 'reports/' + slug + '/backstop_data/bitmaps_test',
		html_report: 'reports/' + slug + '/backstop_data/html_report',
		ci_report: 'reports/' + slug + '/backstop_data/ci_report',
	},
} );

backstopConfig.scenarios.forEach( ( scenario ) => {
	scenario.misMatchThreshold = diffThreshold;
} );

// Run test
backstop( 'test', { config } )
	.then( () => {
		// eslint-disable-next-line no-console
		console.log( 'Results: Success' );
		process.exit( 0 );
	} )
	.catch( async () => {
		await mergeReportFromDir( __dirname + '/../reports/' + slug );
		process.exit( 1 );
	} );
