import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Checklist tests ', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			editor_v2: true,
			'launchpad-checklist': true,
		} );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			editor_v2: false,
			'launchpad-checklist': false,
		} );
		await page.close();
	} );

	test.describe( 'Checklist module', () => {
		test( 'General test', async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
				editor = await wpAdmin.openNewPage();

			await test.step( 'Rocket Icon in top bar is visible', async () => {
				const rocketButton = editor.page.locator( '[aria-label="Checklist"]' );
				await expect( rocketButton ).toBeVisible();
			} );

			await test.step( 'Open checklist trigger', async () => {
				const rocketButton = editor.page.locator( '[aria-label="Checklist"]' ),
					checklist = editor.page.locator( '#e-checklist > div' );

				await rocketButton.click();
				await expect( checklist ).toBeVisible();
			} );

			await test.step( 'Close checklist trigger', async () => {
				const closeButton = editor.page.locator( '#e-checklist > div [aria-label="close"]' ),
					checklist = editor.page.locator( '#e-checklist > div' );

				await closeButton.click();
				await expect( checklist ).toBeHidden();
			} );
		} );
	} );
} );
