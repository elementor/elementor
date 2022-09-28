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

	test( 'Widget display inside container flex wrap', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		const editor = await wpAdmin.useElementorCleanPost(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			containerElement = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + container );

		// Set row direction.
		await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );
		// Set flex-wrap: wrap.
		await page.click( '.elementor-control-flex_wrap .elementor-control-input-wrapper .eicon-wrap' );

		// Act.
		await editor.addWidget( 'google_maps', container );
		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );

		await editor.addWidget( 'video', container );
		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );
		await wpAdmin.setWidgetToFlewGrow();

		await editor.addWidget( 'slides', container );
		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );

		await editor.addWidget( 'reviews', container );
		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );
		await wpAdmin.setWidgetToFlewGrow();

		await editor.addWidget( 'testimonial-carousel', container );
		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );

		await editor.addWidget( 'media-carousel', container );
		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );
		await wpAdmin.setWidgetToFlewGrow();

		await editor.addWidget( 'image-carousel', container );
		await wpAdmin.populateImageCarousel();
		// Set widget custom width to 40%.
		await wpAdmin.setWidgetCustomWidth( '40' );

		// Assert.
		expect( await containerElement.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'container-row-flex-wrap.jpeg' );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );
} );
