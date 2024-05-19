import { test, expect, Page } from '@playwright/test';
import { getElementSelector } from '../assets/elements-utils';
import WpAdminPage from '../pages/wp-admin-page';
import widgets from '../enums/widgets';
import Breakpoints from '../assets/breakpoints';
import ImageCarousel from '../pages/widgets/image-carousel';
import EditorPage from '../pages/editor-page';
import _path from 'path';

test.describe( 'Container tests @container', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
			container_grid: true,
			e_nested_atomic_repeaters: true,
		} );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container_grid: false,
			container: false,
			e_nested_atomic_repeaters: false,
		} );
	} );

	test( 'Sort items in a Container using DnD', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

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

	test( 'Test widgets display inside the container using various directions and content width', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		// Close Navigator
		await editor.closeNavigatorIfOpen();
		await editor.useCanvasTemplate();

		// Act.
		await editor.addWidget( widgets.accordion, containerId );
		await editor.addWidget( widgets.divider, containerId );
		const spacer = await editor.addWidget( widgets.spacer, containerId );
		await editor.addWidget( widgets.toggle, containerId );
		await editor.addWidget( widgets.video, containerId );

		// Set background colour to spacer.
		await editor.setBackgroundColor( '#A81830', spacer );
		// Select container.
		await editor.selectElement( containerId );
		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

		const container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );

		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-row.png' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		// Set full content width.
		await page.selectOption( '.elementor-control-content_width >> select', 'full' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		await expect.soft( container ).toHaveScreenshot( 'container-row-full.png' );

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

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-column-full-start.png' );

		// Act
		await editor.togglePreviewMode();
		await editor.selectElement( containerId );
		// Content Width: boxed
		await page.selectOption( '.elementor-control-content_width >> select', 'boxed' );
		await editor.hideVideoControls();
		await editor.togglePreviewMode();

		// Assert
		await expect.soft( container ).toHaveScreenshot( 'container-column-boxed-start.png' );
	} );

	test( 'Test widgets inside the container using position absolute', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
		await editor.useCanvasTemplate();

		const container = await editor.addElement( { elType: 'container' }, 'document' ),
			pageView = page.locator( 'body' );

		// Act.
		await editor.addWidget( widgets.heading, container );
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
		expect.soft( await pageView.screenshot( {
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
		expect.soft( await pageView.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'heading-full-absolute.jpeg' );

		// Reset the Default template.
		await editor.togglePreviewMode();
		await editor.useDefaultTemplate();
	} );

	test( 'Test widgets inside the container using position fixed', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
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
		expect.soft( await pageView.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'heading-boxed-fixed.jpeg' );

		// Reset the Default template.
		await editor.togglePreviewMode();
		await editor.useDefaultTemplate();
	} );

	test( 'Container full width and position fixed', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();

		await editor.closeNavigatorIfOpen();
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
		expect.soft( await pageView.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'heading-full-fixed.jpeg' );
	} );

	test( 'Right click should add Full Width container', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();

		await editor.addElement( { elType: 'container' }, 'document' );

		await editor.getPreviewFrame().locator( '.elementor-editor-element-edit' ).click( { button: 'right' } );
		await expect.soft( page.locator( '.elementor-context-menu-list__item-newContainer' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-newContainer' ).click();
		await expect.soft( editor.getPreviewFrame().locator( '.e-con-full' ) ).toHaveCount( 1 );
	} );

	test( 'Widget display inside container flex wrap', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const imageCarousel = new ImageCarousel( page, testInfo );

		// Arrange.
		const editor = await wpAdmin.openNewPage(),
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
		await imageCarousel.selectNavigation( 'none' );
		// Set widget custom width to 40%.
		await editor.setWidgetCustomWidth( '40' );
		// Add images.
		await imageCarousel.addImageGallery();
		await imageCarousel.setAutoplay();

		// Duplicate carousel widget.
		await editor.getPreviewFrame().locator( '.elementor-element-' + carouselOneId ).click( { button: 'right' } );
		await expect.soft( page.locator( '.elementor-context-menu-list__item-duplicate .elementor-context-menu-list__item__title' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-duplicate .elementor-context-menu-list__item__title' ).click();
		// Add flex grow effect.
		await editor.activatePanelTab( 'advanced' );
		await editor.setWidgetToFlexGrow();

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
		await editor.useDefaultTemplate();
	} );

	test( 'Fallback image is not on top of background video AND border radius with background image', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
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

		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-background.jpeg' );

		await editor.togglePreviewMode();

		await editor.selectElement( containerId );
		await editor.activatePanelTab( 'style' );
		await editor.openSection( 'section_border' );
		await page.selectOption( '.elementor-control-border_border .elementor-control-input-wrapper select', 'solid' );
		await page.locator( '.elementor-control-border_width .elementor-control-input-wrapper input' ).first().fill( '30' );
		await page.locator( '.elementor-control-border_radius .elementor-control-input-wrapper input' ).first().fill( '60' );
		await editor.setContainerBorderColor( '#333333', containerId );
		await page.locator( 'body' ).click();

		await editor.togglePreviewMode();

		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 100,
		} ) ).toMatchSnapshot( 'container-background-border-radius.jpeg' );

		// Reset to the Default template.
		await editor.togglePreviewMode();
		await editor.useDefaultTemplate();
	} );

	test( 'Spacer alignment with container column setting', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage(),
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
		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-column-spacer-align-center.jpeg' );
	} );

	test( 'Right container padding for preset c100-c50-50', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
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

	test( 'Container handle should be centered', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		try {
			await wpAdmin.setLanguage( 'he_IL' );
			const editor = await createCanvasPage( wpAdmin );
			await editor.closeNavigatorIfOpen();
			const container = await addContainerAndHover( editor );
			expect.soft( await container.screenshot( {
				type: 'jpeg',
				quality: 100,
			} ) ).toMatchSnapshot( 'container-rtl-centered.jpeg' );
		} finally {
			await wpAdmin.setLanguage( '' );
		}

		const editor = await createCanvasPage( wpAdmin );
		const container = await addContainerAndHover( editor );

		expect.soft( await container.screenshot( {
			type: 'jpeg',
			quality: 90,
		} ) ).toMatchSnapshot( 'container-ltr-centered.jpeg' );
	} );

	test( 'Container Transform controls', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage(),
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
		await expect.soft( editor.getPreviewFrame().locator( containerSelector ) ).toHaveCSS( '--e-con-transform-rotateZ', '2deg' );
		await expect.soft( editor.getPreviewFrame().locator( containerSelector ) ).toHaveCSS( '--e-con-transform-scale', '2' );
	} );

	test( 'Justify icons are displayed correctly', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const breakpoints = Breakpoints.getBasic().reverse();
		const directions = [ 'right', 'down', 'left', 'up' ];
		const editor = await wpAdmin.openNewPage();
		await editor.addElement( { elType: 'container' }, 'document' );
		await testJustifyDirections( directions, breakpoints, editor, page, 'ltr' );
	} );

	test( 'Justify icons are displayed correctly for RTL', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const breakpoints = Breakpoints.getBasic().reverse();
		const directions = [ 'right', 'down', 'left', 'up' ];

		try {
			await wpAdmin.setLanguage( 'he_IL' );
			const editor = await wpAdmin.openNewPage();
			await editor.addElement( { elType: 'container' }, 'document' );
			await testJustifyDirections( directions, breakpoints, editor, page, 'rtl' );
		} finally {
			await wpAdmin.setLanguage( '' );
		}
	} );

	test( 'Widgets are not editable in preview mode', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

		// Add widgets.
		await editor.addWidget( widgets.button, container );
		await editor.addWidget( widgets.heading, container );
		await editor.addWidget( widgets.image, container );

		const preview = editor.getPreviewFrame();

		const resizers = preview.locator( '.ui-resizable-handle.ui-resizable-e' );
		await expect.soft( resizers ).toHaveCount( 4 );

		await editor.togglePreviewMode();
		await expect.soft( resizers ).toHaveCount( 0 );
	} );

	test( 'Test grid container controls', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			containers = [
				{ setting: 'start', id: '' },
				{ setting: 'center', id: '' },
				{ setting: 'end', id: '' },
				{ setting: 'stretch', id: '' },
			];

		// Close Navigator
		await editor.closeNavigatorIfOpen();

		// Add containers and set various controls.
		for ( const [ index, container ] of Object.entries( containers ) ) {
			// Add container.
			containers[ index ].id = await editor.addElement( { elType: 'container' }, 'document' );

			// Set various controls
			await page.locator( '.elementor-control-container_type select' ).selectOption( 'grid' );
			const clickOptions = { position: { x: 0, y: 0 } }; // This is to avoid the "tipsy" alt info that can block the click of the next item.
			await page.locator( `.elementor-control-grid_justify_items .eicon-align-${ container.setting }-h` ).click( clickOptions );
			await page.locator( `.elementor-control-grid_align_items .eicon-align-${ container.setting }-v` ).click( clickOptions );
		}

		// Assert.
		// Check container settings are set as expected in the editor.
		for ( const container of containers ) {
			const element = editor.getPreviewFrame().locator( `.elementor-element-${ container.id }.e-grid .e-con-inner` );
			await expect.soft( element ).toHaveCSS( 'justify-items', container.setting );
			await expect.soft( element ).toHaveCSS( 'align-items', container.setting );
		}

		await editor.publishAndViewPage();

		// Assert.
		// Check container settings are set as expected on frontend.
		for ( const container of containers ) {
			const element = page.locator( `.elementor-element-${ container.id }.e-grid .e-con-inner` );
			await expect.soft( element ).toHaveCSS( 'justify-items', container.setting );
			await expect.soft( element ).toHaveCSS( 'align-items', container.setting );
		}
	} );

	test( 'Verify pasting of elements into the Container Element Add section', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage(),
			containerId1 = await editor.addElement( { elType: 'container' }, 'document' ),
			containerId2 = await editor.addElement( { elType: 'container' }, 'document' ),
			containerId3 = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( widgets.button, containerId1 );
		const headingId = await editor.addWidget( widgets.heading, containerId2 );
		await editor.addWidget( widgets.spacer, containerId3 );

		// Copy container 2 and paste it at the top of the page.
		await editor.copyElement( containerId2 );
		await editor.openAddElementSection( containerId1 );
		await editor.pasteElement( '.elementor-add-section-inline' );

		// Copy container 3 and paste it above container 2.
		await editor.copyElement( containerId3 );
		await editor.openAddElementSection( containerId2 );
		await editor.pasteElement( '.elementor-add-section-inline' );

		// Copy the heading widget and paste it above container 3.
		await editor.copyElement( headingId );
		await editor.openAddElementSection( containerId3 );
		await editor.pasteElement( '.elementor-add-section-inline' );

		// Assert.
		// Expected order:
		// 1. Copy of container 2 with a heading widget.
		// 2. Container 1.
		// 3. Copy of container 3 with a spacer widget.
		// 4. Container 2.
		// 5. A new container with a heading widget.
		// 6. Container 3.
		await expect.soft( editor.getPreviewFrame()
			.locator( '.e-con >> nth=0' )
			.locator( '.elementor-widget' ) )
			.toHaveClass( /elementor-widget-heading/ );
		expect.soft( await editor.getPreviewFrame()
			.locator( '.e-con >> nth=1' )
			.getAttribute( 'data-id' ) )
			.toEqual( containerId1 );
		await expect.soft( editor.getPreviewFrame()
			.locator( '.e-con >> nth=2' )
			.locator( '.elementor-widget' ) )
			.toHaveClass( /elementor-widget-spacer/ );
		expect.soft( await editor.getPreviewFrame()
			.locator( '.e-con >> nth=3' )
			.getAttribute( 'data-id' ) )
			.toEqual( containerId2 );
		await expect.soft( editor.getPreviewFrame()
			.locator( '.e-con >> nth=4' )
			.locator( '.elementor-widget' ) )
			.toHaveClass( /elementor-widget-heading/ );
		expect.soft( await editor.getPreviewFrame()
			.locator( '.e-con >> nth=5' )
			.getAttribute( 'data-id' ) )
			.toEqual( containerId3 );
	} );

	test( 'Test container wizard', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();
		const frame = editor.getPreviewFrame();

		await test.step( 'Test container type selector', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			const toFlex = frame.locator( '.flex-preset-button' );
			const toGrid = frame.locator( '.grid-preset-button' );
			await expect.soft( toFlex ).toBeVisible();
			await expect.soft( toGrid ).toBeVisible();
			await frame.locator( '.elementor-add-section-close' ).click();
		} );

		await test.step( 'Test wizard flex container', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.flex-preset-button' ).click();
			const flexList = frame.locator( '.e-con-select-preset__list' );
			await expect.soft( flexList ).toBeVisible();
			await frame.locator( '.elementor-add-section-close' ).click();
		} );

		await test.step( 'Test wizard grid container', async () => {
			await frame.locator( '.elementor-add-section-button' ).click();
			await frame.locator( '.grid-preset-button' ).click();
			const gridList = frame.locator( '.e-con-select-preset-grid__list' );
			await expect.soft( gridList ).toBeVisible();
		} );
	} );

	test( 'Container no horizontal scroll', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		// Arrange.
		const editor = await wpAdmin.openNewPage(),
			containerSelector = '.elementor-element-edit-mode',
			frame = editor.getPreviewFrame();

		await editor.addElement( { elType: 'container' }, 'document' );

		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

		// Evaluate scroll widths in the browser context.
		const hasNoHorizontalScroll = await frame.evaluate( ( selector ) => {
			const container = document.querySelector( selector );
			return container.scrollWidth <= container.clientWidth;
		}, containerSelector );

		// Check for no horizontal scroll.
		expect.soft( hasNoHorizontalScroll ).toBe( true );
	} );

	test( 'Convert to container does not show when only containers are on the page', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );

		await editor.addWidget( widgets.button, containerId );

		await page.click( '#elementor-panel-saver-button-publish-label' );
		await page.waitForSelector( '#elementor-panel-saver-button-publish.elementor-disabled', { state: 'visible' } );

		await page.reload();
		await editor.ensurePanelLoaded();

		await page.locator( '#elementor-panel-footer-settings' ).click();

		expect.soft( await page.locator( '.elementor-control-convert_to_container' ).count() ).toBe( 0 );
	} );

	test( 'Test spacer inside of the container', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame(),
			spacerSize = '200',
			defaultSpacerSize = '50';

		await test.step( 'Column container, spacer default size', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );
			await editor.addWidget( widgets.image, container );

			const spacerElementHeight = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientHeight );

			expect.soft( String( spacerElementHeight ) ).toBe( defaultSpacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Row container, spacer default size', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			// Set row direction.
			await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

			await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );
			await editor.addWidget( widgets.image, container );

			const spacerElementWidth = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientWidth );

			expect.soft( String( spacerElementWidth ) ).toBe( defaultSpacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Spacer added and container set to column', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' ),
				spacer = await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );

			await editor.addWidget( widgets.image, container );
			await editor.selectElement( spacer );
			await editor.setSliderControlValue( 'space', spacerSize );

			const spacerElementHeight = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientHeight );

			expect.soft( String( spacerElementHeight ) ).toBe( spacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Container set to column and then Spacer added', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			await editor.selectElement( container );

			// Set column direction.
			await page.click( '.elementor-control-flex_direction i.eicon-arrow-down' );

			const spacer = await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );

			await editor.addWidget( widgets.image, container );
			await editor.selectElement( spacer );
			await editor.setSliderControlValue( 'space', spacerSize );

			const spacerElementHeight = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientHeight );

			expect.soft( String( spacerElementHeight ) ).toBe( spacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Spacer added and container set to row', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' ),
				spacer = await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );

			await editor.addWidget( widgets.image, container );
			await editor.selectElement( spacer );
			await editor.setSliderControlValue( 'space', spacerSize );

			await editor.selectElement( container );

			// Set row direction.
			await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

			const spacerElementWidth = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientWidth );

			expect.soft( String( spacerElementWidth ) ).toBe( spacerSize );
			await editor.removeElement( container );
		} );

		await test.step( 'Container set to row and then Spacer added', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			await editor.selectElement( container );

			// Set row direction.
			await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

			const spacer = await editor.addElement( { widgetType: widgets.spacer, elType: 'widget' }, container );

			await editor.addWidget( widgets.image, container );
			await editor.selectElement( spacer );
			await editor.setSliderControlValue( 'space', spacerSize );

			const spacerElementHeight = await frame.locator( '.elementor-widget-spacer' ).evaluate( ( node ) => node.clientWidth );

			expect.soft( String( spacerElementHeight ) ).toBe( spacerSize );
			await editor.removeElement( container );
		} );
	} );

	test( 'Gaps Control test - Check that control placeholder', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage();

		await editor.addElement( { elType: 'container' }, 'document' );

		const desktopGapControlColumnInput = page.locator( '.elementor-control-flex_gap input[data-setting="column"]' ),
			tabletGapControlColumnInput = page.locator( '.elementor-control-flex_gap_tablet input[data-setting="column"]' ),
			mobileGapControlColumnInput = page.locator( '.elementor-control-flex_gap_mobile input[data-setting="column"]' );

		await test.step( 'Check the control initial placeholder', async () => {
			const gapControlPlaceholder = await desktopGapControlColumnInput.getAttribute( 'placeholder' );
			expect( gapControlPlaceholder ).toBe( '20' );
			expect( gapControlPlaceholder ).not.toBe( '[object, object]' );
		} );

		await test.step( 'Check the control placeholder inheritance from desktop to tablet after value change', async () => {
			desktopGapControlColumnInput.fill( '50' );
			await editor.changeResponsiveView( 'tablet' );
			const gapControlPlaceholder = await tabletGapControlColumnInput.getAttribute( 'placeholder' );
			expect( gapControlPlaceholder ).toBe( '50' );
		} );

		await test.step( 'Check the control placeholder inheritance from tablet to mobile after value change', async () => {
			tabletGapControlColumnInput.fill( '40' );
			await editor.changeResponsiveView( 'mobile' );
			const gapControlPlaceholder = await mobileGapControlColumnInput.getAttribute( 'placeholder' );
			expect( gapControlPlaceholder ).toBe( '40' );
		} );
	} );

	test( 'Test dimensions with logical properties using ltr & rtl', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: 'active',
			'nested-elements': 'active',
		} );

		try {
			await wpAdmin.setLanguage( 'he_IL' );

			let editor = await wpAdmin.openNewPage();
			let frame = editor.getPreviewFrame();

			await test.step( 'Load Template', async () => {
				const filePath = _path.resolve( __dirname, `./templates/container-dimensions-ltr-rtl.json` );
				await editor.loadTemplate( filePath, false );
				await frame.waitForSelector( '.e-con.e-parent>>nth=0' );
				await editor.closeNavigatorIfOpen();
			} );

			await test.step( 'Rtl screenshot', async () => {
				await expect( page.locator( 'body' ) ).toHaveClass( /rtl/ );
				await expect( editor.getPreviewFrame().locator( 'body' ) ).toHaveClass( /rtl/ );

				await editor.togglePreviewMode();

				expect.soft( await editor.getPreviewFrame()
					.locator( '.e-con.e-parent>>nth=0' )
					.screenshot( { type: 'png' } ) )
					.toMatchSnapshot( 'container-dimensions-rtl.png' );
			} );

			await test.step( 'Set user language to English', async () => {
				await wpAdmin.setLanguage( 'he_IL', '' );
			} );

			editor = await wpAdmin.openNewPage();
			frame = editor.getPreviewFrame();

			await test.step( 'Load Template', async () => {
				const filePath = _path.resolve( __dirname, `./templates/container-dimensions-ltr-rtl.json` );
				await editor.loadTemplate( filePath, false );
				await frame.waitForSelector( '.e-con.e-parent >> nth=0' );
				await editor.closeNavigatorIfOpen();
			} );

			await test.step( 'Rtl screenshot with LTR UI', async () => {
				await expect( page.locator( 'body' ) ).not.toHaveClass( /rtl/ );
				await expect( editor.getPreviewFrame().locator( 'body' ) ).toHaveClass( /rtl/ );

				await editor.togglePreviewMode();

				await expect.soft( editor.getPreviewFrame()
					.locator( '.e-con.e-parent >> nth=0' ) )
					.toHaveScreenshot( 'container-dimensions-rtl-with-ltr-ui.png' );
			} );
		} finally {
			await wpAdmin.setLanguage( '' );
		}

		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await test.step( 'Load Template', async () => {
			const filePath = _path.resolve( __dirname, `./templates/container-dimensions-ltr-rtl.json` );
			await editor.loadTemplate( filePath, false );
			await frame.waitForSelector( '.e-con.e-parent>>nth=0' );
			await editor.closeNavigatorIfOpen();
		} );

		await test.step( 'Ltr screenshot', async () => {
			await expect( page.locator( 'body' ) ).not.toHaveClass( /rtl/ );
			await expect( editor.getPreviewFrame().locator( 'body' ) ).not.toHaveClass( /rtl/ );

			await editor.togglePreviewMode();

			await expect.soft( editor.getPreviewFrame()
				.locator( '.e-con.e-parent>>nth=0' ) )
				.toHaveScreenshot( 'container-dimensions-ltr.png' );
		} );

		await wpAdmin.setExperiments( {
			'nested-elements': 'inactive',
			container: 'inactive',
		} );
	} );

	test( 'Test child containers default content widths', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.openNewPage();

		await test.step( '“Boxed” Parent container to default to "Full Width" content width on child container ', async () => {
			const parentContainer = await editor.addElement( { elType: 'container' }, 'document' );

			// Act.
			// Just in case it's not Boxed by default
			await page.selectOption( '.elementor-control-content_width >> select', 'boxed' );

			const childContainer = await editor.addElement( { elType: 'container' }, parentContainer );
			const nestedChildContainer1 = await editor.addElement( { elType: 'container' }, childContainer );
			const nestedChildContainer2 = await editor.addElement( { elType: 'container' }, nestedChildContainer1 );

			// Assert
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentContainer }` ) ).toHaveClass( /e-con-boxed/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ childContainer }` ) ).toHaveClass( /e-con-full/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ nestedChildContainer1 }` ) ).toHaveClass( /e-con-full/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ nestedChildContainer2 }` ) ).toHaveClass( /e-con-full/ );
		} );

		await test.step( '“Full Width” Parent container to default to "Boxed" content width on child container', async () => {
			const parentContainer = await editor.addElement( { elType: 'container' }, 'document' );

			await page.selectOption( '.elementor-control-content_width >> select', 'full' );

			const childContainer = await editor.addElement( { elType: 'container' }, parentContainer );
			const nestedChildContainer1 = await editor.addElement( { elType: 'container' }, childContainer );
			const nestedChildContainer2 = await editor.addElement( { elType: 'container' }, nestedChildContainer1 );

			// Assert
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentContainer }` ) ).toHaveClass( /e-con-full/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ childContainer }` ) ).toHaveClass( /e-con-boxed/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ nestedChildContainer1 }` ) ).toHaveClass( /e-con-full/ );
			await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ nestedChildContainer2 }` ) ).toHaveClass( /e-con-full/ );
		} );
	} );
} );

async function createCanvasPage( wpAdmin: WpAdminPage ) {
	const editor = await wpAdmin.openNewPage();
	await editor.useCanvasTemplate();
	return editor;
}

async function addContainerAndHover( editor: EditorPage ) {
	const containerId = await editor.addElement( { elType: 'container' }, 'document' );
	const containerSelector = '.elementor-edit-mode .elementor-element-' + containerId;
	const container = editor.getPreviewFrame().locator( containerSelector );
	editor.getPreviewFrame().hover( containerSelector );
	return container;
}

async function toggleResponsiveControl( page: Page, justifyControlsClass: string, breakpoints: string, i: number ) {
	await page.click( `${ justifyControlsClass } .eicon-device-${ breakpoints[ i ] }` );
	if ( i < breakpoints.length - 1 ) {
		await page.click( `${ justifyControlsClass } .eicon-device-${ breakpoints[ i + 1 ] }` );
	} else {
		await page.click( `${ justifyControlsClass } .eicon-device-${ breakpoints[ 0 ] }` );
	}
}

async function captureJustifySnapShot(
	editor: EditorPage,
	breakpoints: string,
	i: number,
	direction: string,
	page: Page,
	snapshotPrefix: string ) {
	await editor.page.click( `.elementor-control-responsive-${ breakpoints[ i ] } .eicon-arrow-${ direction }` );

	const justifyControlsClass = `.elementor-group-control-justify_content.elementor-control-responsive-${ breakpoints[ i ] }`;
	const justifyControlsContent = await page.$( `${ justifyControlsClass } .elementor-control-content ` );
	await page.waitForLoadState( 'networkidle' ); // Let the icons rotate
	expect.soft( await justifyControlsContent.screenshot( {
		type: 'jpeg',
		quality: 90,
	} ) ).toMatchSnapshot( `container-justify-controls-${ snapshotPrefix }-${ direction }-${ breakpoints[ i ] }.jpeg` );

	await toggleResponsiveControl( page, justifyControlsClass, breakpoints, i );
}

async function testJustifyDirections( directions, breakpoints, editor, page, snapshotPrefix ) {
	for ( const direction of directions ) {
		for ( let i = 0; i < breakpoints.length; i++ ) {
			await captureJustifySnapShot( editor, breakpoints, i, direction, page, snapshotPrefix );
		}
	}
}
