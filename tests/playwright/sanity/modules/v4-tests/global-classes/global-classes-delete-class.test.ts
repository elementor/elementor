import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.describe( 'Global Classes - Delete Class @v4-tests', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Deleting an assigned class from Class Manager should not remove the element overlay', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active', e_classes: 'active' } );

		const editor = await wpAdmin.openNewPage();
		const divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );

		await editor.selectElement( divBlockId );
		await editor.v4Panel.openTab( 'style' );

		const className = 'overlay-test-class';
		await editor.v4Panel.style.addGlobalClass( className );

		const divBlock = editor.getPreviewFrame().locator( `[data-id="${ divBlockId }"]` );
		await expect( divBlock ).toHaveClass( new RegExp( `\\b${ className }\\b` ) );

	await page.getByRole( 'button', { name: 'Class Manager' } ).click();
	await page.getByRole( 'button', { name: 'Save & Continue' } ).click();
	await page.locator( '[aria-label="Got it introduction"]' ).click();
	await page.locator( '[aria-label="More actions"]' ).first().click();
	await page.getByRole( 'menuitem', { name: 'Delete' } ).click();
	await page.getByRole( 'button', { name: 'Delete' } ).click();
	await page.getByRole( 'button', { name: 'Save changes' } ).click();

	const overlay = divBlock.locator( '.elementor-element-overlay' );
		await expect( overlay ).toHaveCount( 1 );
	} );
} );

