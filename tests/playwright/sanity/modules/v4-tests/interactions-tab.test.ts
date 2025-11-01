import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

test.describe( 'Interactions Tab @v4-tests', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_interactions: 'active',
			e_atomic_elements: 'active',
		} );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Interactions tab is visible when experiment is active', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Add atomic widget to enable panel tabs', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container } );
		} );

		await test.step( 'Verify interactions tab is present', async () => {
			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await expect( interactionsTab ).toBeVisible();
		} );
	} );

	test( 'Interactions tab displays empty state correctly', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const panelSelector = '#elementor-panel-inner';

		await test.step( 'Setup widget and navigate to interactions tab', async () => {
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container } );
		} );

		await test.step( 'Open interactions tab and capture screenshot', async () => {
			const interactionsTab = page.getByRole( 'tab', { name: 'Interactions' } );
			await interactionsTab.click();

			await expect.soft( page.locator( panelSelector ) ).toHaveScreenshot( 'interactions-empty-state.png' );
		} );
	} );
} );
