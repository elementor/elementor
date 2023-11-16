import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'Experiment Modal message with multiple dependancies', async () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: 'inactive',
		} );
	} );

	test.afterAll( async ( { browser } ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.close();
	} );

	test( 'Experiment Modal message with multiple dependancies', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor#tab-experiments' );
		await page.locator( '#e-experiment-mega-menu' ).selectOption( 'active' );
		const dialogModal = await page.locator( '.dialog-widget' );
		await expect.soft( dialogModal ).toBeVisible();
		const dialogConfirmMessage = await page.locator( '.dialog-confirm-message' ),
			dialogConfirmMessageText = await dialogConfirmMessage.innerText();
		expect( dialogConfirmMessageText ).toBe( 'In order to use Menu, first you need to activate Flexbox Container Nested Elements.' );
	} );
} );

