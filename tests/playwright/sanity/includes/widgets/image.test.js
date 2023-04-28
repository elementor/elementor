const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );

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

test( 'Lightbox image captions aligned center', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();
	const frame = page.frameLocator( '#elementor-preview-iframe' );

	await test.step( 'Act', async () => {
		await editor.addWidget( 'image' );

		await page.locator( '.elementor-control-media__preview' ).click();
		await page.getByRole( 'tab', { name: 'Media Library' } ).click();
		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/elementor1.png' );
		await page.locator( '#attachment-details-title' ).fill( 'Elementor Logo (title)' );
		await page.locator( '#attachment-details-description' ).fill( 'WP + Elementor = ❤️ (description)' );
		await page.getByRole( 'button', { name: 'Select', exact: true } ).click();

		await page.getByRole( 'combobox', { name: 'Caption' } ).selectOption( 'attachment' );
		await page.getByRole( 'combobox', { name: 'Link' } ).selectOption( 'file' );
		await page.getByRole( 'combobox', { name: 'Lightbox' } ).selectOption( 'yes' );
		await frame.locator( '.elementor-widget-image' ).click();
	} );

	await test.step( 'Assert', async () => {
		const title = frame.locator( '.elementor-slideshow__title' );
		const description = frame.locator( '.elementor-slideshow__description' );
		await expect( title ).toHaveCSS( 'text-align', 'center' );
		await expect( description ).toHaveCSS( 'text-align', 'center' );
	} );
} );
