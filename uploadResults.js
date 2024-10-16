const fs = require( 'fs' );
const { Client } = require( '@elastic/elasticsearch' );

const esClient = new Client( { node: 'http://localhost:9200' } );

function removeANSI( text ) {
	return text.replace( /\u001b\[[0-9;]*m/g, '' );
}

async function run() {
	try {
		// Read and parse the test results file
		const rawData = fs.readFileSync( 'test-results.json', 'utf-8' );
		const testResults = JSON.parse( rawData );

		// Define the Elasticsearch index name
		const indexName = 'playwright-test-results';

		// Prepare the bulk indexing body
		const bulkBody = [];

		// Iterate through each suite in the test results
		if ( testResults.suites && Array.isArray( testResults.suites ) ) {
			testResults.suites.forEach( ( suite ) => {
				const suiteTitle = suite.title || 'Untitled Suite';

				// Iterate through each spec within the suite
				if ( suite.specs && Array.isArray( suite.specs ) ) {
					suite.specs.forEach( ( spec ) => {
						const specTitle = spec.title || 'Untitled Spec';

						// Combine suiteTitle and specTitle to form a unique testName
						const testName = `${ suiteTitle } / ${ specTitle }`;

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

		// Check if there is data to index
		if ( bulkBody.length > 0 ) {
			// Perform bulk indexing to Elasticsearch
			const bulkResponse = await esClient.bulk( { refresh: true, body: bulkBody } );

			// Check for any errors in the bulk response
			if ( bulkResponse.body && bulkResponse.body.errors ) {
				bulkResponse.body.items.forEach( ( item, index ) => {
					if ( item.index && item.index.error ) {
						console.error( `Indexing error for document ${ index }:`, item.index.error );
					}
				} );
			}
		}
	} catch ( error ) {
		console.error( 'An error occurred:', error );
	}
}

run();
