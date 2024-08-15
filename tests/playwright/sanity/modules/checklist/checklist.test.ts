import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { controlIds, selectors } from './selectors';
import ChecklistHelper from './helper';

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
				const rocketButton = editor.page.locator( selectors.topBarIcon );
				await expect( rocketButton ).toBeVisible();
			} );

			await test.step( 'Open checklist trigger', async () => {
				const rocketButton = editor.page.locator( selectors.topBarIcon ),
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

	test( 'Checklist preference switch effects', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		let checklistHelper = new ChecklistHelper( page, wpAdmin );

		await wpAdmin.setExperiments( {
			'launchpad-checklist': false,
		} );

		const editor = await wpAdmin.openNewPage();
		checklistHelper = new ChecklistHelper( page, wpAdmin, editor );

		await test.step( 'Assert nothing is visible when experiment is off', async () => {
			await editor.openUserPreferencesPanel();
			await editor.openSection( 'preferences' );

			await expect( page.locator( `.elementor-control-${ controlIds.preferencePanel.checklistSwitcher }` ) ).toBeHidden();
			await expect( page.locator( selectors.topBarIcon ) ).toBeHidden();
		} );

		await wpAdmin.setExperiments( {
			'launchpad-checklist': true,
		} );
		await wpAdmin.openNewPage();

		await test.step( 'Assert switch is visible in user preferences', async () => {
			await editor.openUserPreferencesPanel();
			await editor.openSection( 'preferences' );

			await expect.soft( page.locator( `.elementor-control-${ controlIds.preferencePanel.checklistSwitcher }` ) )
				.toHaveScreenshot( 'checklist-switch-on.png' );
			await expect( page.locator( selectors.topBarIcon ) ).toBeVisible();
		} );

		await test.step( 'Assert no top bar icon when switch is off', async () => {
			await checklistHelper.toggleChecklistInTheEditor( true );
			await editor.page.waitForSelector( selectors.popup );

			await expect( page.locator( selectors.topBarIcon ) ).toBeVisible();

			await checklistHelper.setChecklistSwitcherInPreferences( false );

			await expect( page.locator( selectors.topBarIcon ) ).toBeHidden();
			await expect( editor.page.locator( selectors.popup ) ).toBeHidden();
		} );

		await page.reload();
		await page.waitForLoadState( 'load', { timeout: 20000 } );
		await wpAdmin.waitForPanel();

		await test.step( 'Assert off preference is saved and items are hidden', async () => {
			await editor.openUserPreferencesPanel();
			await editor.openSection( 'preferences' );

			await expect.soft( page.locator( `.elementor-control-${ controlIds.preferencePanel.checklistSwitcher }` ) )
				.toHaveScreenshot( 'checklist-switch-off.png' );
			await expect( page.locator( selectors.topBarIcon ) ).toBeHidden();
		} );

		await checklistHelper.setChecklistSwitcherInPreferences( true );
	} );
} );
