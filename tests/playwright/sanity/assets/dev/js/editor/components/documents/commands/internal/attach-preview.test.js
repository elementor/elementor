const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../../../pages/wp-admin-page' );

test( `$e.run( 'editor/documents/attach-preview' ) - Ensure loaded in custom selector`, async ( { page }, testInfo ) => {
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
	await expect( editor.getPreviewFrame().locator( '.elementor-tab-content .elementor-tabs-wrapper .elementor-tab-title.elementor-active' ) ).toBeVisible();
	const tabCount = await editor.getPreviewFrame().locator( '.elementor-tab-title' ).count();

	// It will be duplicated since, the same widget tabs gonna be inside the first tab content.
	expect( tabCount ).toBe( 8 ); // 8 Since there is hidden titles for the mobile version.
} );

