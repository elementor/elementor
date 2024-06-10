import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'General Settings', () => {
	test( 'Is hidden if home is active', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( { home_screen: true } );
		await wpAdmin.page.locator( '.toplevel_page_elementor' ).click();
		expect( await wpAdmin.page.getByText( `Getting Started` ).count() ).toEqual( 0 );
	} );

	test( 'Is visible if home is not active', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( { home_screen: false } );
		await wpAdmin.page.locator( '.toplevel_page_elementor' ).click();
		expect( await wpAdmin.page.getByText( 'Getting Started' ).count() ).toEqual( 0 );
	} );
} );
