import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Transform repeater persistence @atomic-widgets', () => {
	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Transform repeater items in hover state should persist after page refresh', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );

		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const headingId = await editor.addWidget( { widgetType: 'e-heading', container } );

		// Act
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.selectClassState( 'hover', 'local' );
		await editor.openV2Section( 'effects' );

		const addTransformButton = page.getByRole( 'button', { name: 'Add transform item' } );
		await addTransformButton.click();
		const moveItem = page.locator( 'li:has-text("Move")' ).first();
		await moveItem.waitFor( { state: 'visible', timeout: 15000 } );
		await moveItem.click( { force: true } );

		await page.keyboard.press( 'Escape' );
		await editor.selectElement( headingId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.selectClassState( 'hover', 'local' );
		await editor.openV2Section( 'effects' );

		// Assert
		const transformItems = page.locator( '.MuiTag-root' );
		await transformItems.waitFor( { state: 'visible', timeout: 10000 } );
		await expect( transformItems ).toHaveCount( 1 );

		// Publish
		await editor.publishPage();

		// Refresh
		await page.reload();
		await page.waitForLoadState( 'networkidle' );
		await wpAdmin.waitForPanel();

		await editor.selectElement( headingId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.selectClassState( 'hover', 'local' );
		await editor.openV2Section( 'effects' );

		// Assert
		const transformItemsAfterRefresh = page.locator( '.MuiTag-root' );
		await expect( transformItemsAfterRefresh ).toHaveCount( 1 );
	} );
} );
