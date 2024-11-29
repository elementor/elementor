const fs = require( 'fs' );
const { Client } = require( '@elastic/elasticsearch' );

const esClient = new Client( {
	node: 'https://7b37ac31dc964212bb4a3e868ee14896.us-central1.gcp.cloud.es.io:443',
	auth: {
		apiKey: 'UDVjblg1TUI2NkhqYUtaWDJScUI6SUdYSjh0Qm9TSWlZcUVNdkJTVFVhZw==',
	},
} );

function removeANSI( text ) {
	return text.replace( /\u001b\[[0-9;]*m/g, '' );
}

async function run() {
	const rawData = fs.readFileSync( 'tests/playwright/test-results.json', 'utf-8' );
	const testResults = JSON.parse( rawData );

	const indexName = 'playwright-test-results-v2';

	const bulkBody = [];

	if ( testResults.suites && Array.isArray( testResults.suites ) ) {
		testResults.suites.forEach( ( suite ) => {
			const suiteTitle = suite.title || 'Untitled Suite';

			// Iterate through each spec within the suite
			if ( suite.specs && Array.isArray( suite.specs ) ) {
				suite.specs.forEach( ( spec ) => {
					const specTitle = spec.title || 'Untitled Spec';

					// Create a testName
					const testName = `${ specTitle }`;

					// Iterate through each test within the spec
					if ( spec.tests && Array.isArray( spec.tests ) ) {
						spec.tests.forEach( ( test ) => {
							// Iterate through each result within the test (handles retries)
							if ( test.results && Array.isArray( test.results ) ) {
								test.results.forEach( ( result ) => {
									const status = result.status || 'unknown';
									const duration = result.duration || 0;
									const errorMessage = result.error ? removeANSI( result.error.message ) : null;
									const errorStack = result.error ? removeANSI( result.error.stack ) : null;
									const timestamp = new Date( result.startTime || Date.now() ).toISOString();

									// Use unique ID to ensure each test run is recorded separately
									const docId = `${ testName }-${ timestamp }`;

									// Add index action and corresponding document to the bulk body
									bulkBody.push( {
										index: {
											_index: indexName,
											_id: docId, // Use unique ID for each document
										},
									} );
									bulkBody.push( {
										suiteTitle,
										specTitle,
										testName,
										status,
										duration,
										errorMessage,
										errorStack,
										timestamp,
									} );
								} );
							}
						} );
					}
				} );
			}
		} );
	}

	await esClient.bulk( { refresh: true, body: bulkBody } );
}

run();
