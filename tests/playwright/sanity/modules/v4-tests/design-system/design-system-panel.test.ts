import { type BrowserContext, expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import DesignSystemPage from './design-system-page';
import { cleanupDesignSystemData, initDesignSystemTest } from './utils';

test.describe( 'Design System Panel @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let page: Page;
	let context: BrowserContext;
	let designSystem: DesignSystemPage;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = await initDesignSystemTest( page, testInfo, apiRequests );
		designSystem = new DesignSystemPage( page );
	} );

	test.beforeEach( async ( { apiRequests } ) => {
		editor = await wpAdmin.openNewPage();
		await cleanupDesignSystemData( apiRequests, page );
	} );

	test.afterAll( async ( { apiRequests } ) => {
		await cleanupDesignSystemData( apiRequests, page );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Design System button in toolbar opens the panel', async () => {
		await test.step( 'Click the Design System toolbar button', async () => {
			await designSystem.openFromToolbar();
		} );

		await test.step( 'Panel is visible with the correct heading', async () => {
			await expect( designSystem.panelHeading ).toBeVisible();
			await expect( designSystem.panelHeading ).toHaveText( 'Design system' );
		} );

		await test.step( 'Home navigation cards are rendered', async () => {
			await expect( designSystem.homeList ).toBeVisible();
			await expect( designSystem.variablesHomeItem ).toBeVisible();
			await expect( designSystem.classesHomeItem ).toBeVisible();
			await expect( designSystem.defaultStylesHomeItem ).toBeVisible();
		} );
	} );

	test( 'Close button dismisses the Design System panel', async () => {
		await test.step( 'Open the panel', async () => {
			await designSystem.openFromToolbar();
			await expect( designSystem.panelHeading ).toBeVisible();
		} );

		await test.step( 'Click Close and verify the panel disappears', async () => {
			await designSystem.closePanel();
			await expect( designSystem.panelHeading ).toBeHidden();
		} );
	} );

	test( 'Toolbar opens home hub instead of a specific section', async () => {
		await test.step( 'Open panel from top bar', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );

			await designSystem.openFromToolbar();
		} );

		await test.step( 'Home list is shown and section content is hidden', async () => {
			await expect( designSystem.homeList ).toBeVisible();
			await expect( designSystem.defaultsTagSelector ).toBeHidden();
		} );
	} );

	test( 'Choosing Classes from home shows Class Manager content', async () => {
		await test.step( 'Open panel on home', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await expect( designSystem.homeList ).toBeVisible();
		} );

		await test.step( 'Open Classes from home', async () => {
			await designSystem.switchToClassesFromHome();
		} );

		await test.step( 'Class Manager content (Save changes button) is visible', async () => {
			await expect( designSystem.classesSaveButton ).toBeVisible();
		} );

		await test.step( 'Default styles content is not displayed', async () => {
			await expect( designSystem.defaultsTagSelector ).toBeHidden();
		} );
	} );

	test( 'Choosing Variables from home shows Variables manager', async () => {
		await test.step( 'Open panel and drill into Variables', async () => {
			await designSystem.openFromToolbar();
			await designSystem.switchToVariablesFromHome();
		} );

		await test.step( 'Variables empty state is visible', async () => {
			await expect( designSystem.variablesEmptyState ).toBeVisible();
		} );
	} );

	test( 'Reopen from toolbar lands on home even after visiting Classes', async () => {
		await test.step( 'Open panel, open Classes, then close', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );

			await designSystem.openFromToolbar();
			await designSystem.switchToClassesFromHome();
			await designSystem.closePanel();
			await expect( designSystem.panelHeading ).toBeHidden();
		} );

		await test.step( 'Reopen from toolbar shows home, not Classes', async () => {
			await designSystem.openFromToolbar();
			await expect( designSystem.homeList ).toBeVisible();
			await expect( designSystem.classesSaveButton ).toBeHidden();
		} );
	} );

	test( 'Class Manager button in style panel opens Design System on Classes', async () => {
		let divBlockId: string;

		await test.step( 'Add a div block element to the canvas', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
		} );

		await test.step( 'Click Class Manager button in v4 style panel', async () => {
			await designSystem.openFromClassManagerButton( editor, divBlockId );
		} );

		await test.step( 'Class Manager content is visible', async () => {
			await expect( designSystem.classesSaveButton ).toBeVisible();
		} );
	} );

	test( 'Toolbar button toggles panel closed when home is already showing', async () => {
		await test.step( 'Open panel on home', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await expect( designSystem.panelHeading ).toBeVisible();
		} );

		await test.step( 'Clicking toolbar button again closes the panel', async () => {
			await designSystem.toolbarButton.click();
			await expect( designSystem.panelHeading ).toBeHidden();
		} );
	} );

	test( 'Variables section shows create menu when Add variable button is clicked', async () => {
		await test.step( 'Open panel and open Variables from home', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await designSystem.switchToVariablesFromHome();
		} );

		await test.step( 'Click "Add variable" button', async () => {
			await designSystem.addVariableButton.click();
		} );

		await test.step( 'Create menu is visible', async () => {
			await expect(
				page.getByTestId( 'variable-manager-create-menu' ),
			).toBeVisible();
		} );
	} );

	test( 'Design System panel screenshot — Variables section', async () => {
		await test.step( 'Open panel and open Variables from home', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await designSystem.switchToVariablesFromHome();
		} );

		await expect( page.locator( '#elementor-panel' ) ).toHaveScreenshot(
			'design-system-variables-tab.png',
		);
	} );

	test( 'Design System panel screenshot — Classes section', async () => {
		await test.step( 'Open panel and open Classes from home', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await designSystem.switchToClassesFromHome();
		} );

		await expect( page.locator( '#elementor-panel' ) ).toHaveScreenshot(
			'design-system-classes-tab.png',
		);
	} );
} );
