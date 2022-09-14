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

		// Wait for the button to re-render.
		await editor.previewFrame.waitForTimeout( 1000 );

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

	test.only( 'Test widgets display inside the container using various directions and content width', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' );

		// Act.
		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

		// Add widgets.
		await editor.addWidget( 'accordion', containerId );
		await editor.addWidget( 'divider', containerId );
		await editor.addWidget( 'spacer', containerId );
		await editor.addWidget( 'toggle', containerId );
		await editor.addWidget( 'video', containerId );

		const container = editor.getPreviewFrame().locator( '.elementor-element-' + containerId );

		// Assert
		await expect( container ).toHaveCount( 1 );

		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'container-row.jpeg' );

		// Act
		// Set full content width
		await editor.selectOption( '.elementor-control-content_width >> select', 'full' );

		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'container-row-full.jpeg' );

		// Act
		// Flex-direction: column
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-down' );
		// Align items: flex-start
		await page.click( '.elementor-control-align_items i.eicon-align-start-v' );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'container-column-full-start.jpeg' );

		// Act
		// Content Width: boxed
		await editor.selectOption( '.elementor-control-content_width >> select', 'boxed' );

		// Assert
		expect( await container.screenshot( {
			type: 'jpeg',
			quality: 70
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
	
		// Act.
		// Add widget.
		await editor.addWidget( 'heading', container );
		const heading = editor.getPreviewFrame().locator( '.elementor-widget-heading' );
		const pageView = editor.getPreviewFrame().locator( 'body' );
		// Set position absolute.
		await page.locator( '.elementor-tab-control-advanced' ).click();
		await page.selectOption( '.elementor-control-_position >> select', 'absolute' );
		await page.locator( '.elementor-control-_offset_x .elementor-control-input-wrapper input' ).fill( '50' );
		await page.locator( '.elementor-control-_offset_y .elementor-control-input-wrapper input' ).fill( '50' );
	
		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'heading-boxed-absolute.jpeg' );
	
		// Act
		// Set full content width
		await editor.selectOption( '.elementor-control-content_width >> select', 'full' );
	
		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'heading-full-absolute.jpeg' );

		// Act
		// Set position fixed.
		await page.locator( '.elementor-tab-control-advanced' ).click();
		await page.selectOption( '.elementor-control-_position >> select', 'fixed' );
	
		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'heading-full-fixed.jpeg' );

		// Act
		// Set boxed content width
		await editor.selectOption( '.elementor-control-content_width >> select', 'boxed' );
	
		// Assert
		expect( await pageView.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'heading-boxed-fixed.jpeg' );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );
} );
