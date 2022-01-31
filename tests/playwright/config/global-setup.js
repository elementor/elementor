// global-setup.js
const { chromium } = require( '@playwright/test' );

module.exports = async ( config ) => {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.goto( `${ config.projects[ 0 ].use.baseURL }/wp-admin` );

	await page.waitForSelector( 'text=Log In' );
	await page.fill( 'input[name="log"]', process.env.UNAME || 'admin' );
	await page.waitForTimeout( 500 );
	await page.fill( 'input[name="pwd"]', process.env.PASSWD || 'password' );
	await page.click( '#wp-submit' );
	await page.waitForSelector( 'text=Dashboard' );

	// Check if dismiss button is available and close it
	const dismissButton = await this.page.$( 'text=Dismiss' );

	if ( dismissButton ) {
		await page.click( 'Text=Dismiss' );
	}

	// Save signed-in state to 'storageState.json'.
	await page.context().storageState( { path: './tests/playwright/config/storageState.json' } );
	await browser.close();
};
	