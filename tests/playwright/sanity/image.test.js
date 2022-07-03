const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test( 'Image widget sanity test', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	await editor.addWidget( 'image' );

	// Act.
	await page.click( '.elementor-control-media__preview' );
	await page.click( 'text=Media Library' );
	await page.waitForSelector( 'text=Insert Media' );
	await page.waitForTimeout( 1000 );

	// Check if previous image is already uploaded.
	const previousImage = await page.$( '[aria-label="mountain-image"]' );

	if ( previousImage ) {
		await page.click( '[aria-label="mountain-image"]' );
	} else {
		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/mountain-image.jpeg' );
		await page.waitForSelector( 'text=Showing 1 of 1 media items' );
	}

	await page.click( '.button.media-button' );

	// Assert.
	const img = await editor.getPreviewFrame().waitForSelector( 'img' );
	const src = await img.getAttribute( 'src' );
	expect( src ).not.toBeNull();
} );
