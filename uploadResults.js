const fs = require( 'fs' );
const { Client } = require( '@elastic/elasticsearch' );

const esClient = new Client( {
	node: process.env.ELASTICSEARCH_NODE,
	auth: {
		apiKey: process.env.ELASTICSEARCH_API_KEY,
	},
} );

function removeANSI( text ) {
	return text.replace( /\u001b\[[0-9;]*m/g, '' );
}

async function run() {
	try {
		const rawData = fs.readFileSync( 'tests/playwright/test-results.json', 'utf-8' );
		const testResults = JSON.parse( rawData );

		const indexName = 'playwright-test-results';
		const bulkBody = [];
		const workflowName = process.env.WORKFLOW_NAME || 'Unknown Workflow';

		if ( testResults.suites && Array.isArray( testResults.suites ) ) {
			testResults.suites.forEach( ( suite ) => {
				const suiteTitle = suite.title || 'Untitled Suite';

				if ( suite.specs && Array.isArray( suite.specs ) ) {
					suite.specs.forEach( ( spec ) => {
						const specTitle = spec.title || 'Untitled Spec';
						const testName = `${ suiteTitle } / ${ specTitle }`;

						if ( spec.tests && Array.isArray( spec.tests ) ) {
							spec.tests.forEach( ( test ) => {
								if ( test.results && Array.isArray( test.results ) ) {
									test.results.forEach( ( result ) => {
										const status = result.status || 'unknown';
										const duration = result.duration || 0;
										const errorMessage = result.error ? removeANSI( result.error.message ) : null;
										const errorStack = result.error ? removeANSI( result.error.stack ) : null;
										const timestamp = new Date( result.startTime || Date.now() ).toISOString();
										const docId = `${ testName }-${ timestamp }`;

										bulkBody.push( {
											index: {
												_index: indexName,
												_id: docId,
											},
										} );
										bulkBody.push( {
											testFileLink: suiteTitle,
											specTitle,
											testName,
											status,
											duration,
											errorMessage,
											errorStack,
											timestamp,
											workflowName,
										} );
									} );
								}
							} );
						}
					} );
				}
			} );
		}

		if ( bulkBody.length > 0 ) {
			const bulkResponse = await esClient.bulk( { refresh: true, body: bulkBody } );

			if ( bulkResponse.body && bulkResponse.body.errors ) {
				bulkResponse.body.items.forEach( ( item, index ) => {
					if ( item.index && item.index.error ) {
						throw new Error( `Indexing error for document ${ index }: ${ JSON.stringify( item.index.error ) }` );
					}
				} );
			}
		}
	} catch ( error ) {
		throw new Error( `An error occurred: ${ error.message }` );
	}
}

void run();
