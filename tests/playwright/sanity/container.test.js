const { test, expect } = require( '@playwright/test' );
const { getElementSelector } = require( '../assets/elements-utils' );
const WpAdminPage = require( '../pages/wp-admin-page' );

test.describe( 'Container tests', () => {
	test( 'Sort items in a Container using DnD', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

		// Add widgets.
		const button = await editor.addWidget( 'button', container ),
			heading = await editor.addWidget( 'heading', container ),
			image = await editor.addWidget( 'image', container );

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
		expect( elBeforeButton ).toBe( elAfterHeading );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.skip( 'Test widgets display inside the container using various directions and content width', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		// Close Navigator
		await editor.closeNavigatorIfOpen();

		// Act.
		// Add widgets.
		await editor.addWidget( 'accordion', containerId );
		await editor.addWidget( 'divider', containerId );
		const spacer = await editor.addWidget( 'spacer', containerId );
		await editor.addWidget( 'toggle', containerId );
		await editor.addWidget( 'video', containerId );

		// Set background colour to spacer.
		await editor.setBackgroundColor( '#A81830', spacer );
		// Select container.
		await editor.selectElement( containerId );
		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

		const container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );

		await editor.hideVideoControls();
		await editor.togglePreviewMode();
		await page.waitForLoadState( 'domcontentloaded' );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-row.jpeg' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		// Set full content width.
		await page.selectOption( '.elementor-control-content_width >> select', 'full' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();
		await page.waitForLoadState( 'domcontentloaded' );

		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-row-full.jpeg' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		// Flex-direction: column
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-down' );
		// Align items: flex-start
		await page.click( '.elementor-control-flex_align_items i.eicon-align-start-v' );
		// Set `min-height` to test if there are `flex-grow` issues.
		await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1500' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();
		await page.waitForLoadState( 'domcontentloaded' );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-column-full-start.jpeg' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		// Content Width: boxed
		await page.selectOption( '.elementor-control-content_width >> select', 'boxed' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();
		await page.waitForLoadState( 'domcontentloaded' );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-column-boxed-start.jpeg' );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.skip( 'Test widgets inside the container using position absolute', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost();

		// Close Navigator
		await editor.closeNavigatorIfOpen();

		// Set Canvas template.
		await editor.useCanvasTemplate();

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = page.locator( 'body' );

		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		// Select container.
		await editor.selectElement( container );
		// Set position absolute.
		await editor.activatePanelTab( 'advanced' );
		await page.waitForSelector( '.elementor-control-position >> select' );
		await page.selectOption( '.elementor-control-position >> select', 'absolute' );
		await page.locator( '.elementor-control-z_index .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_x .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_y .elementor-control-input-wrapper input' ).fill( '50' );

		await editor.togglePreviewMode();

		// Assert
		// Take screenshot.
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'heading-boxed-absolute.jpeg' );

		await editor.togglePreviewMode();

		// Act
		// Select container.
		await editor.selectElement( container );
		// Set full content width
		await editor.activatePanelTab( 'layout' );
		await page.selectOption( '.elementor-control-content_width >> select', 'full' );

		await editor.togglePreviewMode();

		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'heading-full-absolute.jpeg' );

		// Reset the Default template.
		await editor.togglePreviewMode();
		await editor.useDefaultTemplate();

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.skip( 'Test widgets inside the container using position fixed', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost();

		// Close Navigator
		await editor.closeNavigatorIfOpen();

		// Set Canvas template.
		await editor.useCanvasTemplate();

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = page.locator( 'body' );

		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		// Select container.
		await editor.selectElement( container );
		// Set position fixed.
		await editor.activatePanelTab( 'advanced' );
		await page.selectOption( '.elementor-control-position >> select', 'fixed' );
		await page.locator( '.elementor-control-z_index .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_x .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_y .elementor-control-input-wrapper input' ).fill( '50' );

		await editor.togglePreviewMode();

		// Assert
		// Take screenshot.
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'heading-boxed-fixed.jpeg' );

		// Reset the Default template.
		await editor.togglePreviewMode();
		await editor.useDefaultTemplate();

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test( 'Container full width and position fixed', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost();

		// Close Navigator
		await editor.closeNavigatorIfOpen();

		// Use the Canvas template.
		await editor.useCanvasTemplate();

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = page.locator( 'body' );

		// Act
		// Set container content full content width.
		await editor.selectElement( container );
		await editor.activatePanelTab( 'layout' );
		await page.selectOption( '.elementor-control-content_width >> select', 'full' );

		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		// Select container.
		await editor.selectElement( container );
		// Set position fixed.
		await editor.activatePanelTab( 'advanced' );
		await page.selectOption( '.elementor-control-position >> select', 'fixed' );
		await page.locator( '.elementor-control-z_index .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_x .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_y .elementor-control-input-wrapper input' ).fill( '50' );

		await editor.togglePreviewMode();

		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'heading-full-fixed.jpeg' );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test( 'Right click should add Full Width container', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost();

		await editor.addElement( { elType: 'container' }, 'document' );

		await editor.getFrame().locator( '.elementor-editor-element-edit' ).click( { button: 'right' } );
		await expect( page.locator( '.elementor-context-menu-list__item-newContainer' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-newContainer' ).click();
		await expect( editor.getPreviewFrame().locator( '.e-con-full' ) ).toHaveCount( 1 );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.skip( 'Widget display inside container flex wrap', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		// Arrange.
		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			containerElement = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + container );

		// Set Canvas template.
		await editor.useCanvasTemplate();
		await page.waitForLoadState( 'domcontentloaded' );

		// Set row direction.
		await editor.selectElement( container );
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );
		// Set flex-wrap: wrap.
		await page.click( '.elementor-control-flex_wrap .elementor-control-input-wrapper .eicon-wrap' );

		// Close Navigator
		await editor.closeNavigatorIfOpen();

		// Act.
		await editor.addWidget( 'divider', container );
		// Set widget custom width to 80%.
		await editor.setWidgetCustomWidth( '80' );

		await editor.addWidget( 'google_maps', container );
		await page.waitForLoadState( 'domcontentloaded' );
		await editor.getPreviewFrame().waitForSelector( '.elementor-widget-google_maps iframe' );
		// Set widget custom width to 40%.
		await editor.setWidgetCustomWidth( '40' );
		await editor.setWidgetToFlexGrow();
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
		await page.selectOption( '.elementor-control-navigation >> select', 'none' );
		// Set widget custom width to 40%.
		await editor.setWidgetCustomWidth( '40' );
		// Add images.
		await editor.populateImageCarousel();
		// Duplicate carousel widget.
		await editor.getPreviewFrame().locator( '.elementor-element-' + carouselOneId ).click( { button: 'right' } );
		await expect( page.locator( '.elementor-context-menu-list__item-duplicate .elementor-context-menu-list__item__title' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-duplicate .elementor-context-menu-list__item__title' ).click();
		// Add flex grow effect.
		await editor.activatePanelTab( 'advanced' );
		await editor.setWidgetToFlexGrow();

		// Hide editor and map controls.
		await editor.hideMapControls();
		await editor.togglePreviewMode();

		// Assert.
		expect( await containerElement.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-row-flex-wrap.jpeg' );

		await editor.togglePreviewMode();

		// Reset the Default template.
		await editor.useDefaultTemplate();
	} );

	test.skip( 'Fallback image is not on top of background video', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

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
			editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' ),
			container = editor.getFrame().locator( '.elementor-element-' + containerId );

		// Set Canvas template.
		await editor.useCanvasTemplate();

		await page.waitForLoadState( 'domcontentloaded' );
		await editor.selectElement( containerId );
		await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '200' );
		await editor.activatePanelTab( 'style' );
		await page.locator( '[data-tooltip="Video"]' ).click();
		await page.locator( '[data-setting="background_video_link"]' ).fill( videoURL );
		await page.locator( '.elementor-control-background_video_fallback .eicon-plus-circle' ).click();
		await page.locator( '#menu-item-browse' ).click();
		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/mountain-image.jpeg' );
		await page.waitForLoadState( 'networkidle' );
		await page.click( '.button.media-button' );
		await page.locator( '.elementor-control-section_background_overlay' ).click();
		await page.locator( '.elementor-control-background_overlay_background [data-tooltip="Classic"]' ).click();
		await page.locator( '.elementor-control-background_overlay_color .pcr-button' ).click();
		await page.locator( '.pcr-app.visible .pcr-interaction input.pcr-result' ).fill( '#61CE70' );

		await editor.closeNavigatorIfOpen();
		await editor.togglePreviewMode();

		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-background.jpeg' );

		// Reset to the Default template.
		await editor.togglePreviewMode();
		await editor.useDefaultTemplate();

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test( 'Spacer alignment with container column setting', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		// Close Navigator
		await editor.closeNavigatorIfOpen();
		// Hide editor elements from the screenshots.
		await editor.hideEditorElements();

		// Act.
		// Add widgets.
		const spacer = await editor.addWidget( 'spacer', containerId );
		// Set background colour and custom width.
		await editor.activatePanelTab( 'advanced' );
		await editor.setWidgetCustomWidth( '20' );
		await editor.setBackgroundColor( '#A81830', spacer );
		// Set container `align-items: center`.
		await editor.selectElement( containerId );
		await page.click( '.elementor-control-flex_align_items .eicon-align-center-v' );

		const container = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + containerId );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'container-column-spacer-align-center.jpeg' );
	} );

	test( 'Right container padding for preset c100-c50-50', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost();

		await editor.getPreviewFrame().locator( '.elementor-add-section-button' ).click();
		await editor.getPreviewFrame().locator( '[data-preset="c100-c50-50"]' ).click();

		await expect( editor.getPreviewFrame().locator( '.e-con.e-con-full.e-con--column' ).last() ).toHaveCSS( 'padding', '0px' );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.skip( 'Container handle should be centered', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );
		try {
			await wpAdmin.setLanguage( 'he_IL' );
			const editor = await createCanvasPage( wpAdmin );
			const container = await addContainerAndHover( editor );

			expect( await container.screenshot( {
				type: 'jpeg',
				quality: 90,
			} ) ).toMatchSnapshot( 'container-rtl-centered.jpeg', { maxDiffPixels: 100 } );
		} finally {
			await wpAdmin.setLanguage( '' );
		}

		const editor = await createCanvasPage( wpAdmin );
		const container = await addContainerAndHover( editor );

		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-ltr-centered.jpeg', { maxDiffPixels: 100 } );
	} );

	test( 'Container Transform controls', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		// Arrange.
		const editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' ),
			containerSelector = '.elementor-edit-mode .elementor-element-' + containerId;

		// Act.
		await editor.addWidget( 'heading', containerId );
		await editor.selectElement( containerId );
		await editor.activatePanelTab( 'advanced' );
		await page.locator( '.elementor-control-_section_transform .elementor-panel-heading-title' ).click();
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
		await expect( editor.getPreviewFrame().locator( containerSelector ) ).toHaveCSS( '--e-con-transform-rotateZ', '2deg' );
		await expect( editor.getPreviewFrame().locator( containerSelector ) ).toHaveCSS( '--e-con-transform-scale', '2' );
	} );
} );

async function createCanvasPage( wpAdmin ) {
	const editor = await wpAdmin.openNewPage();
	await editor.page.waitForLoadState( 'networkidle' );
	await editor.useCanvasTemplate();
	return editor;
}

async function addContainerAndHover( editor ) {
	const containerId = await editor.addElement( { elType: 'container' }, 'document' );
	const containerSelector = '.elementor-edit-mode .elementor-element-' + containerId;
	const container = editor.getPreviewFrame().locator( containerSelector );
	editor.getPreviewFrame().hover( containerSelector );
	return container;
}
