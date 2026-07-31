import { expect, test } from '@playwright/test';
import { WpAdminPage } from '../../../pages/wp-admin-page';

test( 'audit panel opens, runs, lists a violation, and deep-links to the offending element', async ( {
	page,
	apiRequests,
}, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();

	await editor.addWidget( 'image' );

	await page.getByRole( 'button', { name: /audit page/i } ).click();

	await expect( page.getByRole( 'button', { name: /run page audit/i } ) ).toBeVisible();

	await page.getByRole( 'button', { name: /run page audit/i } ).click();

	await expect( page.getByRole( 'button', { name: /re-scan/i } ) ).toBeVisible();

	await page.getByRole( 'tab', { name: /accessibility/i } ).click();

	await expect( page.getByText( /images missing alt text/i ) ).toBeVisible();

	await page.getByText( /images missing alt text/i ).click();
	await page
		.getByRole( 'button' )
		.filter( { hasText: /image is missing alt text/i } )
		.first()
		.click();

	await expect(
		editor.getPreviewFrame().locator( '.elementor-element.elementor-element-edit-mode' ),
	).toBeVisible();
} );
