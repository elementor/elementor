const fs = require( 'fs' );
const { Client } = require( '@elastic/elasticsearch' );

// Create Elasticsearch client
const esClient = new Client( { node: 'http://localhost:9200' } );

// Function to remove ANSI codes from text
function removeANSI( text ) {
	return text.replace(
		/\u001b\[[0-9;]*m/g,
		'',
	);
}

// Function to process and upload test results to Elasticsearch
async function run() {
	try {
		// Read and parse the test results file
		const rawData = fs.readFileSync( 'test-results.json', 'utf-8' );
		const testResults = JSON.parse( rawData );

		// Define the Elasticsearch index name
		const indexName = 'playwright-test-results';

		// Check if the index exists in Elasticsearch
		const existsResponse = await esClient.indices.exists( { index: indexName } );
		const exists = existsResponse.body; // For version 7.x returns { body: true/false, ... }

		if ( ! exists ) {
			// Create the index with the specified mapping if it does not exist
			await esClient.indices.create( {
				index: indexName,
				body: {
					mappings: {
						properties: {
							suiteTitle: { type: 'keyword' },
							specTitle: { type: 'keyword' },
							testName: { type: 'keyword' },
							status: { type: 'keyword' },
							duration: { type: 'long' },
							errorMessage: { type: 'text' },
							errorStack: { type: 'text' },
							timestamp: { type: 'date' },
						},
					},
				},
			} );
		}

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

										// Add index action and corresponding document to the bulk body
										bulkBody.push( {
											index: { _index: indexName },
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
		// Log any unexpected errors that occur during the process
		console.error( 'An error occurred:', error );
	}
}

// Execute the run function
run();
