import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';
import { resolve } from 'path';

test.describe( 'Gallery widget', () => {
	test( 'is visible in preview', async ( { page, apiRequests }, testInfo ) => {
		const resourcesBaseDir = resolve( __dirname, '../resources/' );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage();

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );

		await page.locator( '.elementor-group-control-direction [data-tooltip="Row - horizontal"]' ).first().click();

		const containerChildId = await editor.addElement( { elType: 'container' }, containerId );

		await editor.addWidget( 'gallery', containerChildId );

		// Add images
		const images = [ 'A', 'B', 'C', 'D', 'E' ];
		const imageFileType = '.jpeg';

		await editor.uploadImages( images, resourcesBaseDir, imageFileType, beforeImageUpload, afterImageUpload );

		await editor.publishAndViewPage();

		await page.locator( '.e-gallery-image-loaded' ).last().waitFor();
		const gallery = page.locator( '.elementor-widget-gallery' );
		await gallery.waitFor();
		await expect( gallery ).toHaveScreenshot( 'gallery-preview.png' );
	} );
} );

async function beforeImageUpload( editor: EditorPage ) {
	await editor.page.locator( '.eicon-plus-circle' ).first().click();
}

async function afterImageUpload( editor: EditorPage ) {
	await editor.page.click( 'text=Create a new gallery' );
	await editor.page.click( 'text=Insert gallery' );
}
