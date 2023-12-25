import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../../../pages/wp-admin-page';

test( 'renderDataBindings() sanity test', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost(),
		elementId = await editor.addWidget( 'testimonial' ),
		elementHandle = await editor.getElementHandle( elementId ),
		elementContent = await elementHandle.$( '.elementor-testimonial-image' );

	// Act - Edit element content.
	await page.click( 'textarea' );
	await page.press( 'textarea', 'Meta+a' );
	await page.fill( 'textarea', '123' );

	// In case of full re-render the image should be removed.
	const isTestimonialImageConnected = await elementContent.evaluate( ( element ) => {
		return element.isConnected;
	} );

	// Assert.
	expect( isTestimonialImageConnected ).toBeTruthy();
} );
