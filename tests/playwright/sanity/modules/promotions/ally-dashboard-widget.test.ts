import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

const ALLY_WIDGET_SELECTOR = '#e-dashboard-ally.postbox';

test.describe( 'Ally dashboard widget @promotions', () => {
	test( 'Accessibility widget is visible on WordPress dashboard when Ally is not installed', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.login();
		await wpAdmin.openWordPressDashboard();

		// Assert.
		const allyWidget = page.locator( ALLY_WIDGET_SELECTOR );
		await expect( allyWidget ).toBeVisible();
		await expect( allyWidget ).toContainText( 'Accessibility' );
		await expect( allyWidget.getByRole( 'link', { name: /Run free scan|Get it free/ } ) ).toBeVisible();

		// Assert 2.
		await expect( page.locator( ALLY_WIDGET_SELECTOR ) ).toHaveScreenshot( 'ally-dashboard-widget.png' );
	} );
} );
