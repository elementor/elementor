const { test, expect } = require( '@playwright/test' );
const { getElementSelector } = require( '../assets/elements-utils' );
const { EditorPage } = require( '../pages/editor-page' );
const { WpAdminPage } = require( '../pages/wp-admin-page' );

test( 'Sort items in a Container using DnD', async ( { page } ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page );
	await wpAdmin.login();
	await wpAdmin.setExperiments( {
		container: true,
	} );
	await wpAdmin.openNewPage();

	const editor = new EditorPage( page ),
		container = await editor.addElement( { elType: 'container' }, 'document' );

	await page.selectOption( '[data-setting="flex_direction"]', 'row' );

	// Add widgets.
	const button = await editor.addWidget( 'button', container ),
		heading = await editor.addWidget( 'heading', container ),
		image = await editor.addWidget( 'image', container );

	// Act.
	// Move the button to be last.
	await editor.previewFrame.dragAndDrop(
		getElementSelector( button ),
		getElementSelector( image )
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
} );
