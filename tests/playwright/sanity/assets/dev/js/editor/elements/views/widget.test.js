const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../pages/wp-admin-page' );

test.describe( `$e.run( 'editor/elements/views/widget' )`, () => {
	test( 'Check if the empty placeholder is displayed inside the Image Carousel', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'image-carousel' );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget-image-carousel .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-image-carousel .elementor-widget-empty-icon' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Sidebar widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'sidebar' );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-sidebar .elementor-widget-empty-icon' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Image Box widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'image-box' );
		await page.hover( '.elementor-control-image .elementor-control-media__content' );
		await page.hover( '.elementor-control-media-area' );
		await page.click( '.elementor-control-media__remove' );
		await page.locator( '.elementor-control-title_text input' ).fill( '' );
		await page.locator( '.elementor-control-description_text textarea' ).fill( '' );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-image-box > .elementor-widget-empty-icon.eicon-image-box' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Basic Gallery widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'image-gallery' );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-image-gallery .elementor-widget-empty-icon' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Video widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'video' );
		await page.selectOption( '.elementor-control-video_type >> select', 'hosted' );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-video .elementor-widget-empty-icon' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );

	test( 'Check if the empty placeholder is displayed inside the Google Maps widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'google_maps' );
		await page.locator( '.elementor-control-address input' ).fill( '' );
		await editor.page.waitForLoadState( 'domcontentloaded' );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget .elementor-widget-empty-icon' );

		const emptyViewPlaceholderCount = await editor.getPreviewFrame().locator( '.elementor-widget-google_maps .elementor-widget-empty-icon' ).count();

		// Assert.
		expect( emptyViewPlaceholderCount ).toBe( 1 );
	} );
} );
