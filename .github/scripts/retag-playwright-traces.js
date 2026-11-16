const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Allure's report UI only renders the embedded Playwright Trace Viewer for attachments
 * declared with this media type. allure-playwright 2.x tags traces as "application/zip",
 * so they have to be retagged here before `allure generate` runs.
 */
const PLAYWRIGHT_TRACE_TYPE = 'application/vnd.allure.playwright-trace';

const isPlaywrightTrace = ( attachment ) =>
	'trace' === attachment?.name &&
	'string' === typeof attachment.source &&
	attachment.source.endsWith( '.zip' );

function retagTraces( resultsDir ) {
	let retagged = 0;

	for ( const entry of fs.readdirSync( resultsDir ) ) {
		if ( ! entry.endsWith( '-result.json' ) ) {
			continue;
		}

		const entryPath = path.join( resultsDir, entry );
		const result = JSON.parse( fs.readFileSync( entryPath, 'utf8' ) );

		if ( ! Array.isArray( result.attachments ) ) {
			continue;
		}

		let changed = false;

		result.attachments = result.attachments.map( ( attachment ) => {
			if ( ! isPlaywrightTrace( attachment ) || PLAYWRIGHT_TRACE_TYPE === attachment.type ) {
				return attachment;
			}

			changed = true;
			retagged++;

			return { ...attachment, type: PLAYWRIGHT_TRACE_TYPE };
		} );

		if ( changed ) {
			fs.writeFileSync( entryPath, JSON.stringify( result ) );
		}
	}

	return retagged;
}

const resultsDir = process.argv[ 2 ];

if ( ! resultsDir ) {
	console.error( 'Usage: node retag-playwright-traces.js <allure-results-dir>' );
	process.exit( 1 );
}

if ( ! fs.existsSync( resultsDir ) ) {
	console.log( `No results directory at ${ resultsDir }, nothing to process.` );
	process.exit( 0 );
}

console.log( `Retagged ${ retagTraces( resultsDir ) } Playwright trace attachment(s).` );
