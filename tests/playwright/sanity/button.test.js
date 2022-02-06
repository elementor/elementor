const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test( 'Button widget sanity test', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addWidget( 'button' );

	const button = await editor.getPreviewFrame().waitForSelector( 'a[role="button"]:has-text("Click here")' );

	// Assert.
	expect( await button.innerText() ).toBe( 'Click here' );
} );
