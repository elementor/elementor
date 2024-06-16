import { APIRequest, Browser, request, test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { WindowType } from './types/types';

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
	const storageState = await context.storageState( { path: storageStatePath } );
	await context.dispose();
	return storageState;
}

const extractNonce = async ( id: number, browser: Browser, storageState: {
	cookies: Array<{
		name: string;
		value: string;
		domain: string;
		path: string;
		expires: number;
		httpOnly: boolean;
		secure: boolean;
		sameSite: 'Strict' | 'Lax' | 'None'
	}>;
	origins: Array<{ origin: string; localStorage: Array<{ name: string; value: string }> }>
}, baseURL: string ) => {
	if ( ! process.env[ `WP_REST_NONCE_${ id }` ] ) {
		// Save the nonce in an environment variable, to allow use them when creating the API context.
		const page = await browser.newPage( { storageState } );
		try {
			await page.goto( `${ baseURL }/wp-admin` );
			let window: WindowType;
			process.env[ `WP_REST_NONCE_${ id }` ] = await page.evaluate( () => window.wpApiSettings.nonce );
		} finally {
			await page.close();
		}
	}
};

export const parallelTest = baseTest.extend< NonNullable<unknown>, { workerStorageState: string, workerBaseURL: string }>( {
	// Use the same storage state for all tests in this worker.
	baseURL: ( { workerBaseURL }, use ) => use( workerBaseURL ),
	workerBaseURL: [ async ( {}, use, testInfo ) => {
		await use( ( 1 === Number( testInfo.parallelIndex ) ) ? process.env.TEST_SERVER : process.env.DEV_SERVER );
	}, { scope: 'worker' } ],

	// Use the same storage state for all tests in this worker.
	storageState: ( { workerStorageState }, use ) => use( workerStorageState ),

	// Authenticate once per worker with a worker-scoped fixture.
	workerStorageState: [ async ( { browser }, use, testInfo ) => {
		// Use parallelIndex as a unique identifier for each worker.
		const id = testInfo.parallelIndex;
		const fileName = path.resolve( testInfo.project.outputDir, `.storageState-${ id }.json` );

		if ( fs.existsSync( fileName ) ) {
			// Reuse existing authentication state if any.
			await use( fileName );
			return;
		}

		// Send authentication request.
		const baseURL = ( 1 === Number( testInfo.parallelIndex ) ) ? process.env.TEST_SERVER : process.env.DEV_SERVER;
		const storageState = await loginApi(
			request,
			process.env.USERNAME || 'admin',
			process.env.PASSWORD || 'password',
			baseURL,
			fileName,
		);
		try {
			await extractNonce( id, browser, storageState, baseURL );
		} catch ( e ) {
			await extractNonce( id, browser, storageState, baseURL );
		}

		await use( fileName );
	}, { scope: 'worker' } ],
} );
