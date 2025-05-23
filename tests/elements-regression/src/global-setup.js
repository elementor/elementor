const { chromium, request } = require( '@playwright/test' );
const fs = require( 'fs' );
const path = require( 'path' );
const WpAdminPage = require( './pages/wp-admin-page.js' );
const mediaStore = require( './media-store' );

module.exports = async ( { projects: [ { use: config } ] } ) => {
	const { page, browser } = await createPage( {
		headless: config.headless,
		baseURL: config.baseURL,
	} );

	const { storageStateObject, wpRESTNonce } = await login( page, {
		username: config.user.username,
		password: config.user.password,
		storageState: config.storageState,
	} );

	const apiContext = await createApiContext( {
		storageStateObject,
		wpRESTNonce,
		baseURL: config.baseURL,
	} );

	const removeDefaultMedia = await createDefaultMedia( apiContext );

	await browser.close();

	// Teardown function.
	return async () => {
		await removeDefaultMedia();
	};
};

/**
 * @param {Object}  config
 * @param {boolean} config.headless
 * @param {string}  config.baseURL
 * @return {Promise<{browser: import('@playwright/test').Browser, page: import('@playwright/test').Page}>}
 */
async function createPage( { headless, baseURL } ) {
	const browser = await chromium.launch( { headless } ),
		page = await browser.newPage( { baseURL } );

	return { page, browser };
}

/**
 * @param {Object} config
 * @param {Object} config.storageStateObject
 * @param {string} config.wpRESTNonce
 * @param {string} config.baseURL
 * @return {Promise<import('@playwright/test').APIRequestContext>}
 */
async function createApiContext( { storageStateObject, wpRESTNonce, baseURL } ) {
	const context = await request.newContext( {
		baseURL,
		storageState: storageStateObject,
		extraHTTPHeaders: {
			'X-WP-Nonce': wpRESTNonce,
		},
	} );

	return context;
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {Object}                          config
 * @param {string}                          config.username
 * @param {string}                          config.password
 * @param {string}                          config.storageState
 * @return {Promise<{storageStateObject: Object, wpRESTNonce: string}>} The storge state.
 */
async function login( page, { username, password, storageState } ) {
	const wpAdminPage = new WpAdminPage( page );
	await wpAdminPage.login( { username, password } );

	const wpRESTNonce = await wpAdminPage.getWpRESTNonce();

	// Save signed-in state to 'storageState.json'.
	const storageStateObject = await page.context().storageState( { path: storageState } );

	return { storageStateObject, wpRESTNonce };
}

/**
 * @param {import('@playwright/test').APIRequestContext} apiContext
 * @return {Promise<Function>} teardown function
 */
async function createDefaultMedia( apiContext ) {
	const imageName = 'elementor.png';

	const response = await apiContext.post( '/index.php', {
		params: { rest_route: '/wp/v2/media' },
		multipart: {
			file: fs.createReadStream( path.resolve( __dirname, `../assets/images/${ imageName }` ) ),
			title: 'Elementor image',
			status: 'publish',
			description: 'Elementor image description',
			alt_text: 'Elementor image alt text',
			caption: 'Elmentor image caption',
		},
	} );

	if ( ! response.ok() ) {
		throw new Error( `
			Failed to create default media: ${ response.status() }.
			${ await response.text() }
		` );
	}

	const { id } = await response.json();

	// Pass the id that was uploaded to the tests.
	mediaStore.set( imageName, id );

	return async () => {
		await apiContext.delete( `/index.php`, {
			params: {
				rest_route: `/wp/v2/media/${ id }`,
				force: 1,
			},
		} );
	};
}
