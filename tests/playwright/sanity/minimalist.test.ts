import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';
import { expect } from '@playwright/test';

test( 'Minimalist widget basic sanity test with content in bio tab', async ( { browser, apiRequests }, testInfo ) => {
	// Arrange.
	const context = await browser.newContext();
	const page = await context.newPage();
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = new EditorPage( page, testInfo );
	await wpAdmin.openNewPage();
	await editor.closeNavigatorIfOpen();   

	// Act.
	await editor.addWidget( 'link-in-bio' );

	// Assert.
	await page.locator( '.elementor-control-media__preview' ).click();
	await page.locator( 'text=Media Library' ).click();
	await page.waitForSelector( 'text=Insert Media' );
	await page.click( '[aria-label="mountain-image"], li[tabindex="0"]' );
	await page.getByRole( 'button', { name: 'Insert Media' } )
		.or( page.getByRole( 'button', { name: 'Select' } ) ).nth( 1 ).click();
	await page.locator( '[data-collapse_id="bio_section"]' ).click();
	await page.locator( '[data-setting="bio_heading"]' ).fill( 'This is a test' );
	await page.locator( '[data-setting="bio_title"]' ).fill( 'This is a test' );
	await page.locator( '[data-setting="bio_description"]' ).fill( 'This is a test' );
	await editor.togglePreviewMode();
	expect( await editor.getPreviewFrame()
		.locator( '.e-link-in-bio__content' )
		.screenshot( { type: 'jpeg', quality: 90 } ) )
		.toMatchSnapshot( 'minimalist.jpeg' );
} );
