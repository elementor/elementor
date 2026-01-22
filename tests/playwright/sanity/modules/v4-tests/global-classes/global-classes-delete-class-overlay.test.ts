import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.describe( 'Global Classes - delete assigned class keeps element overlay @v4-tests', () => {
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

		const classManagerButton = page.getByRole( 'button', { name: 'Class Manager' } );
		await expect( classManagerButton ).toBeVisible();
		await classManagerButton.click();

		const saveAndContinueButton = page.getByRole( 'button', { name: 'Save & Continue' } );
		if ( await saveAndContinueButton.isVisible() ) {
			await expect( saveAndContinueButton ).toBeEnabled();
			await saveAndContinueButton.click();
		}

		const classRow = page.getByRole( 'listitem' ).filter( { hasText: className } ).first();
		await expect( classRow ).toBeVisible();

		const moreActionsButton = classRow.getByRole( 'button', { name: 'More actions', exact: true } );
		await expect( moreActionsButton ).toBeVisible();
		await moreActionsButton.click();

		const deleteMenuItem = page.getByRole( 'menuitem', { name: 'Delete' } );
		await expect( deleteMenuItem ).toBeVisible();
		await expect( deleteMenuItem ).toBeEnabled();
		await deleteMenuItem.click();

		const deleteDialog = page.getByRole( 'dialog', { name: 'Delete this class?' } );
		await expect( deleteDialog ).toBeVisible();

		const confirmDeleteButton = deleteDialog.getByRole( 'button', { name: 'Delete' } );
		await expect( confirmDeleteButton ).toBeVisible();
		await expect( confirmDeleteButton ).toBeEnabled();
		await confirmDeleteButton.click();

		const saveChangesButton = page.getByRole( 'button', { name: 'Save changes' } );
		if ( await saveChangesButton.isVisible() ) {
			await expect( saveChangesButton ).toBeEnabled();
			await saveChangesButton.click();
		}

		const overlay = divBlock.locator('.elementor-element-overlay');
		await expect( overlay ).toHaveCount( 1 );
	} );
} );

