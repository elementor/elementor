import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test( 'Heading widget added using shortcode with non-correct payload', async ( { page, apiRequests }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();
	const testShortcode = '[elementor-element data="eyJpZCI6IjIyODIzYzYiLCJlbFR5cGUiOiJ3aWRnZXQiLCJpc0lubmVyIjpmYWxzZSwiaXNMb2NrZWQiOmZhbHNlLCJzZXR0aW5ncyI6eyJjb250ZW50X3dpZHRoIjoiZnVsbCIsInRpdGxlIjoiSG93ZHkgPHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pm93ZHkifSwiZWxlbWVudHMiOltdLCJ3aWRnZXRUeXBlIjoiaGVhZGluZyJ9"]';

	let alertDetected = false;
	page.on( 'dialog', async ( dialog ) => {
		alertDetected = true;
		await dialog.dismiss();
	} );

	await editor.addWidget( 'shortcode' );
	await page.locator( '.elementor-control-shortcode textarea' ).fill( testShortcode );

	expect( alertDetected ).toBe( false );
	expect( await editor.getPreviewFrame().locator( '.elementor-heading-title' ).textContent() ).toBe( 'Howdy alert(1)owdy' );
} );
