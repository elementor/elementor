import { parallelTest as test } from '../parallelTest';
import { expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';
import { wpCli } from '../assets/wp-cli';

async function validateGettingStartedPage( wpAdmin: WpAdminPage ) {
	await wpAdmin.page.goto( '/wp-admin/admin.php?page=elementor-getting-started' );
	expect( await wpAdmin.page.locator( '.e-getting-started' ).count() ).toEqual( 1 );
}

async function validateGettingStartedLinkCount( wpAdmin: WpAdminPage, expectedCount ) {
	await wpAdmin.page.locator( 'li .toplevel_page_elementor' ).click();
	expect( await wpAdmin.page.getByText( 'Getting Started' ).count() ).toEqual( expectedCount );
}

test.describe( 'General Settings', () => {
	test( 'Is hidden if home is active (default for plugin users)', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openWordPressDashboard();
		await validateGettingStartedLinkCount( wpAdmin, 0 );
		await validateGettingStartedPage( wpAdmin );
	} );

	test( 'Is visible if home is not active (default for hosting users)', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		await wpCli( 'wp elementor experiments deactivate home_screen' );
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// We need to navigate away
		await validateGettingStartedPage( wpAdmin );
		await validateGettingStartedLinkCount( wpAdmin, 1 );
		
		// Cleanup
		await wpCli( 'wp elementor experiments activate home_screen' );
	} );
} );
