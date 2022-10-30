const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../../../pages/wp-admin-page' );

test.only( `$e.run( 'editor/documents/attach-preview' ) - Ensure loaded in custom selector`, async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	await editor.addWidget( 'tabs' );
	await editor.getPreviewFrame().waitForSelector( '.elementor-tab-title.elementor-active' );

	// Attach-preview inside the tab as a custom selector.
	await editor.page.evaluate( () => {
		// `Attach-preview` is a `tab_content` of the widget tabs.
		$e.internal( 'editor/documents/attach-preview', {
			selector: '.elementor-tab-content',
		} );
	} );

	// Assert - Ensure the tabs are duplicated.
	const tabs = editor.getPreviewFrame().locator( '.elementor-tab-content .elementor-tab-title' );

	// Check if the duplicated content exist.
	expect( tabs ).toBeTruthy();
} );

