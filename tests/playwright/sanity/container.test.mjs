import { test, expect } from '@playwright/test';
import EditorPage from '../pages/editor-page.mjs';
import WpAdminPage from '../pages/wp-admin-page.mjs';
import { getElementSelector } from '../assets/elements-utils.mjs';

test( 'Sort items in a Container using DnD', async ( { page }, testInfo) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );

	await wpAdmin.login();
	await wpAdmin.setExperiments( {
		container: true,
	} );

	await wpAdmin.createNewPage();

	const editor = new EditorPage( page, testInfo ),
		container = await editor.addElement( { elType: 'container' }, 'document' );

	await page.selectOption( '[data-setting="flex_direction"]', 'row' );

	// Add widgets.
	const eButton = await editor.addWidget( 'button', container ),
		eHeading = await editor.addWidget( 'heading', container ),
		eImage = await editor.addWidget( 'image', container );

	// Act.
	// Move the button to be last.
	await editor.previewFrame.dragAndDrop(
		getElementSelector( eButton ),
		getElementSelector( eImage )
	);

	// Wait for the button to re-render.
	await editor.previewFrame.waitForTimeout( 1000 );

	const buttonEl = await editor.getElementHandle( eButton ),
		headingEl = await editor.getElementHandle( eHeading );

	const elBeforeButton = await buttonEl.evaluate( ( node ) => node.previousElementSibling ),
		elAfterHeading = await headingEl.evaluate( ( node ) => node.nextElementSibling );

	// Assert.
	// Test that the image is between the heading & button.
	expect( elBeforeButton ).toBe( elAfterHeading );
} );
