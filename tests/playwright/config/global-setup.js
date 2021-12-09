// global-setup.js
const { chromium } = require( '@playwright/test' );

module.exports = async ( config ) => {
	const configCurrentUse = config.projects[ 0 ].use,
		browser = await chromium.launch( { headless: configCurrentUse.headless } ),
		page = await browser.newPage();

	await page.goto( `${ configCurrentUse.baseURL }/wp-admin` );

	await page.waitForSelector( 'text=Log In' );
	await page.fill( 'input[name="log"]', configCurrentUse.user.username );
	await page.fill( 'input[name="pwd"]', configCurrentUse.user.password );
	await page.click( 'text=Log In' );
	await page.waitForSelector( 'text=Dashboard' );

	// Save signed-in state to 'storageState.json'.
	await page.context().storageState( { path: configCurrentUse.storageStatePath } );

	await browser.close();
};
