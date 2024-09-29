import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { controlIds, selectors } from './selectors';
import { ChecklistHelper } from './helper';
import { StepId } from '../../../types/checklist';
import { newUser } from './new-user';

test.describe( 'Launchpad checklist tests', () => {
	let newTestUser;

	test.beforeAll( async ( { browser, apiRequests, request }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			editor_v2: true,
			'launchpad-checklist': true,
		} );
		await checklistHelper.resetStepsInDb( request, { editor_visit_count: 0 } );

		newTestUser = await apiRequests.createNewUser( request, newUser );

		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests, request }, testInfo ) => {
		const page = await browser.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await apiRequests.deleteUser( request, newTestUser.id );
		await apiRequests.cleanUpTestPages( request, false );

		await wpAdmin.resetExperiments();

		await page.close();
	} );

	test( 'Checklist automatically opens on the 2nd visit to the editor', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openNewPage();

		const checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

		expect( await checklistHelper.isChecklistOpen( 'editor' ) ).toBeFalsy();

		await page.reload();
		await page.locator( selectors.popup ).waitFor();

		expect( await checklistHelper.isChecklistOpen( 'editor' ) ).toBeTruthy();
	} );

	test( 'Checklist module general test', async ( { page, apiRequests }, testInfo ) => {
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

	test( 'Checklist first time closed infotip', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			rocketButton = editor.page.locator( selectors.topBarIcon ),
			closeButton = editor.page.locator( selectors.closeButton ),
			checklist = editor.page.locator( selectors.popup ),
			infotip = editor.page.locator( selectors.infotipFirstTimeClosed ),
			infotipCloseButton = editor.page.locator( selectors.infotipFirstTimeClosedButton ),
			url = '/wp-json/elementor/v1/checklist/user-progress';

		const returnDataMock = ( firstClosedChecklistInEditor ) => {
			return {
				data: {
					last_opened_timestamp: null,
					first_closed_checklist_in_editor: firstClosedChecklistInEditor,
					steps: {
						create_pages: {
							is_marked_completed: false,
							is_completed: false,
						},
						setup_header: {
							is_marked_completed: false,
							is_completed: false,
						},
					},
				},
			};
		};

		await test.step( 'Infotip first time triggered', async () => {
			await page.route( url, async ( route ) => {
				const json = returnDataMock( false );
				await route.fulfill( {
					json,
				} );
			} );

			await rocketButton.click();
			await expect( checklist ).toBeVisible();
			await closeButton.click();
			await expect( infotip ).toBeVisible();
		} );

		await test.step( 'Infotip not triggered after db update', async () => {
			await infotipCloseButton.click();
			await page.route( url, async ( route ) => {
				const json = returnDataMock( true );
				await route.fulfill( {
					json,
				} );
			} );
			await rocketButton.click();
			await expect( checklist ).toBeVisible();
			await closeButton.click();
			await expect( infotip ).toBeHidden();
		} );
	} );

	test( 'Checklist preference switch effects', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		let checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			'launchpad-checklist': false,
		} );

		const editor = await wpAdmin.openNewPage();
		checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

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
			await checklistHelper.toggleChecklist( 'editor', true );
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

	test( 'Progress Bar', async ( { page, apiRequests, request }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			checklistHelper = new ChecklistHelper( page, testInfo, apiRequests ),
			steps = await checklistHelper.getSteps( request ),
			progressToCompare = Math.round( steps.filter( checklistHelper.isStepCompleted ).length * 100 / steps.length ),
			rocketButton = editor.page.locator( selectors.topBarIcon ),
			pageProgress = await checklistHelper.getProgressFromPopup( 'editor' );

		await rocketButton.click();

		expect( pageProgress ).toBe( progressToCompare );
	} );

	// CAUTION: This test will delete all you pages by running `cleanUpTestPages` function
	test( 'Mark as done function in the editor - top bar on', async ( { page, apiRequests, request }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openNewPage();

		const checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

		await apiRequests.cleanUpTestPages( request, true );
		await checklistHelper.resetStepsInDb( request );

		const steps = await checklistHelper.getSteps( request ),
			doneStepIds: StepId[] = [];

		for ( const step of steps ) {
			if ( checklistHelper.isStepProLocked( step.config.id ) ) {
				continue;
			}

			const markAsButton = page.locator( checklistHelper.getStepContentSelector( step.config.id, selectors.markAsButton ) ),
				checkIconSelector = checklistHelper.getStepItemSelector( step.config.id, selectors.stepIcon );

			await checklistHelper.toggleChecklistItem( step.config.id, 'editor', true );
			await expect( markAsButton ).toHaveText( 'Mark as done' );
			await expect( page.locator( checkIconSelector + ' [data-is-checked="false"]' ) ).toBeVisible();

			await checklistHelper.toggleMarkAsDone( step.config.id, 'editor' );
			doneStepIds.push( step.config.id );
			await expect( markAsButton ).toHaveText( 'Unmark as done' );
			await expect( page.locator( checkIconSelector + ' [data-is-checked="true"]' ) ).toBeVisible();

			expect( await checklistHelper.getProgressFromPopup( 'editor' ) )
				.toBe( Math.round( doneStepIds.length * 100 / steps.length ) );
		}

		await wpAdmin.openNewPage();

		for ( const stepId of doneStepIds ) {
			if ( checklistHelper.isStepProLocked( stepId ) ) {
				continue;
			}

			const markAsButton = page.locator( checklistHelper.getStepContentSelector( stepId, selectors.markAsButton ) ),
				checkIconSelector = checklistHelper.getStepItemSelector( stepId, selectors.stepIcon );

			await checklistHelper.toggleChecklistItem( stepId, 'editor', true );
			await expect( markAsButton ).toHaveText( 'Unmark as done' );
			await expect( page.locator( checkIconSelector + ' [data-is-checked="true"]' ) ).toBeVisible();
		}

		// Resetting for the sake of the next test
		for ( const stepId of doneStepIds ) {
			await checklistHelper.toggleChecklistItem( stepId, 'editor', true );
			await checklistHelper.toggleMarkAsDone( stepId, 'editor' );
		}
	} );

	test( 'Checklist all done step', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
			editor = await wpAdmin.openNewPage(),
			rocketButton = editor.page.locator( selectors.topBarIcon ),
			closeButton = editor.page.locator( selectors.closeButton ),
			checklist = editor.page.locator( selectors.popup ),
			allDone = editor.page.locator( selectors.allDone ),
			gotItButton = editor.page.locator( selectors.gotItButton ),
			url = '/wp-json/elementor/v1/checklist/steps';

		const checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

		await test.step( 'All done, not visible, some steps are incomplete', async () => {
			await page.route( url, async ( route ) => {
				const json = checklistHelper.returnDataMockAllDoneMessage( false );
				await route.fulfill( {
					json,
				} );
			} );

			await rocketButton.click();
			await expect( checklist ).toBeVisible();
			await expect( allDone ).toBeHidden();
			await closeButton.click();
		} );

		await test.step( 'All done is visible, all steps are complete', async () => {
			await page.route( url, async ( route ) => {
				const json = checklistHelper.returnDataMockAllDoneMessage( true );
				await route.fulfill( {
					json,
				} );
			} );
			await rocketButton.click();
			await expect( checklist ).toBeVisible();
			await expect( allDone ).toBeVisible();
			await gotItButton.click();
			await expect( rocketButton ).toBeHidden();
			await checklistHelper.setChecklistSwitcherInPreferences( false );
		} );
	} );

	test( 'Make sure steps are reset and checklist is active after previous test in case it failed', async ( { page, apiRequests, request }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openNewPage();

		const checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

		await checklistHelper.resetStepsInDb( request );
		await checklistHelper.setChecklistSwitcherInPreferences( true );
		await checklistHelper.toggleExpandChecklist( 'editor', true );
	} );

	test( 'Expand and minimize behavior in the editor', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openNewPage();

		const checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

		await test.step( 'Assert checklist expanded', async () => {
			await checklistHelper.toggleChecklist( 'editor', true );
			expect( await checklistHelper.isChecklistExpanded( 'editor' ) ).toBeTruthy();
		} );

		await test.step( 'Assert checklist stays minimized after closing', async () => {
			await checklistHelper.toggleExpandChecklist( 'editor', false );
			await checklistHelper.toggleChecklist( 'editor', false );
			await checklistHelper.toggleChecklist( 'editor', true );
			expect( await checklistHelper.isChecklistExpanded( 'editor' ) ).toBeFalsy();
		} );

		await test.step( 'Assert checklist is minimized after refresh', async () => {
			await page.reload();
			await checklistHelper.toggleChecklist( 'editor', true );
			expect( await checklistHelper.isChecklistExpanded( 'editor' ) ).toBeFalsy();
		} );
	} );

	test( 'Make sure checklist is expanded after previous test if it failed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openNewPage();

		const checklistHelper = new ChecklistHelper( page, testInfo, apiRequests );

		await checklistHelper.toggleExpandChecklist( 'editor', true );
	} );
	test( 'Checklist visible only to admin', async ( { browser, page, apiRequests }, testInfo ) => {
		await test.step( 'Checklist visible to admin role by default', async () => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
				editor = await wpAdmin.openNewPage( false, false ),
				rocketButton = editor.page.locator( selectors.topBarIcon ),
				checklist = editor.page.locator( selectors.popup );
			await rocketButton.click();
			await expect( checklist ).toBeVisible();
		} );

		await test.step( 'Checklist not visible to author role', async () => {
			const context = await browser.newContext( { storageState: undefined } );
			const newScopePage = await context.newPage();
			const wpAdmin = new WpAdminPage( newScopePage, testInfo, apiRequests );

			await wpAdmin.customLogin( newTestUser.username, newTestUser.password );

			const editor = await wpAdmin.openNewPage( false, false );
			const rocketButton = editor.page.locator( selectors.topBarIcon );

			await expect( rocketButton ).toBeHidden();
		} );
	} );
} );
