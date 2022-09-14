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

		// await expect( accordion ).toHaveCount( 1 );
		// await expect( divider ).toHaveCount( 1 );
		// await expect( spacer ).toHaveCount( 1 );
		// await expect( toggle ).toHaveCount( 1 );
		// await expect( video ).toHaveCount( 1 );

		// Assert
		await expect( accordion.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'accordion-row.jpeg' );

		await expect( divider.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'divider-row.jpeg' );

		await expect( spacer.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'spacer-row.jpeg' );

		await expect( toggle.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'toggle-row.jpeg' );

		await expect( video.screenshot( {
			type: 'jpeg',
			quality: 70
		} ) ).toMatchSnapshot( 'video-row.jpeg' );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );
} );
