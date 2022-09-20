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

	test( 'Test widgets display inside the container using various directions and content width', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		// Close Navigator
		await editor.closeNavigator();

		// Act.
		// Add widgets.
		await editor.addWidget( 'accordion', containerId );
		await editor.addWidget( 'divider', containerId );
		await editor.addWidget( 'spacer', containerId );
		await editor.addWidget( 'toggle', containerId );
		await editor.addWidget( 'video', containerId );

		// Select spacer element.
		const spacerElement = await editor.getPreviewFrame().waitForSelector( '.elementor-widget-spacer' );
		await spacerElement.hover();
		const spacerEditButton = await editor.getPreviewFrame().waitForSelector( '.elementor-widget-spacer .elementor-editor-element-edit' );
		await spacerEditButton.click();
		// Set background colour.
		await page.locator( '.elementor-tab-control-advanced' ).click();
		await page.waitForSelector( '.elementor-tab-control-advanced.elementor-active' );
		await page.locator( '.elementor-control-_section_background .elementor-panel-heading-title' ).click();
		await page.locator( '.elementor-control-_background_background .eicon-paint-brush' ).click();
		await page.locator( '.elementor-control-_background_color .pcr-button' ).click();
		await page.locator( '.pcr-app.visible .pcr-interaction input.pcr-result' ).fill( '#A81830' );
		// Select container.
		const containerElement = await editor.getPreviewFrame().waitForSelector( '.elementor-element-' + containerId );
		await containerElement.hover();
		const containerEditButton = await editor.getPreviewFrame().waitForSelector( '.elementor-element-' + containerId + ' .elementor-editor-element-edit' );
		await containerEditButton.click();
		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

		const container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'container-row.jpeg' );

		// Act
		// Set full content width
		await page.selectOption( '.elementor-control-content_width >> select', 'full' );

		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'container-row-full.jpeg' );

		// Act
		// Flex-direction: column
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-down' );
		// Align items: flex-start
		await page.click( '.elementor-control-flex_align_items i.eicon-align-start-v' );
		// Set `min-height` to test if there are `flex-grow` issues.
		await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1500' );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'container-column-full-start.jpeg' );

		// Act
		// Content Width: boxed
		await page.selectOption( '.elementor-control-content_width >> select', 'boxed' );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'container-column-boxed-start.jpeg' );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.only( 'Test widgets inside the container using position absolute and fixed', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Close Navigator
		await editor.closeNavigator();

		// Set Canvas template.
		await page.click( '#elementor-panel-footer-settings' );
		await page.selectOption( '.elementor-control-template >> select', 'elementor_canvas' );

		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		const pageView = editor.getPreviewFrame().locator( 'body' );
		// Select container.
		let containerElement = await editor.getPreviewFrame().waitForSelector( '.elementor-element-' + container );
		await containerElement.hover();
		let containerEditButton = await editor.getPreviewFrame().waitForSelector( '.elementor-element-' + container + ' .elementor-editor-element-edit' );
		await containerEditButton.click();
		// Set position absolute.
		await page.locator( '.elementor-tab-control-advanced' ).click();
		await page.selectOption( '.elementor-control-position >> select', 'absolute' );
		await page.locator( '.elementor-control-z_index .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_x .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_y .elementor-control-input-wrapper input' ).fill( '50' );

		// Assert
		// Take screenshot.
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'heading-boxed-absolute.jpeg' );

		// Act
		// Select container.
		containerElement = await editor.getPreviewFrame().waitForSelector( '.elementor-element-' + container );
		await containerElement.hover();
		containerEditButton = await editor.getPreviewFrame().waitForSelector( '.elementor-element-' + container + ' .elementor-editor-element-edit' );
		await containerEditButton.click();
		// Set full content width
		await page.locator( '.elementor-tab-control-layout' ).click();
		await page.selectOption( '.elementor-control-content_width >> select', 'full' );

		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'heading-full-absolute.jpeg' );

		// Act
		// Set position fixed.
		await page.locator( '.elementor-tab-control-advanced' ).click();
		await page.selectOption( '.elementor-control-position >> select', 'fixed' );

		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'heading-full-fixed.jpeg' );

		// Act
		// Set boxed content width
		await page.locator( '.elementor-tab-control-layout' ).click();
		await page.selectOption( '.elementor-control-content_width >> select', 'boxed' );

		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'heading-boxed-fixed.jpeg' );

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
		await expect( editor.getPreviewFrame().locator( '.e-container--width-full ' ) ).toHaveCount( 1 );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );
} );
