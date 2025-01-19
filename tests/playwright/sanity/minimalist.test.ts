import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';
import { expect } from '@playwright/test';
import { resolve } from 'path';

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
	await page.locator( '.elementor-control-media__preview' ).click();
	await page.locator( 'text=Media Library' ).click();
	await page.waitForSelector( 'text=Insert Media' );
	await page.locator( '[id="menu-item-upload"]' ).click();
	await page.setInputFiles( 'input[type="file"]', resolve( __dirname, '../resources/mountain-image.jpeg' ) );
	await page.getByRole( 'button', { name: 'Insert Media' } )
		.or( page.getByRole( 'button', { name: 'Select' } ) ).nth( 1 ).click();
	await editor.openSection( 'bio_section' );
	await editor.setTextareaControlValue( 'bio_heading', 'This is a heading' );
	await editor.setTextareaControlValue( 'bio_title', 'This is a title' );
	await editor.setTextareaControlValue( 'bio_description', 'Test description' );
	await editor.togglePreviewMode();

	// Assert.
	await expect.soft( editor.getPreviewFrame().locator( '.e-link-in-bio__content' ) ).toHaveScreenshot( 'minimalist.png' );
} );
