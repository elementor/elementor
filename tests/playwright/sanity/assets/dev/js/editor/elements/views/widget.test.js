const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../pages/wp-admin-page' );

test( 'Check if the empty placeholder is displayed in the Image Carousel', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addWidget( 'image-carousel' );

    const emptyViewPlaceholder = editor.getPreviewFrame().locator( '.elementor-widget-image-carousel .elementor-widget-empty-icon' );

	// Assert.
    await expect( emptyViewPlaceholder ).toHaveCount( 1 );
} );
