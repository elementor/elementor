import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page';
import Breakpoints from '../../../assets/breakpoints';
import EditorPage from '../../../pages/editor-page';
import ImageCarousel from '../../../pages/widgets/image-carousel';
import EditorSelectors from '../../../selectors/editor-selectors';

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
			await editor.openSection( 'section_image_carousel' );
			await imageCarousel.selectNavigation( 'both' );
			await editor.setSelectControlValue( 'image_stretch', 'yes' );

			await editor.openPanelTab( 'style' );
			await editor.openSection( 'section_style_image' );
			await editor.setSelectControlValue( 'image_border_border', 'solid' );

			await editor.openSection( 'section_style_navigation' );
			await editor.setSelectControlValue( 'arrows_position', 'outside' );

			// Assert
			expect( await editor.getPreviewFrame().locator( '.elementor-widget-image-carousel div.elementor-widget-container' ).screenshot( {
				type: 'jpeg',
				quality: 100,
			} ) ).toMatchSnapshot( 'carousel-arrows-position.jpeg' );
		} );

		await test.step( 'Verify custom select control width', async () => {
			await editor.selectElement( widgetId );
			await editor.openPanelTab( 'content' );
			await expect( page.locator( '.elementor-control-slides_to_show .elementor-control-input-wrapper' ) ).toHaveCSS( 'max-width', '80px' );
		} );

		// Reset the Default template.
		await editor.useDefaultTemplate();
	} );

	test.skip( 'Image Carousel Responsive Spacing', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const imageCarousel = new ImageCarousel( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.setExperiments( {
			additional_custom_breakpoints: true,
		} );
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		// Add breakpoints.
		const breakpoints = new Breakpoints( page );
		await breakpoints.addAllBreakpoints();
		await editor.addWidget( 'image-carousel' );
		await imageCarousel.addImageGallery();
		await imageCarousel.setAutoplay();
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_style_image' );
		await editor.setSelectControlValue( 'image_spacing', 'custom' );
		// Test Desktop
		await editor.setNumberControlValue( 'image_spacing_custom', '100' );
		await editor.togglePreviewMode();
		await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '100px' );
		// Test Tablet Extra
		await editor.togglePreviewMode();
		await page.locator( '.elementor-control-image_spacing_custom .elementor-control-responsive-switchers__holder' ).click();
		await page.locator( '.elementor-control-image_spacing_custom .elementor-control-responsive-switchers [data-device="tablet_extra"]' ).click();
		await editor.setNumberControlValue( 'image_spacing_custom_tablet_extra', '50' );
		await editor.togglePreviewMode();
		await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '50px' );
		// Test Tablet
		await editor.togglePreviewMode();
		await page.locator( '.elementor-control-image_spacing_custom_tablet_extra .elementor-control-responsive-switchers__holder' ).click();
		await page.locator( '.elementor-control-image_spacing_custom_tablet_extra .elementor-control-responsive-switchers [data-device="tablet"]' ).click();
		await editor.setNumberControlValue( 'image_spacing_custom_tablet', '10' );
		await editor.togglePreviewMode();
		await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '10px' );
		await wpAdmin.setExperiments( {
			additional_custom_breakpoints: 'inactive',
		} );
	} );

	test( 'Accessibility test', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const imageCarousel = new ImageCarousel( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.setExperiments( {
			e_swiper_latest: false,
		} );
		await wpAdmin.openNewPage();
		await editor.useDefaultTemplate();
		await editor.closeNavigatorIfOpen();
		await editor.addWidget( 'heading' );
		await editor.addWidget( 'image-carousel' );
		await imageCarousel.addImageGallery();
		await imageCarousel.setAutoplay();
		await editor.openSection( 'section_additional_options' );

		// Assert.
		await test.step( 'Assert keyboard navigation in the Frontend', async () => {
			await editor.publishAndViewPage();
			await page.locator( EditorSelectors.imageCarousel.prevSliderBtn ).focus();
			await page.keyboard.press( 'Tab' );
			await imageCarousel.waitForSlide( '1', 'A' );
			await page.keyboard.press( 'Enter' );
			await imageCarousel.waitForSlide( '2', 'B' );
			await page.waitForTimeout( 600 );
			await page.keyboard.press( 'ArrowLeft' );
			await imageCarousel.waitForSlide( '1', 'A' );
			await page.waitForTimeout( 600 );
			await page.keyboard.press( 'ArrowRight' );
			await imageCarousel.waitForSlide( '2', 'B' );
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
		await imageCarousel.addImageGallery( { images: [ 'A.jpg', 'B.jpg', 'C.jpg' ], metaData: true } );
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
