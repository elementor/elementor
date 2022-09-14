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

	test( 'Test widgets using container boxed-width and flex-direction row', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Act.
		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

		// Arrange
		// Add widgets.
		await editor.addWidget( 'accordion', container );
		await editor.addWidget( 'divider', container );
		await editor.addWidget( 'spacer', container );
		await editor.addWidget( 'toggle', container );
		await editor.addWidget( 'video', container );

		const accordion = editor.getPreviewFrame().locator( '.elementor-widget-accordion' );
		const divider = editor.getPreviewFrame().locator( '.elementor-widget-divider' );
		const spacer = editor.getPreviewFrame().locator( '.elementor-widget-spacer' );
		const toggle = editor.getPreviewFrame().locator( '.elementor-widget-toggle' );
		const video = editor.getPreviewFrame().locator( '.elementor-widget-video' );

		// Assert
		expect( await accordion.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'accordion-row.jpeg' );

		expect( await divider.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'divider-row.jpeg' );

		expect( await spacer.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'spacer-row.jpeg' );

		expect( await toggle.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'toggle-row.jpeg' );

		expect( await video.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'video-row.jpeg' );

		// Arrange
		// Set full content width
		await page.selectOption( '.elementor-control-content_width >> select', 'full' );

		// Assert
		expect( await accordion.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'accordion-row-full.jpeg' );

		expect( await divider.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'divider-row-full.jpeg' );

		expect( await spacer.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'spacer-row-full.jpeg' );

		expect( await toggle.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'toggle-row-full.jpeg' );

		expect( await video.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'video-row-full.jpeg' );

		// Arrange
		// Flex-direction: column
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-down' );
		// Align items: flex-start
		await page.click( '.elementor-control-align_items i.eicon-align-start-v' );

		// Assert
		expect( await accordion.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'accordion-column-full-start.jpeg' );

		expect( await divider.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'divider-column-full-start.jpeg' );

		expect( await spacer.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'spacer-column-full-start.jpeg' );

		expect( await toggle.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'toggle-column-full-start.jpeg' );

		expect( await video.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'video-column-full-start.jpeg' );

		// Arrange
		// Content Width: boxed
		await page.selectOption( '.elementor-control-content_width >> select', 'boxed' );

		// Assert
		expect( await accordion.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'accordion--column-boxed-start.jpeg' );

		expect( await divider.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'divider--column-boxed-start.jpeg' );

		expect( await spacer.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'spacer--column-boxed-start.jpeg' );

		expect( await toggle.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'toggle--column-boxed-start.jpeg' );

		expect( await video.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'video--column-boxed-start.jpeg' );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );
} );
