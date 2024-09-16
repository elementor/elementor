import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test( 'Image widget sanity test', async ( { page, apiRequests }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();

	await editor.addWidget( 'image' );

	await page.click( '.elementor-control-media__preview' );
	await page.click( 'text=Media Library' );
	await page.waitForSelector( 'text=Insert Media' );
	await page.locator( '#menu-item-upload' ).click();
	await page.waitForLoadState( 'networkidle' );

	// Check if previous image is already uploaded
	const previousImage = await page.$( '[aria-label="mountain-image"], li[tabindex="0"]' );
	if ( previousImage ) {
		await page.click( '[aria-label="mountain-image"], li[tabindex="0"]' );
	} else {
		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/mountain-image.jpeg' );
		await page.waitForSelector( 'text=Delete permanently' );
	}

	await page.click( '.button.media-button' );
	await page.waitForLoadState( 'networkidle' );
	const img = await editor.getPreviewFrame().waitForSelector( 'img' );
	const src = await img.getAttribute( 'src' );
	expect( src ).toContain( '.jpeg' );
} );
