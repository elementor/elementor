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

test( 'Button controls should return to default', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	editor.addWidget( 'button' );

	await editor.getPreviewFrame().waitForSelector( 'a[role="button"]:has-text("Click here")' );

	// Act
	await editor.page.click( 'div.elementor-control-responsive-desktop:has-text("Alignment") label[data-tooltip="Center"]' );

	// Assert
	await expect( editor.getPreviewFrame().locator( 'div[data-element_type="widget"]' ) ).toHaveClass( /elementor-align-center/ );

	// Act
	await editor.page.click( 'div.elementor-control-responsive-desktop:has-text("Alignment") label[data-tooltip="Center"]' );

	// Assert
	await expect( editor.getPreviewFrame().locator( 'div[data-element_type="widget"]' ) ).not.toHaveClass( /elementor-align-center/ );
} );
