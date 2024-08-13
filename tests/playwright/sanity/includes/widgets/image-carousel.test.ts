import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import Breakpoints from '../../../assets/breakpoints';
import EditorPage from '../../../pages/editor-page';
import ImageCarousel from '../../../pages/widgets/image-carousel';
import EditorSelectors from '../../../selectors/editor-selectors';

test.describe( 'Image carousel tests', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext(),
			page = await context.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_swiper_latest: false,
		} );
	} );

	test( 'Image Carousel', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );

		await wpAdmin.openNewPage();
		await editor.setPageTemplate( 'canvas' );
		await editor.closeNavigatorIfOpen();

		const widgetId = await editor.addWidget( 'image-carousel' );
		await editor.setSelectControlValue( 'navigation', 'none' );
		await editor.openPanelTab( 'content' );
		await editor.addImagesToGalleryControl();
		await editor.openSection( 'section_additional_options' );
		await editor.setSwitcherControlValue( 'autoplay', false );

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
			await editor.setSelectControlValue( 'navigation', 'both' );
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
		await editor.setPageTemplate( 'default' );
	} );

	test.skip( 'Image Carousel Responsive Spacing', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.setExperiments( {
			additional_custom_breakpoints: true,
		} );
		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		// Add breakpoints.
		const breakpoints = new Breakpoints( page );
		await breakpoints.addAllBreakpoints( editor );
		await editor.addWidget( 'image-carousel' );
		await editor.openPanelTab( 'content' );
		await editor.addImagesToGalleryControl();
		await editor.openSection( 'section_additional_options' );
		await editor.setSwitcherControlValue( 'autoplay', false );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_style_image' );
		await editor.setSelectControlValue( 'image_spacing', 'custom' );
		// Test Desktop
		await editor.setSliderControlValue( 'image_spacing_custom', '100' );
		await editor.togglePreviewMode();
		await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '100px' );
		// Test Tablet Extra
		await editor.togglePreviewMode();
		await editor.changeResponsiveView( 'tablet_extra' );
		await editor.setSliderControlValue( 'image_spacing_custom_tablet_extra', '50' );
		await editor.togglePreviewMode();
		await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '50px' );
		// Test Tablet
		await editor.togglePreviewMode();
		await editor.changeResponsiveView( 'tablet' );
		await editor.setSliderControlValue( 'image_spacing_custom_tablet', '10' );
		await editor.togglePreviewMode();
		await expect( editor.getPreviewFrame().locator( '.swiper-slide-active' ).first() ).toHaveCSS( 'margin-right', '10px' );
		await wpAdmin.setExperiments( {
			additional_custom_breakpoints: 'inactive',
		} );
	} );

	test( 'Accessibility test', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const imageCarousel = new ImageCarousel( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.setPageTemplate( 'default' );
		await editor.closeNavigatorIfOpen();
		await editor.addWidget( 'heading' );
		await editor.addWidget( 'image-carousel' );
		await editor.openPanelTab( 'content' );
		await editor.addImagesToGalleryControl();
		await editor.openSection( 'section_additional_options' );
		await editor.setSwitcherControlValue( 'autoplay', false );

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

	test( 'Image caption test', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const imageCarousel = new ImageCarousel( page, testInfo );
		const editor = new EditorPage( page, testInfo );

		const caption = [ 'Test caption!', 'Test caption!', 'Test caption!' ];
		const description = [ 'Test description!', 'Test description!', 'Test description!' ];
		const title = [ 'A', 'B', 'C' ];

		await wpAdmin.openNewPage();
		await editor.setPageTemplate( 'canvas' );
		await editor.closeNavigatorIfOpen();

		await editor.addWidget( 'image-carousel' );
		await editor.openSection( 'section_additional_options' );
		await editor.setSwitcherControlValue( 'autoplay', false );
		await editor.openSection( 'section_image_carousel' );
		await editor.setSelectControlValue( 'navigation', 'none' );
		await editor.openPanelTab( 'content' );
		await editor.addImagesToGalleryControl( { images: [ 'A.jpg', 'B.jpg', 'C.jpg' ], metaData: true } );
		await editor.setSelectControlValue( 'caption_type', 'caption' );
		await imageCarousel.verifyCaption( caption );
		await editor.setSelectControlValue( 'caption_type', 'description' );
		await imageCarousel.verifyCaption( description );
		await editor.setSelectControlValue( 'caption_type', 'title' );
		await imageCarousel.verifyCaption( title );
	} );
} );
