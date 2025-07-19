import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import ContextMenu from '../../../pages/widgets/context-menu';

test.describe( 'Container tests #3 @container', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { container: true, 'nested-elements': true } );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Widget display inside container flex wrap', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const contextMenu = new ContextMenu( page, testInfo );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		// Act.
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.setChooseControlValue( 'flex_direction', 'eicon-arrow-right' );
		await editor.setChooseControlValue( 'flex_wrap', 'eicon-wrap' );

		await editor.addWidget( { widgetType: 'divider', container } );
		await editor.setWidgetCustomWidth( '80' );

		await editor.addWidget( { widgetType: 'google_maps', container } );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget-google_maps iframe' );
		await editor.hideMapControls();
		await editor.setWidgetCustomWidth( '40' );
		await editor.setChooseControlValue( '_flex_size', 'eicon-grow' );
		await editor.setWidgetMask();

		await editor.addWidget( { widgetType: 'video', container } );
		await editor.setWidgetCustomWidth( '40' );
		await editor.setWidgetMask();
		await page.waitForLoadState( 'domcontentloaded' );
		await editor.hideVideoControls();

		// Hide carousel navigation.
		await editor.addWidget( { widgetType: 'image-carousel', container } );
		await editor.setSelectControlValue( 'navigation', 'none' );
		await editor.setWidgetCustomWidth( '40' );
		await editor.openPanelTab( 'content' );
		await editor.addImagesToGalleryControl();
		await editor.openSection( 'section_additional_options' );
		await editor.setSwitcherControlValue( 'autoplay', false );

		// Duplicate carousel widget.
		await contextMenu.selectWidgetContextMenuItem( 'image-carousel', 'Duplicate' );
		await editor.openPanelTab( 'advanced' );
		await editor.setChooseControlValue( '_flex_size', 'eicon-grow' );

		// Hide editor and map controls.
		await editor.togglePreviewMode();

		// Assert.
		const containerElement = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + container );
		expect.soft( await containerElement.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-row-flex-wrap.jpeg' );

		await editor.togglePreviewMode();

		// Reset the Default template.
		await editor.setPageTemplate( 'default' );
	} );

	test( 'Fallback image is not on top of background video AND border radius with background image', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
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

		const videoURL = await page.locator( '.attachment-details-copy-link' ).inputValue();
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.setPageTemplate( 'canvas' );

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
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

		// Assert.
		const container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );
		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-background.jpeg' );

		// Act.
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

		// Assert.
		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 100,
		} ) ).toMatchSnapshot( 'container-background-border-radius.jpeg' );

		// Reset to the Default template.
		await editor.togglePreviewMode();
		await editor.setPageTemplate( 'default' );
	} );

	test( 'Spacer alignment with container column setting', async ( { page, apiRequests }, testInfo ) => {
		// Assert.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();

		// Assert.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.setChooseControlValue( 'flex_align_items', 'eicon-align-center-v' );
		await editor.hideEditorElements();
		await editor.addWidget( { widgetType: 'spacer', container: containerId } );
		await editor.openPanelTab( 'advanced' );
		await editor.setWidgetCustomWidth( '20' );
		await editor.openSection( '_section_background' );
		await editor.setChooseControlValue( '_background_background', 'eicon-paint-brush' );
		await editor.setColorControlValue( '_background_color', '#A81830' );

		// Assert.
		const container = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + containerId );
		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-column-spacer-align-center.jpeg' );
	} );

	test( 'Right container padding for preset c100-c50-50', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addNewContainerPreset( 'flex', 'c100-c50-50' );

		// Assert.
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
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act.
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
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

		await editor.addWidget( { widgetType: 'heading', container: containerId } );

		// Assert.
		// Check rotate and scale value.
		const containerSelector = '.elementor-edit-mode .elementor-element-' + containerId;
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
