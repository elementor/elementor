const { chromium } = require( '@playwright/test' );

module.exports = async ( config ) => {
	config = config.projects[ 0 ].use;

	const browser = await chromium.launch( { headless: config.headless } ),
		context = await browser.newContext(),
		page = await context.newPage();

	await page.goto( `${ config.baseURL }wp-admin` );

	await page.waitForSelector( 'text=Log In' );

	await page.waitForTimeout( 500 );

	await page.fill( 'input[name="log"]', config.user.username );
	await page.fill( 'input[name="pwd"]', config.user.password );
	await page.click( '#wp-submit' );
	await page.waitForSelector( 'text=Dashboard' );

	// Save signed-in state to 'storageState.json'.
	await page.context().storageState( { path: config.storageState } );

	await context.close();
};
