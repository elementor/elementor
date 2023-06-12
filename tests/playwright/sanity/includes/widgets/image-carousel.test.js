const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const Breakpoints = require( '../../../assets/breakpoints' );
const EditorPage = require( '../../../pages/editor-page' );
import ImageCarousel from '../../../pages/widgets/image-carousel';

test.describe( 'Image carousel tests', () => {
	test( 'Image Carousel', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const imageCarousel = new ImageCarousel( page, testInfo );
		const editor = new EditorPage( page, testInfo );

		await wpAdmin.setExperiments( {
			e_swiper_latest: false,
		} );

		await wpAdmin.openNewPage();
		await editor.useCanvasTemplate();
		const widgetId = await imageCarousel.addWidget();
		await imageCarousel.selectNavigation( 'none' );
		await imageCarousel.addImageGallery();
		await imageCarousel.setAutoplay();

		await test.step( 'Verify image population', async () => {
			expect( await editor.getPreviewFrame().locator( 'div.elementor-image-carousel-wrapper.swiper-container.swiper-container-initialized' ).screenshot( {
				type: 'jpeg',
				quality: 90,
			} ) ).toMatchSnapshot( 'carousel.jpeg' );
		} );

		/**
		 * Test Arrows Position control change - Carousel width should auto-adjust accordingly.
		 */
		await test.step( 'Verify arrows position', async () => {
		// Act
			await page.locator( '.elementor-control-section_image_carousel' ).click();
			await imageCarousel.selectNavigation( 'both' );
			await page.selectOption( '.elementor-control-image_stretch >> select', 'yes' );

			await editor.activatePanelTab( 'style' );
			await page.locator( '.elementor-control-section_style_image' ).click();
			await page.selectOption( '.elementor-control-image_border_border >> select', 'solid' );

			await page.locator( '.elementor-control-section_style_navigation' ).click();
			await page.selectOption( '.elementor-control-arrows_position >> select', 'outside' );

			// Assert
			expect( await editor.getPreviewFrame().locator( '.elementor-widget-image-carousel div.elementor-widget-container' ).screenshot( {
				type: 'jpeg',
				quality: 100,
			} ) ).toMatchSnapshot( 'carousel-arrows-position.jpeg' );
		} );

		await test.step( 'Verify custom select control width', async () => {
			await editor.selectElement( widgetId );
			await editor.activatePanelTab( 'content' );
			await expect( page.locator( '.elementor-control-slides_to_show .elementor-control-input-wrapper' ) ).toHaveCSS( 'max-width', '80px' );
		} );

		// Reset the Default template.
		await editor.useDefaultTemplate();
	} );

	test.skip( 'Image Carousel Responsive Spacing', async ( { page }, testInfo ) => {
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

	test.skip( 'Accessibility test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const imageCarousel = new ImageCarousel( page, testInfo );

		await wpAdmin.setExperiments( {
			e_swiper_latest: false,
		} );

		const editor = await wpAdmin.useElementorCleanPost();

		await editor.useDefaultTemplate();

		// Close Navigator
		await editor.closeNavigatorIfOpen();

		// Populate the widget with images.
		await imageCarousel.addImageGallery();
		await imageCarousel.setAutoplay();
		await editor.openSection( 'section_additional_options' );
		await editor.setSelectControlValue( 'autoplay', 'yes' );
		await editor.setNumberControlValue( 'speed', 0 );

		await test.step( 'Assert keyboard navigation inside the editor', async () => {
		// Assert.
			await editor.getPreviewFrame().locator( '.elementor-swiper-button-prev' ).focus();
			await page.keyboard.press( 'Tab' );
			await expect( await editor.getPreviewFrame().locator( '.elementor-swiper-button-next' ) ).toBeFocused();
			await expect( await getActiveSlideDataValue( editor.getPreviewFrame() ) ).toEqual( '0' );
			await page.keyboard.press( 'Enter' );
			await expect( await getActiveSlideDataValue( editor.getPreviewFrame() ) ).toEqual( '1' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( await editor.getPreviewFrame().locator( '.elementor-swiper-button-next' ) ).toBeFocused();
			await expect( await getActiveSlideDataValue( editor.getPreviewFrame() ) ).toEqual( '0' );
			await page.keyboard.press( 'Enter' );
			await expect( await getActiveSlideDataValue( editor.getPreviewFrame() ) ).toEqual( '1' );
			await page.keyboard.press( 'Tab' );
			await expect( await getActiveSlideDataValue( editor.getPreviewFrame() ) ).toEqual( '1' );
			await expect( await editor.getPreviewFrame().locator( '.swiper-pagination-bullet-active' ) ).toBeFocused();
		} );
	} );

	test( 'Image caption test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const imageCarousel = new ImageCarousel( page, testInfo );
		const editor = new EditorPage( page, testInfo );

		await wpAdmin.setExperiments( {
			e_swiper_latest: false,
		} );

		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.useCanvasTemplate();
		await imageCarousel.addWidget();
		await imageCarousel.selectNavigation( 'none' );
		await imageCarousel.addImageGallery( [ 'A.jpg', 'B.jpg', 'C.jpg' ], true );
		await imageCarousel.setAutoplay();
		await editor.openSection( 'section_image_carousel' );

		const caption = [ 'Test caption!', 'Test caption!', 'Test caption!' ];
		const description = [ 'Test description!', 'Test description!', 'Test description!' ];
		const title = [ 'A', 'B', 'C' ];

		await imageCarousel.setCaption( 'caption' );
		await imageCarousel.verifyCaption( caption );
		await imageCarousel.setCaption( 'description' );
		await imageCarousel.verifyCaption( description );
		await imageCarousel.setCaption( 'title' );
		await imageCarousel.verifyCaption( title );
	} );
} );

async function getActiveSlideDataValue( context ) {
	await context.waitForSelector( '.swiper-slide-active' );
	return await context.locator( '.swiper-slide-active' ).getAttribute( 'data-swiper-slide-index' );
}
