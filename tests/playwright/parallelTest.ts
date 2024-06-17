import { APIRequest, request, test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import ApiRequests from './assets/api-requests';

export async function loginApi( apiRequest: APIRequest, user: string, pw: string, url: string, storageStatePath?: string ) {
	// Important: make sure we authenticate in a clean environment by unsetting storage state.
	const context = await apiRequest.newContext( { storageState: undefined } );

	await context.post( `${ url }/wp-login.php`, {
		form: {
			log: user,
			pwd: pw,
			'wp-submit': 'Log In',
			redirect_to: `${ url }/wp-admin/`,
			testcookie: '1',
		},
	} );
	await context.storageState( { path: storageStatePath } );
	await context.dispose();
}

export const parallelTest = baseTest.extend< NonNullable<unknown>, { workerStorageState: string, workerBaseURL: string, apiRequests: ApiRequests }>( {
	// Use the same storage state for all tests in this worker.
	baseURL: ( { workerBaseURL }, use ) => use( workerBaseURL ),
	workerBaseURL: [ async ( {}, use, testInfo ) => {
		await use( ( 1 === Number( testInfo.parallelIndex ) ) ? process.env.TEST_SERVER : process.env.DEV_SERVER );
	}, { scope: 'worker' } ],

	// Use the same storage state for all tests in this worker.
	storageState: ( { workerStorageState }, use ) => use( workerStorageState ),

	// Authenticate once per worker with a worker-scoped fixture.
	workerStorageState: [ async ( { workerBaseURL }, use, testInfo ) => {
		// Use parallelIndex as a unique identifier for each worker.
		const id = testInfo.parallelIndex;
		const fileName = path.resolve( testInfo.project.outputDir, `.storageState-${ id }.json` );

		if ( fs.existsSync( fileName ) ) {
			// Reuse existing authentication state if any.
			await use( fileName );
			return;
		}

		// Send authentication request.
		await loginApi(
			request,
			process.env.USERNAME || 'admin',
			process.env.PASSWORD || 'password',
			workerBaseURL,
			fileName,
		);

		await use( fileName );
	}, { scope: 'worker' } ],

	// Use the same storage state for all tests in this worker.
	apiRequests: [ async ( {}, use ) => {
		const context = await request.newContext();
		const response = await context.get( '/wp-admin/post-new.php' );

		if ( ! response.ok() ) {
			throw new Error( `
				Failed to fetch nonce: ${ response.status() }.
				${ await response.text() }
				${ response.url() }
				TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
			` );
		}
		const pageText = await response.text();
		const nonceMatch = pageText.match( /var wpApiSettings = .*;/ );
		if ( ! nonceMatch ) {
			throw new Error( `Nonce not found on the page:\n"${ pageText }"` );
		}

		let nonce = nonceMatch[ 0 ];
		nonce = nonce.replace( /^.*"nonce":"([^"]*)".*$/, '$1' );
		const apiRequests = new ApiRequests( nonce );
		await use( apiRequests );
	}, { scope: 'worker' } ],

} );
