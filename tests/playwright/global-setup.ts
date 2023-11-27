import { chromium, request, type FullConfig } from '@playwright/test';
import { createApiContext, createDefaultMedia, deleteDefaultMedia } from './assets/api-requests';

module.exports = async ( config: FullConfig ) => {
	const { baseURL, headless } = config.projects[ 0 ].use;

	const browser = await chromium.launch( { headless } );
	const page = await browser.newPage();

	await page.goto( `${ baseURL }/wp-admin` );

	await page.waitForSelector( 'text=Log In' );
	await page.fill( 'input[name="log"]', process.env.USERNAME || 'admin' );
	await page.fill( 'input[name="pwd"]', process.env.PASSWORD || 'password' );
	await page.click( '#wp-submit' );
	await page.waitForSelector( 'text=Dashboard' );

	// Save signed-in state to 'storageState.json'.
	const storageState = await page.context().storageState( { path: './storageState.json' } );

	// Save the nonce and storage state in environment variables, to allow use them when creating the API context.
	// @ts-ignore
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

	await browser.close();

	// Teardown function.
	return async () => {
		await deleteDefaultMedia( apiContext, imageIds );
	};
};
