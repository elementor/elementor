import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../../parallelTest';
import WpAdminPage from '../../../../../../pages/wp-admin-page';

test( 'renderDataBindings() sanity test', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
		editor = await wpAdmin.openNewPage(),
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
