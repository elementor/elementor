const { chromium } = require( '@playwright/test' );
const WpAdminPage = require( './lib/pages/wp-admin-page.js' );

module.exports = async ( config ) => {
	config = config.projects[ 0 ].use;

	const browser = await chromium.launch( { headless: config.headless } ),
		page = await browser.newPage( { baseURL: config.baseURL } );

	await login( page, {
		username: config.user.username,
		password: config.user.password,
		storageState: config.storageState,
	} );

	await browser.close();
};

/**
 * @param {import('@playwright/test').Page} page
 * @param {Object}                          config
 * @param {string}                          config.username
 * @param {string}                          config.password
 * @param {string}                          config.storageState
 * @return {Promise<void>}
 */
async function login( page, { username, password, storageState } ) {
	const wpAdminPage = new WpAdminPage( page );
	await wpAdminPage.login( { username, password } );

	// Save signed-in state to 'storageState.json'.
	await page.context().storageState( { path: storageState } );
}
