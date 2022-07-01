const { test, expect } = require( '@playwright/test' );
const { getElementSelector } = require( '../assets/elements-utils' );
const WpAdminPage = require( '../pages/wp-admin-page' );

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
