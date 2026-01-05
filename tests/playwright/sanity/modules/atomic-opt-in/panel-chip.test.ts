import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import { expect } from '@playwright/test';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'V4 modal promotion test @promotions', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'V4 chip & modal visible', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openNewPage();
		await page.locator( `.elementor-panel-heading-category-chip` ).click( { force: true } );

		const modalContainer = page.locator( EditorSelectors.panels.popoverCard );
		await expect.soft( modalContainer ).toBeVisible();
		await expect( modalContainer.getByText( 'Atomic Elements' ).first() ).toBeVisible();
		await modalContainer.getByRole( 'button', { name: 'close' } ).click();
		await expect.soft( modalContainer ).toBeHidden();
	} );
} );
