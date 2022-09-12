const { test, expect } = require('@playwright/test');
const WpAdminPage = require('../../../../../../../pages/wp-admin-page');

test.describe( `$e.run( 'editor/elements/views/widget' )`, () => {
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

	test( 'Check if the empty placeholder is displayed in the Portfolio widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'portfolio' );
		await page.click( '.elementor-control-section_query' );
		await page.selectOption( '.elementor-group-control-related-query >> select', 'by_id' );

		const emptyViewPlaceholder = editor.getPreviewFrame().locator( '.elementor-widget-portfolio .elementor-widget-empty-icon' );

		// Assert.
		await expect( emptyViewPlaceholder ).toHaveCount( 1 );
	} );

	test( 'Check if the empty placeholder is displayed in the Nav Menu widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'nav-menu' );

		const emptyViewPlaceholder = editor.getPreviewFrame().locator( '.elementor-widget-nav-menu .elementor-widget-empty-icon' );

		// Assert.
		await expect( emptyViewPlaceholder ).toHaveCount( 1 );
	} );

	test( 'Check if the empty placeholder is displayed in the Sidebar widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'sidebar' );

		const emptyViewPlaceholder = editor.getPreviewFrame().locator( '.elementor-widget-sidebar .elementor-widget-empty-icon' );

		// Assert.
		await expect( emptyViewPlaceholder ).toHaveCount( 1 );
	} );

	test( 'Check if the empty placeholder is displayed in the Image Box widget', async ( { page }, testInfo ) => {
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

		const emptyViewPlaceholder = editor.getPreviewFrame().locator( '.elementor-widget-image-box .elementor-widget-empty-icon' );

		// Assert.
		await expect( emptyViewPlaceholder ).toHaveCount( 1 );
	} );

	test( 'Check if the empty placeholder is displayed in the Basic Gallery widget', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost();

		// Act.
		await editor.addWidget( 'basic-gallery' );
		await page.hover( '.elementor-control-image .elementor-control-media__content' );
		await page.hover( '.elementor-control-media-area' );
		await page.click( '.elementor-control-media__remove' );
		await page.locator( '.elementor-control-title_text input' ).fill( '' );
		await page.locator( '.elementor-control-description_text input' ).fill( '' );		

		const emptyViewPlaceholder = editor.getPreviewFrame().locator( '.elementor-widget-basic-gallery .elementor-widget-empty-icon' );

		// Assert.
		await expect( emptyViewPlaceholder ).toHaveCount( 1 );
	} );
} );
