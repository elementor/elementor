const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );

test( 'Ensure the old tabs widget is telling deprecation warning message', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();

	// Act.
	// Act.
	await editor.addWidget( 'tabs' );

	// Assert.
	await expect( editor.page.locator( '.elementor-control-raw-html.elementor-panel-alert.elementor-panel-alert-info' ) )
		.toContainText( 'You are currently editing a Tabs Widget in its old version.' );
} );
