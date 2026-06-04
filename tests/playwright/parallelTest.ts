import { request, test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fetchNonce, login } from './wp-authentication';
import ApiRequests from './assets/api-requests';
import { config, cfHeaders } from './config/env';

export const parallelTest = baseTest.extend< NonNullable<unknown>, { workerStorageState: string, workerBaseURL: string, apiRequests: ApiRequests }>( {
	baseURL: ( { workerBaseURL }, use ) => use( workerBaseURL ),

	workerBaseURL: [ async ( {}, use ) => {
		// Worker index 1 gets the test server; all others get the dev server.
		const url = 1 === Number( process.env.TEST_PARALLEL_INDEX )
			? config.wp.testServerURL
			: config.wp.baseURL;
		await use( url );
	}, { scope: 'worker' } ],

	storageState: ( { workerStorageState }, use ) => use( workerStorageState ),

	// Authenticate once per worker; CF headers are included for stg/prod environments.
	workerStorageState: [ async ( { workerBaseURL }, use, testInfo ) => {
		const id = testInfo.workerIndex;
		const fileName = path.resolve( testInfo.project.outputDir, `.storageState-${ id }.json` );

		if ( fs.existsSync( fileName ) ) {
			await use( fileName );
			return;
		}

		const context = await login(
			request,
			config.wp.username,
			config.wp.password,
			workerBaseURL,
			cfHeaders,
		);
		await context.storageState( { path: fileName } );
		await context.dispose();

		await use( fileName );
	}, { scope: 'worker' } ],

	// API request context also carries CF headers so WP REST calls work behind CF Zero Trust.
	apiRequests: [ async ( { workerStorageState, workerBaseURL }, use ) => {
		const context = await request.newContext( {
			storageState: workerStorageState,
			extraHTTPHeaders: cfHeaders,
		} );
		try {
			const nonce = await fetchNonce( context, workerBaseURL );
			const apiRequests = new ApiRequests( workerBaseURL, nonce );
			await use( apiRequests );
		} catch ( e ) {
			throw new Error(
				`Failed to fetch Nonce. Base URL: ${ workerBaseURL }, Storage State: ${ workerStorageState }`,
				{ cause: e },
			);
		}
	}, { scope: 'worker' } ],
} );
