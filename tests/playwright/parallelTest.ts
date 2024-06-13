import { request, test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createApiContext, createDefaultMedia, loginApi } from './assets/api-requests';
import { WindowType } from './types/types';

export * from '@playwright/test';
export const parallelTest = baseTest.extend< NonNullable<unknown>, { workerStorageState: string }>( {
	// Use the same storage state for all tests in this worker.
	storageState: ( { workerStorageState }, use ) => use( workerStorageState ),

	// Authenticate once per worker with a worker-scoped fixture.
	workerStorageState: [ async ( { browser }, use ) => {
		// Use parallelIndex as a unique identifier for each worker.
		const id = test.info().parallelIndex;
		const fileName = path.resolve( test.info().project.outputDir, `.storageState-${ id }.json` );

		if ( fs.existsSync( fileName ) ) {
			// Reuse existing authentication state if any.
			await use( fileName );
			return;
		}

		// Important: make sure we authenticate in a clean environment by unsetting storage state.
		const baseURL = test.info().project.use.baseURL;
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
		await page.close();

		let window: WindowType;
		process.env.WP_REST_NONCE = await page.evaluate( () => window.wpApiSettings.nonce );
		process.env.STORAGE_STATE = JSON.stringify( storageState );
		process.env.BASE_URL = baseURL;

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
			wpRESTNonce: process.env.WP_REST_NONCE,
			baseURL,
		} );

		imageIds.push( await createDefaultMedia( apiContext, image1 ) );
		imageIds.push( await createDefaultMedia( apiContext, image2 ) );

		await use( fileName );
	}, { scope: 'worker' } ],
} );
