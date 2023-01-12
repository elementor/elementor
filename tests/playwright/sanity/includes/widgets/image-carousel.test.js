const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );

test( 'Image Carousel', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	// Close Navigator
	await editor.closeNavigatorIfOpen();

	// Set Canvas template.
	await editor.useCanvasTemplate();

	// Act.
	await editor.addWidget( 'image-carousel' );

	// Hide slider navigation.
	await page.selectOption( '.elementor-control-navigation >> select', 'none' );

	// Populate the widget with images.
	await editor.populateImageCarousel();

	expect( await editor.getPreviewFrame().locator( 'div.elementor-image-carousel-wrapper.swiper-container.swiper-container-initialized' ).screenshot( { type: 'jpeg', quality: 70 } ) ).toMatchSnapshot( 'carousel.jpeg' );

	/**
	 * Test Arrows Position control change - Carousel width should auto-adjust accordingly.
	 */
	// Act
	await page.locator( '.elementor-control-section_image_carousel' ).click();
	await page.selectOption( '.elementor-control-navigation >> select', 'both' );
	await page.selectOption( '.elementor-control-image_stretch >> select', 'yes' );

	await editor.activatePanelTab( 'style' );
	await page.locator( '.elementor-control-section_style_image' ).click();
	await page.selectOption( '.elementor-control-image_border_border >> select', 'solid' );

	await page.locator( '.elementor-control-section_style_navigation' ).click();
	await page.selectOption( '.elementor-control-arrows_position >> select', 'outside' );

	// Assert
	expect( await editor.getPreviewFrame().locator( '.elementor-widget-image-carousel div.elementor-widget-container' ).screenshot( { type: 'jpeg', quality: 100 } ) ).toMatchSnapshot( 'carousel-arrows-position.jpeg' );

	// Reset the Default template.
	await editor.useDefaultTemplate();
} );
