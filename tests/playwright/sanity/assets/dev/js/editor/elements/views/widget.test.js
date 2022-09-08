const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../pages/wp-admin-page' );

test( 'Empty widget placeholder sanity test', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addWidget( 'image-carousel' );

    const emptyViewPlaceholder = editor.getPreviewFrame().locator( '.elementor-widget-image-carousel .elementor-widget-empty-icon' );

	// Assert.
    await expect( emptyViewPlaceholder ).toHaveCount( 1 );
} );
