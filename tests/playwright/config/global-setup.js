const { chromium } = require( '@playwright/test' );

module.exports = async ( config ) => {
	config = config.projects[ 0 ].use;

	const browser = await chromium.launch( { headless: config.headless } ),
		page = await browser.newPage();

	await page.goto( `${ config.baseURL }/wp-admin` );

	await page.waitForSelector( 'text=Log In' );
	await page.fill( 'input[name="log"]', config.user.username );
	await page.fill( 'input[name="pwd"]', config.user.password );
	await page.click( '#wp-submit' );
	await page.waitForSelector( 'text=Dashboard' );
	process.env.WP_REST_NONCE = await page.evaluate( () => window.wpApiSettings.nonce );

	// Save signed-in state to 'storageState.json'.
	const storageState = await page.context().storageState( { path: config.storageState } );

	// Save the nonce and storage state in environment variables, to allow use them when creating the API context.
	process.env.WP_REST_NONCE = await page.evaluate( () => window.wpApiSettings.nonce );
	process.env.STORAGE_STATE = JSON.stringify( storageState );
	process.env.BASE_URL = config.baseURL;

	await browser.close();
};
