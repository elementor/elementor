const { chromium } = require( '@playwright/test' );

module.exports = async ( config ) => {
	config = config.projects[ 0 ].use;

	const browser = await chromium.launch( { headless: config.headless } ),
		page = await browser.newPage();

	await page.goto( `${ config.baseURL }/wp-admin`, { waitUntil : 'networkidle' } );

	await page.waitForSelector( 'text=Log In' );
	await page.type( 'input[name="log"]', config.user.username, { delay : 100 }  );
	await page.type( 'input[name="pwd"]', config.user.password, { delay : 100 }  );
	await page.click( '#wp-submit' );
	await page.waitForSelector( 'text=Dashboard' );

	// Save signed-in state to 'storageState.json'.
	await page.context().storageState( { path: config.storageState } );

	await browser.close();
};
