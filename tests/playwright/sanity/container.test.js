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

	test.only( 'Accordion test screenshot1', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();
	   
		// Act.
		await editor.addWidget( 'accordion' );
		const accordion = editor.getPreviewFrame().locator( '.elementor-widget-wrap > .elementor-background-overlay' );
		await expect( accordion ).toHaveCount( 1 );
	   
	   	// Assert
		expect( await accordion.screenshot( { type: 'jpeg', quality: 70 } ) ).toMatchSnapshot( 'accordion-test1.jpeg' );
	} );

	// test( 'Test widgets display inside the container using various directions and content width', async ( { page }, testInfo ) => {
	// 	// Arrange.
	// 	const wpAdmin = new WpAdminPage( page, testInfo );
	// 	await wpAdmin.setExperiments( {
	// 		container: true,
	// 	} );

	// 	const editor = await wpAdmin.useElementorCleanPost(),
	// 		container = await editor.addElement( { elType: 'container' }, 'document' );

	// 	// Act.
	// 	// Set row direction.
	// 	await page.click( '.elementor-control-flex_direction i.eicon-arrow-right' );

	// 	// Add widgets.
	// 	await editor.addWidget( 'accordion', container );
	// 	await editor.addWidget( 'divider', container );
	// 	await editor.addWidget( 'spacer', container );
	// 	await editor.addWidget( 'toggle', container );
	// 	await editor.addWidget( 'video', container );

	// 	const accordion = editor.getPreviewFrame().locator( '.elementor-widget-accordion' );
	// 	const divider = editor.getPreviewFrame().locator( '.elementor-widget-divider' );
	// 	const spacer = editor.getPreviewFrame().locator( '.elementor-widget-spacer' );
	// 	const toggle = editor.getPreviewFrame().locator( '.elementor-widget-toggle' );
	// 	const video = editor.getPreviewFrame().locator( '.elementor-widget-video' );
	// 	editor.getPreviewFrame().locator( '.elementor-widget-wrap > .elementor-background-overlay' )

	// 	// Assert
	// 	await expect( accordion ).toHaveCount( 1 );
	// 	expect( await accordion.screenshot( { type: 'jpeg', quality: 70 } ) ).toMatchSnapshot( 'accordion-container-row.jpeg' );
	// 	expect( await accordion.screenshot( { type: 'jpeg', quality: 70 } ) ).toMatchSnapshot( 'accordion.jpeg' );

	// 	// expect( await divider.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'divider-row.jpeg' );

	// 	// expect( await spacer.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'spacer-row.jpeg' );

	// 	// expect( await toggle.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'toggle-row.jpeg' );

	// 	// expect( await video.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'video-row.jpeg' );

	// 	// // Act
	// 	// // Set full content width
	// 	// await editor.selectOption( '.elementor-control-content_width >> select', 'full' );

	// 	// // Assert
	// 	// expect( await accordion.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'accordion-row-full.jpeg' );

	// 	// expect( await divider.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'divider-row-full.jpeg' );

	// 	// expect( await spacer.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'spacer-row-full.jpeg' );

	// 	// expect( await toggle.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'toggle-row-full.jpeg' );

	// 	// expect( await video.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'video-row-full.jpeg' );

	// 	// // Act
	// 	// // Flex-direction: column
	// 	// await page.click( '.elementor-control-flex_direction i.eicon-arrow-down' );
	// 	// // Align items: flex-start
	// 	// await page.click( '.elementor-control-align_items i.eicon-align-start-v' );

	// 	// // Assert
	// 	// expect( await accordion.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'accordion-column-full-start.jpeg' );

	// 	// expect( await divider.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'divider-column-full-start.jpeg' );

	// 	// expect( await spacer.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'spacer-column-full-start.jpeg' );

	// 	// expect( await toggle.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'toggle-column-full-start.jpeg' );

	// 	// expect( await video.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'video-column-full-start.jpeg' );

	// 	// // Act
	// 	// // Content Width: boxed
	// 	// await editor.selectOption( '.elementor-control-content_width >> select', 'boxed' );

	// 	// // Assert
	// 	// expect( await accordion.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'accordion-column-boxed-start.jpeg' );

	// 	// expect( await divider.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'divider-column-boxed-start.jpeg' );

	// 	// expect( await spacer.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'spacer-column-boxed-start.jpeg' );

	// 	// expect( await toggle.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'toggle-column-boxed-start.jpeg' );

	// 	// expect( await video.screenshot( {
	// 	// 	type: 'jpeg',
	// 	// 	quality: 70
	// 	// } ) ).toMatchSnapshot( 'video-column-boxed-start.jpeg' );

	// 	await wpAdmin.setExperiments( {
	// 		container: false,
	// 	} );
	// } );

	// test( 'Test widgets inside the container using position absolute and fixed', async ( { page }, testInfo ) => {
	// 	// Arrange.
	// 	const wpAdmin = new WpAdminPage( page, testInfo );
	// 	await wpAdmin.setExperiments( {
	// 		container: true,
	// 	} );
	
	// 	const editor = await wpAdmin.useElementorCleanPost(),
	// 		container = await editor.addElement( { elType: 'container' }, 'document' );
	
	// 	// Act.
	// 	// Add widget.
	// 	await editor.addWidget( 'heading', container );
	// 	const heading = editor.getPreviewFrame().locator( '.elementor-widget-heading' );
	// 	const editorScreen = editor.getPreviewFrame().locator( 'body' );
	// 	// Set position absolute.
	// 	await page.locator( '.elementor-tab-control-advanced' ).click();
	// 	await page.selectOption( '.elementor-control-position >> select', 'absolute' );
	// 	await page.locator( '.elementor-control-_offset_x input' ).fill( 50 );
	// 	await page.locator( '.elementor-control-_offset_y input' ).fill( 50 );
	
	// 	// Assert
	// 	await expect( editorScreen.toHaveCount( 1 ) );

	// 	expect( await editorScreen.screenshot( {
	// 		type: 'jpeg',
	// 		quality: 70
	// 	} ) ).toMatchSnapshot( 'heading-boxed-absolute.jpeg' );
	
	// 	// Act
	// 	// Set full content width
	// 	await editor.selectOption( '.elementor-control-content_width >> select', 'full' );
	
	// 	// Assert
	// 	expect( await heading.screenshot( {
	// 		type: 'jpeg',
	// 		quality: 70
	// 	} ) ).toMatchSnapshot( 'heading-full-absolute.jpeg' );

	// 	// Act
	// 	// Set position fixed.
	// 	await page.locator( '.elementor-tab-control-advanced' ).click();
	// 	await page.selectOption( '.elementor-control-position >> select', 'fixed' );
	
	// 	// Assert
	// 	expect( await heading.screenshot( {
	// 		type: 'jpeg',
	// 		quality: 70
	// 	} ) ).toMatchSnapshot( 'heading-full-fixed.jpeg' );

	// 	// Act
	// 	// Set boxed content width
	// 	await editor.selectOption( '.elementor-control-content_width >> select', 'boxed' );
	
	// 	// Assert
	// 	expect( await heading.screenshot( {
	// 		type: 'jpeg',
	// 		quality: 70
	// 	} ) ).toMatchSnapshot( 'heading-boxed-fixed.jpeg' );

	// 	await wpAdmin.setExperiments( {
	// 		container: false,
	// 	} );
	// } );

} );
