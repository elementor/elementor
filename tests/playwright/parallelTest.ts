import { request, test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fetchNonce, login } from './wp-authentication';
import ApiRequests from './assets/api-requests';

export const parallelTest = baseTest.extend< NonNullable<unknown>, { workerStorageState: string, workerBaseURL: string, apiRequests: ApiRequests }>( {
	// Use the same storage state for all tests in this worker.
	baseURL: ( { workerBaseURL }, use ) => use( workerBaseURL ),
	workerBaseURL: [ async ( {}, use ) => {
		await use( process.env.BASE_URL || ( ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) )
			? process.env.TEST_SERVER
			: process.env.DEV_SERVER ),
		);
	}, { scope: 'worker' } ],

	// Use the same storage state for all tests in this worker.
	storageState: ( { workerStorageState }, use ) => use( workerStorageState ),

	// Authenticate once per worker with a worker-scoped fixture.
	workerStorageState: [ async ( { workerBaseURL }, use, testInfo ) => {
		// Use parallelIndex as a unique identifier for each worker.
		const id = testInfo.workerIndex;
		const fileName = path.resolve( testInfo.project.outputDir, `.storageState-${ id }.json` );

		if ( fs.existsSync( fileName ) ) {
			// Reuse existing authentication state if any.
			await use( fileName );
			return;
		}

		// Send authentication request.
		const context = await login( request, process.env.USERNAME || 'admin', process.env.PASSWORD || 'password', workerBaseURL );
		await context.storageState( { path: fileName } );
		await context.dispose();

		await use( fileName );
	}, { scope: 'worker' } ],

	// Use the same storage state for all tests in this worker.
	apiRequests: [ async ( { workerStorageState, workerBaseURL }, use ) => {
		const context = await request.newContext( { storageState: workerStorageState } );
		try {
			const nonce = await fetchNonce( context, workerBaseURL );
			const apiRequests = new ApiRequests( workerBaseURL, nonce );
			await use( apiRequests );
		} catch ( e ) {
			throw new Error( `Failed to fetch Nonce. Base URL: ${ workerBaseURL }, Storage State: ${ workerStorageState } `, { cause: e } );
		}
	}, { scope: 'worker' } ],

} );
