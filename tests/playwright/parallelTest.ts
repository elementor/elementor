import { request, test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createApiContext, createDefaultMedia, loginApi } from './assets/api-requests';
import { WindowType } from './types/types';

export * from '@playwright/test';
export const parallelTest = baseTest.extend< NonNullable<unknown>, { workerStorageState: string, workerBaseURL: string }>( {
	// Use the same storage state for all tests in this worker.
	baseURL: ( { workerBaseURL }, use ) => use( workerBaseURL ),
	workerBaseURL: [ async ( {}, _use, testInfo ) => {
		return 1 === testInfo.parallelIndex ? 'http://localhost:8889' : 'http://localhost:8888';
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

		// Important: make sure we authenticate in a clean environment by unsetting storage state.
		const baseURL = testInfo.project.use.baseURL;
		const cookies = await loginApi(
			process.env.USERNAME || 'admin',
			process.env.PASSWORD || 'password',
			baseURL,
		);
		const page = await browser.newPage( { storageState: undefined } );
		await page.context().addCookies( cookies );
		await page.goto( `${ baseURL }/wp-admin` );
		// Save the nonce and storage state in environment variables, to allow use them when creating the API context.
		const storageState = await page.context().storageState( { path: fileName } );

		let window: WindowType;
		const nonce = await page.evaluate( () => window.wpApiSettings.nonce );
		if ( process.env.WP_REST_NONCE ) {
			process.env.WP_REST_NONCE = [];
		}
		process.env.WP_REST_NONCE[ id ] = nonce;

		const imageIds = [];
		const image1 = {
			title: 'image1',
			extension: 'jpg',
		};
		const image2 = {
			title: 'image2',
			extension: 'jpg',
		};

		const apiContext = await createApiContext( request, {
			storageStateObject: storageState,
			wpRESTNonce: process.env.WP_REST_NONCE[ id ],
			baseURL,
		} );

		imageIds.push( await createDefaultMedia( apiContext, image1 ) );
		imageIds.push( await createDefaultMedia( apiContext, image2 ) );

		await page.close();

		await use( fileName );
	}, { scope: 'worker' } ],
} );
