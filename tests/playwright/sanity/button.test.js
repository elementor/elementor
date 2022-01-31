const { test, expect } = require( '@playwright/test' );
const { WpAdminPage } = require( '../pages/wp-admin-page.js' );

test( 'Button widget sanity test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );

	await wpAdmin.login();

	const editor = await wpAdmin.useElementorCleanPost();

	await editor.addWidget( 'button' );

	const button = await editor.previewFrame.waitForSelector( 'a[role="button"]:has-text("Click here")' );

	expect( await button.innerText() ).toBe( 'Click here' );
} );
