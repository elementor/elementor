import { parallelTest as test } from '../parallelTest';
import { expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';

async function validateGettingsStartedPage( wpAdmin: WpAdminPage ) {
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

		await wpAdmin.gotoDashboard();
		await validateGettingStartedLinkCount( wpAdmin, 0 );
		await validateGettingsStartedPage( wpAdmin );
	} );

	test( 'Is visible if home is not active (default for hosting users)', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( { home_screen: false } );
		// We need to navigate away
		await validateGettingsStartedPage( wpAdmin );
		await validateGettingStartedLinkCount( wpAdmin, 1 );
		await wpAdmin.setExperiments( { home_screen: true }, true );
	} );
} );
