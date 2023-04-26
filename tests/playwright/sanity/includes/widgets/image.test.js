const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );

test( 'Lightbox image captions aligned center', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();

	// Act.
	const frame = page.frameLocator( '#elementor-preview-iframe' );
	await editor.addWidget( 'image' );

	await page.locator( '.elementor-control-media__preview' ).click();
	await page.getByRole( 'tab', { name: 'Media Library' } ).click();
	await page.getByRole( 'checkbox', { name: 'pennant-1.jpg' } ).click();
	await page.locator( '#attachment-details-title' ).fill( 'Wordpress Flag (title)' );
	await page.locator( '#attachment-details-alt-text' ).fill( 'Wordpress since 2003 (alt)' );
	await page.locator( '#attachment-details-caption' ).fill( 'WP + Elementor = ❤️ (caption)' );
	await page.locator( '#attachment-details-description' ).fill( 'Wordpress est 2003 (description)' );
	await page.getByRole( 'button', { name: 'Select', exact: true } ).click();

	await page.getByRole( 'combobox', { name: 'Caption' } ).selectOption( 'attachment' );
	await page.getByRole( 'combobox', { name: 'Link' } ).selectOption( 'file' );
	await page.getByRole( 'combobox', { name: 'Lightbox' } ).selectOption( 'yes' );
	await frame.locator( '.elementor-widget-image' ).click();

	// Assert
	const title = frame.locator( '.elementor-slideshow__title' );
	const description = frame.locator( '.elementor-slideshow__description' );
	await expect( title ).toHaveCSS( 'text-align', 'center' );
	await expect( description ).toHaveCSS( 'text-align', 'center' );
} );
