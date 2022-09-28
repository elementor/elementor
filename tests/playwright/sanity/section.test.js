const { test, expect } = require( '@playwright/test' );
const { getElementSelector } = require( '../assets/elements-utils' );
const WpAdminPage = require( '../pages/wp-admin-page' );

test.describe( 'Section tests', () => {
	test( 'Display Google Map inside section at 40%', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
            editor = await wpAdmin.useElementorCleanPost();

		// Act.
		const mapsWidget = await editor.addWidget( 'google_maps' ),
            widgetElement = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + mapsWidget );

		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );
		await page.waitForLoadState( 'networkidle' );

		// Assert.
		expect( await widgetElement.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'maps-40%.jpeg' );
	} );

    test( 'Display Video inside section at 40%', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
            editor = await wpAdmin.useElementorCleanPost();

		// Act.
		const videoWidget = await editor.addWidget( 'video' ),
            widgetElement = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + videoWidget );

		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );
		await page.waitForLoadState( 'networkidle' );

		// Assert.
		expect( await widgetElement.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'video-40%.jpeg' );
	} );
} );
