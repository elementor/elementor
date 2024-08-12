import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { controlIds, selectors } from './selectors';

test.describe( 'Launchpad checklist tests', () => {
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

	// test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
	// 	const context = await browser.newContext();
	// 	const page = await context.newPage();
	// 	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	//
	// 	await wpAdmin.setExperiments( {
	// 		editor_v2: false,
	// 		'launchpad-checklist': false,
	// 	} );
	//
	// 	await page.close();
	// } );

	test.describe( 'Checklist module', () => {
		test( 'General test', async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
				editor = await wpAdmin.openNewPage();

			await test.step( 'Rocket Icon in top bar is visible', async () => {
				const rocketButton = editor.page.locator( controlIds.topBar.icon );
				await expect( rocketButton ).toBeVisible();
			} );

			await test.step( 'Open checklist trigger', async () => {
				const rocketButton = editor.page.locator( controlIds.topBar.icon ),
					checklist = editor.page.locator( selectors.popup );

				await rocketButton.click();
				await expect( checklist ).toBeVisible();
			} );

			await test.step( 'Close checklist trigger', async () => {
				const closeButton = editor.page.locator( selectors.closeButton ),
					checklist = editor.page.locator( selectors.popup );

				await closeButton.click();
				await expect( checklist ).toBeHidden();
			} );
		} );
	} );

	test.only( 'Checklist should be displayed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Assert switch is visible in user preferences', async () => {
			await editor.openUserPreferencesPanel();
			await editor.openSection( 'preferences' );

			await expect.soft( page.locator( controlIds.preferencePanel.checklistSwitcher ) ).toHaveScreenshot( 'checklist-switch-on.png' );
		} );
	} );
} );
