// const fs = require( 'fs' );
// const path = require( 'path' );
// const axios = require( 'axios' );
//
// const elasticsearchUrl = 'https://e8cfc4f31c5e424cb57b05743dcf4ab4.us-central1.gcp.cloud.es.io/';
// const index = 'playwright-test-results-v2';
//
// const resultsPath = path.resolve( __dirname, '../../test-results.json' );
//
// if ( ! fs.existsSync( resultsPath ) ) {
// 	console.error( `File ${ resultsPath } not found.` );
// 	process.exit( 1 );
// }
//
// let results;
// try {
// 	const rawData = fs.readFileSync( resultsPath, 'utf-8' );
// 	results = JSON.parse( rawData );
// } catch ( err ) {
// 	console.error( `Error reading or parsing file ${ resultsPath }:`, err );
// 	process.exit( 1 );
// }
//
// const failedTests = [];
//
// const isFailedStatus = ( status: string ) => {
// 	const failedStatuses = [ 'failed', 'timedOut', 'interrupted', 'unexpected' ];
// 	return failedStatuses.includes( status );
// };
//
// if ( results.suites && Array.isArray( results.suites ) ) {
// 	results.suites.forEach( ( suite: any ) => {
// 		if ( suite.specs && Array.isArray( suite.specs ) ) {
// 			suite.specs.forEach( ( spec: any ) => {
// 				spec.tests.forEach( ( test: any ) => {
// 					test.results.forEach( ( result: any ) => {
// 						if ( isFailedStatus( result.status ) ) {
// 							const failedTest = {
// 								suite: suite.title,
// 								test: `${ spec.title } - ${ test.title }`,
// 								status: result.status,
// 								duration: result.duration,
// 								file: result.error?.location?.file || spec.file,
// 								line: result.error?.location?.line || spec.line,
// 								column: result.error?.location?.column || spec.column,
// 								error: result.error?.message || 'Unknown error',
// 								timestamp: result.startTime,
// 							};
// 							failedTests.push( failedTest );
// 						}
// 					} );
// 				} );
// 			} );
// 		}
// 	} );
// } else {
// 	console.warn( 'No "suites" section found or it is not an array.' );
// }
//
// if ( failedTests.length > 0 ) {
// 	console.log( 'Failed tests:', failedTests.length );
//
// 	failedTests.forEach( async ( test ) => {
// 		try {
// 			await axios.post( `${ elasticsearchUrl }/${ index }/_doc`, test );
// 			console.log( `Sent test: ${ test.test }` );
// 		} catch ( error ) {
// 			console.error( 'Error sending data to Elasticsearch:', error );
// 		}
// 	} );
// } else {
// 	console.log( 'All tests passed successfully.' );
// }
