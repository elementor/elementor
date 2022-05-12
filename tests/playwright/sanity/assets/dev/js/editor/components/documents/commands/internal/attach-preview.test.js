const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../../../pages/wp-admin-page' );

test( `$e.run( 'editor/documents/attach-preview' ) - Ensure loaded in custom selector`, async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	await editor.addWidget( 'tabs' );

	// Attach-preview inside the tab as a custom selector.
	await editor.page.evaluate( () => {
		$e.internal( 'editor/documents/attach-preview', {
			selector: jQuery( elementor.getPreviewContainer().view.$el.find( '.elementor-tab-content' )[ 0 ] ),
		} );
	} );

	// Assert - Ensure the tabs are duplicated.
	const tabs = await editor.getPreviewFrame().$$( '.elementor-tab-title' );

	expect( tabs.length ).toBe( 4 );
} );

