const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const Breakpoints = require( '../../../assets/breakpoints' );

test( 'Image Carousel', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );

	await wpAdmin.setExperiments( {
		e_swiper_latest: false,
	} );

	const editor = await wpAdmin.useElementorCleanPost();

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

test( 'Image Carousel Responsive Spacing', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );

	await wpAdmin.setExperiments( {
		additional_custom_breakpoints: true,
	} );

	const editor = await wpAdmin.useElementorCleanPost();

	await editor.closeNavigatorIfOpen();

	// Add breakpoints.
	const breakpoints = new Breakpoints( page );
	await breakpoints.addAllBreakpoints();

	await editor.addWidget( 'image-carousel' );

	await page.locator( '.eicon-plus-circle' ).first().click();

	await page.click( 'text=Media Library' );

	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/A.jpg' );
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/B.jpg' );
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/C.jpg' );
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/D.jpg' );
	await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/E.jpg' );

	await page.locator( 'text=Create a new gallery' ).click();

	await page.locator( 'text=Insert gallery' ).click();

	await editor.activatePanelTab( 'style' );
	await page.locator( '.elementor-control-section_style_image' ).click();
	await page.selectOption( '.elementor-control-image_spacing >> select', { value: 'custom' } );

	// Test Desktop
	await page.fill( '.elementor-control-image_spacing_custom input[type="number"]', '100' );
	await editor.togglePreviewMode();
	await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '100px' );

	// Test Tablet Extra
	await editor.togglePreviewMode();
	await page.locator( '.elementor-control-image_spacing_custom .elementor-control-responsive-switchers__holder' ).click();
	await page.locator( '.elementor-control-image_spacing_custom .elementor-control-responsive-switchers [data-device="tablet_extra"]' ).click();
	await page.fill( '.elementor-control-image_spacing_custom_tablet_extra input[type="number"]', '50' );
	await editor.togglePreviewMode();
	await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '50px' );

	// Test Tablet
	await editor.togglePreviewMode();
	await page.locator( '.elementor-control-image_spacing_custom_tablet_extra .elementor-control-responsive-switchers__holder' ).click();
	await page.locator( '.elementor-control-image_spacing_custom_tablet_extra .elementor-control-responsive-switchers [data-device="tablet"]' ).click();
	await page.fill( '.elementor-control-image_spacing_custom_tablet input[type="number"]', '10' );
	await editor.togglePreviewMode();
	await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '10px' );

	await wpAdmin.setExperiments( {
		additional_custom_breakpoints: 'inactive',
	} );
} );
