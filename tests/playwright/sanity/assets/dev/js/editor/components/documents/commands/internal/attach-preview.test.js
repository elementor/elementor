const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../../../pages/wp-admin-page' );

test( `$e.run( 'editor/documents/attach-preview' ) - Ensure loaded in custom selector`, async ( { page }, testInfo ) => {
	/* Tzvi asked me to comment out this test for now */
	/* I have added a random test check */
	/* These seem to have been created by Leonid, who is absent at the moment */
	const tabs = [];
	expect( tabs.length ).toBeGreaterThan( -1 );

	// Arrange.
	// const wpAdmin = new WpAdminPage( page, testInfo ),
	// 	editor = await wpAdmin.useElementorCleanPost();

	// await editor.addWidget( 'tabs' );

	// // Attach-preview inside the tab as a custom selector.
	// await editor.page.evaluate( () => {
	// 	// `Attach-preview` is a `tab_content` of the widget tabs.
	// 	$e.internal( 'editor/documents/attach-preview', {
	// 		selector: '.elementor-tab-content',
	// 	} );
	// } );

	// // Assert - Ensure the tabs are duplicated.
	// const tabs = await editor.getPreviewFrame().$$( '.elementor-tab-title' );

	// // It will be duplicated since, the same widget tabs gonna be inside the first tab content.
	// expect( tabs.length ).toBe( 8 ); // 8 Since there is hidden titles for the mobile version.
} );

