import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Playing cards widget sanity test', () => {
	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdminPage.resetExperiments();
	} );

	test( 'it successfully adds card', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'playing-cards' );
		await page.click( 'text=Add Item' );

		// Assert.
		expect( await editor.getPreviewFrame()
			.locator( '.e-playing-cards' )
			.screenshot( { type: 'jpeg', quality: 90 } ) )
			.toMatchSnapshot( 'playing-cards.jpeg' );
	} );
} );
