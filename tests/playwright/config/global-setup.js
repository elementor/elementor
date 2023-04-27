const { chromium, request } = require( '@playwright/test' );
const { createApiContext, createDefaultMedia, deleteDefaultMedia } = require( '../assets/api-requests' );

module.exports = async ( config ) => {
	config = config.projects[ 0 ].use;

	const browser = await chromium.launch( { headless: config.headless } );
	const page = await browser.newPage();

	await page.goto( `${ config.baseURL }/wp-admin` );

	await page.waitForSelector( 'text=Log In' );
	await page.fill( 'input[name="log"]', config.user.username );
	await page.fill( 'input[name="pwd"]', config.user.password );
	await page.click( '#wp-submit' );
	await page.waitForSelector( 'text=Dashboard' );

	// Save signed-in state to 'storageState.json'.
	const storageState = await page.context().storageState( { path: config.storageState } );

	// Save the nonce and storage state in environment variables, to allow use them when creating the API context.
	process.env.WP_REST_NONCE = await page.evaluate( () => window.wpApiSettings.nonce );
	process.env.STORAGE_STATE = JSON.stringify( storageState );
	process.env.BASE_URL = config.baseURL;

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
		baseURL: config.baseURL,
	} );

	imageIds.push( await createDefaultMedia( apiContext, image1 ) );
	imageIds.push( await createDefaultMedia( apiContext, image2 ) );

	await browser.close();

	// Teardown function.
	return async () => {
		await deleteDefaultMedia( apiContext, imageIds );
	};
};
