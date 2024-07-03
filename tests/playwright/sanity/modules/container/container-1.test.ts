import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { getElementSelector } from '../../../assets/elements-utils';
import WpAdminPage from '../../../pages/wp-admin-page';
import widgets from '../../../enums/widgets';
import ImageCarousel from '../../../pages/widgets/image-carousel';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Container tests @container', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: true,
			container_grid: true,
			e_nested_atomic_repeaters: true,
			'nested-elements': true,
		} );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Sort items in a Container using DnD', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Set row direction.
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

		// Add widgets.
		const button = await editor.addWidget( widgets.button, container ),
			heading = await editor.addWidget( widgets.heading, container ),
			image = await editor.addWidget( widgets.image, container );

		// Act.
		// Move the button to be last.
		await editor.previewFrame.dragAndDrop(
			getElementSelector( button ),
			getElementSelector( image ),
		);

		const buttonEl = await editor.getElementHandle( button ),
			headingEl = await editor.getElementHandle( heading );

		const elBeforeButton = await buttonEl.evaluate( ( node ) => node.previousElementSibling ),
			elAfterHeading = await headingEl.evaluate( ( node ) => node.nextElementSibling );

		// Assert.
		// Test that the image is between the heading & button.
		expect.soft( elBeforeButton ).toEqual( elAfterHeading );
	} );

	test( 'Test widgets display inside the container using various directions and content width', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		// Act.
		await editor.addWidget( widgets.accordion, containerId );
		await editor.addWidget( widgets.divider, containerId );
		const spacer = await editor.addWidget( widgets.spacer, containerId );
		await editor.addWidget( widgets.toggle, containerId );
		await editor.addWidget( widgets.video, containerId );

		await editor.selectElement( spacer );
		await editor.openPanelTab( 'advanced' );
		await editor.openSection( '_section_background' );
		await editor.setChooseControlValue( '_background_background', 'eicon-paint-brush' );
		await editor.setColorControlValue( '_background_color', '#A81830' );

		await editor.selectElement( containerId );
		// Set row direction.
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );

		const container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );

		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-row.png' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		await editor.setSelectControlValue( 'content_width', 'full' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		await expect.soft( container ).toHaveScreenshot( 'container-row-full.png' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		// Flex-direction: column
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-down' );
		// Align items: flex-start
		await editor.setChooseControlValue( 'flex_align_items', 'eicon-align-start-v' );
		// Set `min-height` to test if there are `flex-grow` issues.
		await editor.setSliderControlValue( 'min_height', '1500' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-column-full-start.png' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		await editor.setSelectControlValue( 'content_width', 'boxed' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-column-boxed-start.png' );
	} );

	test( 'Test widgets inside the container using position absolute', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );

		// Act.
		await editor.addWidget( widgets.heading, container );
		await editor.selectElement( container );
		// Set position absolute.
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'absolute' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );

		await editor.togglePreviewMode();

		// Assert
		// Take screenshot.
		await expect.soft( pageView ).toHaveScreenshot( 'heading-boxed-absolute.png' );

		await editor.togglePreviewMode();

		// Act
		// Select container.
		await editor.selectElement( container );
		// Set full content width
		await editor.openPanelTab( 'layout' );
		await editor.setSelectControlValue( 'content_width', 'full' );

		await editor.togglePreviewMode();

		// Assert
		await expect( pageView ).toHaveScreenshot( 'heading-full-absolute.png' );

		// Reset the Default template.
		await editor.togglePreviewMode();
		await editor.setPageTemplate( 'default' );
	} );

	test( 'Test widgets inside the container using position fixed', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );

		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		// Select container.
		await editor.selectElement( container );
		// Set position fixed.
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'fixed' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );
		await editor.togglePreviewMode();

		// Assert
		// Take screenshot.
		await expect( pageView ).toHaveScreenshot( 'heading-boxed-fixed.png' );

		// Reset the Default template.
		await editor.togglePreviewMode();
		await editor.setPageTemplate( 'default' );
	} );

	test( 'Container full width and position fixed', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = editor.page.locator( '#elementor-preview-responsive-wrapper' );

		// Act
		// Set container content full content width.
		await editor.selectElement( container );
		await editor.openPanelTab( 'layout' );
		await editor.setSelectControlValue( 'content_width', 'full' );

		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		// Select container.
		await editor.selectElement( container );
		// Set position fixed.
		await editor.openPanelTab( 'advanced' );
		await editor.setSelectControlValue( 'position', 'fixed' );
		await editor.setNumberControlValue( 'z_index', '50' );
		await editor.setSliderControlValue( '_offset_x', '50' );
		await editor.setSliderControlValue( '_offset_y', '50' );

		await editor.togglePreviewMode();

		// Assert
		await expect( pageView ).toHaveScreenshot( 'heading-full-fixed.png' );
	} );

	test( 'Right click should add Full Width container', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.addElement( { elType: 'container' }, 'document' );

		await editor.getPreviewFrame().locator( '.elementor-editor-element-edit' ).click( { button: 'right' } );
		await expect.soft( page.locator( '.elementor-context-menu-list__item-newContainer' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-newContainer' ).click();
		await expect.soft( editor.getPreviewFrame().locator( '.e-con-full' ) ).toHaveCount( 1 );
	} );

	test( 'Widget display inside container flex wrap', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const imageCarousel = new ImageCarousel( page, testInfo );

		// Arrange.
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			containerElement = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + container );

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		await editor.selectElement( container );
		// Set row direction.
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );
		// Set flex-wrap: wrap.
		await editor.setChooseControlValue( 'flex_wrap', 'eicon-wrap' );

		// Act.
		await editor.addWidget( 'divider', container );
		// Set widget custom width to 80%.
		await editor.setWidgetCustomWidth( '80' );

		await editor.addWidget( 'google_maps', container );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget-google_maps iframe' );
		// Set widget custom width to 40%.
		await editor.setWidgetCustomWidth( '40' );
		// Set widget size to grow
		await editor.setChooseControlValue( '_flex_size', 'eicon-grow' );
		// Set widget mask.
		await editor.setWidgetMask();

		await editor.addWidget( 'video', container );
		// Set widget custom width to 40%.
		await editor.setWidgetCustomWidth( '40' );
		// Set widget mask.
		await editor.setWidgetMask();
		await page.waitForLoadState( 'domcontentloaded' );
		await editor.hideVideoControls();

		// Hide carousel navigation.
		const carouselOneId = await editor.addWidget( 'image-carousel', container );
		await editor.setSelectControlValue( 'navigation', 'none' );
		// Set widget custom width to 40%.
		await editor.setWidgetCustomWidth( '40' );
		// Add images.
		await imageCarousel.addImageGallery();
		await editor.openSection( 'section_additional_options' );
		await editor.setSwitcherControlValue( 'autoplay', false );

		// Duplicate carousel widget.
		await editor.getPreviewFrame().locator( '.elementor-element-' + carouselOneId ).click( { button: 'right' } );
		await expect.soft( page.locator( '.elementor-context-menu-list__item-duplicate .elementor-context-menu-list__item__title' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-duplicate .elementor-context-menu-list__item__title' ).click();
		// Add flex grow effect.
		await editor.openPanelTab( 'advanced' );
		// Set widget size to grow
		await editor.setChooseControlValue( '_flex_size', 'eicon-grow' );

		// Hide editor and map controls.
		await editor.hideMapControls();
		await editor.togglePreviewMode();

		// Assert.
		expect.soft( await containerElement.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-row-flex-wrap.jpeg' );

		await editor.togglePreviewMode();

		// Reset the Default template.
		await editor.setPageTemplate( 'default' );
	} );

	test( 'Fallback image is not on top of background video AND border radius with background image', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await page.goto( '/wp-admin/media-new.php' );

		if ( await page.locator( '.upload-flash-bypass a' ).isVisible() ) {
			await page.locator( '.upload-flash-bypass a' ).click();
		}

		await page.setInputFiles( 'input[name="async-upload"]', './tests/playwright/resources/video.webm' );
		await page.locator( '#html-upload' ).click();
		await page.waitForSelector( '.attachments-wrapper' );
		await page.locator( 'ul.attachments li' ).nth( 0 ).click();
		await page.waitForSelector( '.attachment-details-copy-link' );

		const videoURL = await page.locator( '.attachment-details-copy-link' ).inputValue(),
			editor = await wpAdmin.openNewPage(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' ),
			container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		await editor.selectElement( containerId );
		await editor.setSliderControlValue( 'min_height', '200' );
		await editor.openPanelTab( 'style' );
		await editor.setChooseControlValue( 'background_background', 'eicon-video-camera' );
		await editor.setTextControlValue( 'background_video_link', videoURL );
		await page.locator( '.elementor-control-background_video_fallback .eicon-plus-circle' ).click();
		await page.locator( '#menu-item-browse' ).click();
		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/mountain-image.jpeg' );
		await page.waitForLoadState( 'networkidle' );
		await page.click( '.button.media-button' );
		await editor.openSection( 'section_background_overlay' );
		await editor.setChooseControlValue( 'background_overlay_background', 'eicon-paint-brush' );
		await editor.setColorControlValue( 'background_overlay_color', '#61CE70' );

		await editor.togglePreviewMode();

		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-background.jpeg' );

		await editor.togglePreviewMode();

		await editor.selectElement( containerId );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_border' );
		await editor.setSelectControlValue( 'border_border', 'solid' );
		await editor.setDimensionsValue( 'border_width', '30' );
		await editor.setDimensionsValue( 'border_radius', '60' );
		await editor.setColorControlValue( 'border_color', '#333333' );
		await page.locator( 'body' ).click();

		await editor.togglePreviewMode();

		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 100,
		} ) ).toMatchSnapshot( 'container-background-border-radius.jpeg' );

		// Reset to the Default template.
		await editor.togglePreviewMode();
		await editor.setPageTemplate( 'default' );
	} );

	test( 'Spacer alignment with container column setting', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.closeNavigatorIfOpen();

		// Hide editor elements from the screenshots.
		await editor.hideEditorElements();

		// Act.
		// Add widgets.
		await editor.addWidget( 'spacer', containerId );
		await editor.openPanelTab( 'advanced' );
		await editor.setWidgetCustomWidth( '20' );
		await editor.openSection( '_section_background' );
		await editor.setChooseControlValue( '_background_background', 'eicon-paint-brush' );
		await editor.setColorControlValue( '_background_color', '#A81830' );

		await editor.selectElement( containerId );
		// Set container `align-items: center`.
		await editor.setChooseControlValue( 'flex_align_items', 'eicon-align-center-v' );

		const container = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + containerId );

		// Assert
		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-column-spacer-align-center.jpeg' );
	} );

	test( 'Right container padding for preset c100-c50-50', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.getPreviewFrame().locator( '.elementor-add-section-button' ).click();
		await editor.getPreviewFrame().locator( '.flex-preset-button' ).click();
		await editor.getPreviewFrame().locator( '[data-preset="c100-c50-50"]' ).click();

		await expect.soft( editor.getPreviewFrame().locator( '.e-con.e-con-full.e-con--column[data-nesting-level="1"]' ).last() ).toHaveCSS( 'padding', '0px' );

		await test.step( 'Wrap value is not selected in c100-c50-50 preset', async () => {
			const container = editor.getPreviewFrame().locator( '.elementor-section-wrap > .e-con.e-flex > .e-con-inner' );
			await expect.soft( container ).not.toHaveCSS( 'flex-wrap', 'wrap' );
		} );
	} );

	test( 'Container handle should be centered', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		try {
			await wpAdmin.setSiteLanguage( 'he_IL' );
			const editor = await wpAdmin.openNewPage();
			await editor.closeNavigatorIfOpen();
			await editor.setPageTemplate( 'canvas' );
			const container = await addContainerAndHover( editor );
			expect.soft( await container.screenshot( {
				type: 'jpeg',
				quality: 100,
			} ) ).toMatchSnapshot( 'container-rtl-centered.jpeg' );
		} finally {
			await wpAdmin.setSiteLanguage( '' );
		}

		const editor = await wpAdmin.openNewPage();
		await editor.setPageTemplate( 'canvas' );
		const container = await addContainerAndHover( editor );

		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-ltr-centered.jpeg' );
	} );

	test( 'Container Transform controls', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' ),
			containerSelector = '.elementor-edit-mode .elementor-element-' + containerId;

		// Act.
		await editor.addWidget( 'heading', containerId );
		await editor.selectElement( containerId );
		await editor.openPanelTab( 'advanced' );
		await editor.openSection( '_section_transform' );
		// Set rotation.
		await page.locator( '.elementor-control-_transform_rotate_popover .elementor-control-popover-toggle-toggle-label' ).click();
		await page.locator( '.elementor-control-_transform_rotateZ_effect .elementor-control-input-wrapper input' ).fill( '2' );
		await page.locator( '.elementor-control-_transform_rotate_popover .elementor-control-popover-toggle-toggle-label' ).click();
		// Set scale.
		await page.locator( '.elementor-control-_transform_scale_popover .elementor-control-popover-toggle-toggle-label' ).click();
		await page.locator( '.elementor-control-_transform_scale_effect .elementor-control-input-wrapper input' ).fill( '2' );
		await page.locator( '.elementor-control-_transform_scale_popover .elementor-control-popover-toggle-toggle-label' ).click();

		// Assert.
		// Check rotate and scale value.
		await expect.soft( editor.getPreviewFrame().locator( containerSelector ) ).toHaveCSS( '--e-con-transform-rotateZ', '2deg' );
		await expect.soft( editor.getPreviewFrame().locator( containerSelector ) ).toHaveCSS( '--e-con-transform-scale', '2' );
	} );
} );

async function addContainerAndHover( editor: EditorPage ) {
	const containerId = await editor.addElement( { elType: 'container' }, 'document' );
	const containerSelector = '.elementor-edit-mode .elementor-element-' + containerId;
	const container = editor.getPreviewFrame().locator( containerSelector );
	await editor.getPreviewFrame().hover( containerSelector );

	return container;
}
