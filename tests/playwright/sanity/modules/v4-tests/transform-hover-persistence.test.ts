import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Transform repeater persistence @atomic-widgets', () => {

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Transform repeater items in hover state should persist after page refresh', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		
		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
		
		const editor = await wpAdmin.openNewPage( false, false );
		await editor.addWidget( { widgetType: 'e-heading' } );

		// Act - Switch to hover state
		await editor.v4Panel.openTab( 'style' );
		await page.waitForTimeout( 500 );
		
		// Click on the 3 dots menu button to open CSS Class Menu
		await page.getByRole( 'button', { name: 'Open CSS Class Menu' } ).click();
		await page.waitForTimeout( 500 );
		
		// Select hover from the menu
		await page.getByRole( 'menuitem', { name: 'hover' } ).click();
		await page.waitForTimeout( 500 );
		
		// Open effects section
		await editor.openV2Section( 'effects' );

		const addTransformButton = page.getByRole( 'button', { name: 'Add transform item' } );
		
		// Add Move in hover state
		await addTransformButton.click();
		await page.locator( 'li:has-text("Move")' ).first().click( { force: true } );
		
		// Add Scale in hover state
		await addTransformButton.click();
		await page.locator( 'li:has-text("Scale")' ).first().click( { force: true } );

		// Assert - Before refresh (should have 2 transform items)
		await page.waitForTimeout( 1000 );
		const transformItems = page.locator( '.MuiTag-root' );
		await expect( transformItems ).toHaveCount( 2 );

		// Publish the page to save changes
		await page.getByRole( 'button', { name: 'Publish' } ).click();
		await page.waitForTimeout( 2000 );

		// Act - Refresh page
		await page.reload();
		await page.waitForLoadState( 'load' );
		await page.waitForTimeout( 5000 );

		// Navigate back to style tab and hover state
		await editor.v4Panel.openTab( 'style' );
		await page.waitForTimeout( 500 );
		
		// Click on the 3 dots menu button to open CSS Class Menu again
		await page.getByRole( 'button', { name: 'Open CSS Class Menu' } ).click();
		await page.waitForTimeout( 500 );
		
		// Select hover state again
		await page.getByRole( 'menuitem', { name: 'hover' } ).click();
		await page.waitForTimeout( 500 );
		
		// Open effects section
		await editor.openV2Section( 'effects' );

		// Assert - After refresh (should still have 2 transform items in hover state)
		await page.waitForTimeout( 1000 );
		const transformItemsAfterRefresh = page.locator( '.MuiTag-root' );
		await expect( transformItemsAfterRefresh ).toHaveCount( 2 );
	} );
} );
