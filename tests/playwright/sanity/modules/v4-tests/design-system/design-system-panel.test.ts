import { type BrowserContext, expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import DesignSystemPage from './design-system-page';
import { cleanupDesignSystemData, DESIGN_SYSTEM_SIDEBAR_EXPERIMENTS, initDesignSystemTest } from './utils';

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

		await test.step( 'All three tabs are rendered', async () => {
			await expect( designSystem.defaultsTab ).toBeVisible();
			await expect( designSystem.variablesTab ).toBeVisible();
			await expect( designSystem.classesTab ).toBeVisible();
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

	test( 'Defaults tab is active by default when panel opens from toolbar', async () => {
		await test.step( 'Open panel from top bar with no prior preference', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );

			await designSystem.openFromToolbar();
		} );

		await test.step( 'Defaults tab is selected', async () => {
			await expect( designSystem.defaultsTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Defaults tab content (tag selector) is displayed', async () => {
			await expect( designSystem.defaultsTagSelector ).toBeVisible();
		} );

		await test.step( 'Variables tab is not selected', async () => {
			await expect( designSystem.variablesTab ).toHaveAttribute( 'aria-selected', 'false' );
		} );
	} );

	test( 'Clicking Classes tab shows Class Manager content', async () => {
		await test.step( 'Open panel (starts on Defaults tab)', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await expect( designSystem.defaultsTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Switch to Classes tab', async () => {
			await designSystem.switchToClassesTab();
		} );

		await test.step( 'Classes tab is now selected', async () => {
			await expect( designSystem.classesTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Class Manager content (Save changes button) is visible', async () => {
			await expect( designSystem.classesSaveButton ).toBeVisible();
		} );

		await test.step( 'Variables Manager content is no longer displayed', async () => {
			await expect( designSystem.defaultsTagSelector ).toBeHidden();
		} );
	} );

	test( 'Clicking Variables tab switches back from Classes to Variables', async () => {
		await test.step( 'Open panel and switch to Classes', async () => {
			await page.evaluate( () => {
				window.localStorage.setItem( 'elementor_editor_design_system_active_tab', 'classes' );
			} );
			await designSystem.openFromToolbar();
			await expect( designSystem.classesTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Switch to Variables tab', async () => {
			await designSystem.switchToVariablesTab();
		} );

		await test.step( 'Variables tab is selected and content is visible', async () => {
			await expect( designSystem.variablesTab ).toHaveAttribute( 'aria-selected', 'true' );
			await expect( designSystem.variablesEmptyState ).toBeVisible();
		} );
	} );

	test( 'Active tab is persisted across close and reopen from toolbar', async () => {
		await test.step( 'Open panel and switch to Classes tab', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );

			await designSystem.openFromToolbar();
			await designSystem.switchToClassesTab();
			await expect( designSystem.classesTab ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		await test.step( 'Close the panel', async () => {
			await designSystem.closePanel();
			await expect( designSystem.panelHeading ).toBeHidden();
		} );

		await test.step( 'Reopen from toolbar — Classes tab should still be active', async () => {
			await designSystem.openFromToolbar();
			await expect( designSystem.classesTab ).toHaveAttribute( 'aria-selected', 'true' );
			await expect( designSystem.classesSaveButton ).toBeVisible();
		} );
	} );

	test( 'Class Manager button in style panel opens Design System on Classes tab', async () => {
		let divBlockId: string;

		await test.step( 'Add a div block element to the canvas', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
		} );

		await test.step( 'Click Class Manager button in v4 style panel', async () => {
			await designSystem.openFromClassManagerButton( editor, divBlockId );
		} );

		await test.step( 'Design System panel is open', async () => {
			await expect( designSystem.panelHeading ).toBeVisible();
			await expect( designSystem.panelHeading ).toHaveText( 'Design system' );
		} );

		await test.step( 'Classes tab is active', async () => {
			await expect( designSystem.classesTab ).toHaveAttribute( 'aria-selected', 'true' );
			await expect( designSystem.classesSaveButton ).toBeVisible();
		} );
	} );

	test( 'Toolbar button toggles panel closed when same tab is already active', async () => {
		await test.step( 'Open panel on Defaults tab', async () => {
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

	test( 'Variables tab shows create menu when Add variable button is clicked', async () => {
		await test.step( 'Open panel and switch to Variables tab', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await designSystem.switchToVariablesTab();
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

	test( 'Design System panel screenshot — Variables tab', async () => {
		await test.step( 'Open panel and switch to Variables tab', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await designSystem.switchToVariablesTab();
		} );

		await expect( page.locator( '#elementor-panel' ) ).toHaveScreenshot(
			'design-system-variables-tab.png',
		);
	} );

	test( 'Design System panel screenshot — Classes tab', async () => {
		await test.step( 'Open panel and switch to Classes tab', async () => {
			await page.evaluate( () => {
				window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
			} );
			await designSystem.openFromToolbar();
			await designSystem.switchToClassesTab();
		} );

		await expect( page.locator( '#elementor-panel' ) ).toHaveScreenshot(
			'design-system-classes-tab.png',
		);
	} );
} );

test.describe( 'Design System Panel - editor sidebar with atomic elements panel @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let page: Page;
	let context: BrowserContext;
	let designSystem: DesignSystemPage;

	const isV1RouteActive = ( route: string ) => page.evaluate(
		( r ) => ( window as unknown as { $e: { routes: { isPartOf: ( name: string ) => boolean } } } ).$e.routes.isPartOf( r ),
		route,
	);

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = await initDesignSystemTest( page, testInfo, apiRequests, DESIGN_SYSTEM_SIDEBAR_EXPERIMENTS );
		designSystem = new DesignSystemPage( page );
	} );

	test.beforeEach( async ( { apiRequests } ) => {
		await page.evaluate( () => {
			window.localStorage.removeItem( 'elementor:new-experience:elements-panel' );
			window.localStorage.removeItem( 'elementor_editor_design_system_active_tab' );
		} );
		editor = await wpAdmin.openNewPage();
		await cleanupDesignSystemData( apiRequests, page );
		await expect( designSystem.atomicElementsPanelHeading ).toBeVisible();
	} );

	test.afterAll( async ( { apiRequests } ) => {
		await cleanupDesignSystemData( apiRequests, page );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'First click on Design System in the sidebar rail opens the panel', async () => {
		await test.step( 'Click Design System once', async () => {
			await designSystem.getSidebarRailButton( 'Design System' ).click();
		} );

		await test.step( 'Design System panel replaces the atomic elements panel', async () => {
			await expect( designSystem.panelHeading ).toBeVisible();
			await expect( designSystem.atomicElementsPanelHeading ).toBeHidden();
		} );
	} );

	test( 'Design System panel stays interactive and closing it brings back the atomic elements panel', async () => {
		await test.step( 'Open Design System from the rail', async () => {
			await designSystem.getSidebarRailButton( 'Design System' ).click();
			await expect( designSystem.panelHeading ).toBeVisible();
		} );

		await test.step( 'Switch tabs', async () => {
			await designSystem.switchToClassesTab();
			await designSystem.switchToVariablesTab();
		} );

		await test.step( 'Close the panel', async () => {
			await designSystem.closePanel();
		} );

		await test.step( 'Atomic elements panel is back', async () => {
			await expect( designSystem.atomicElementsPanelHeading ).toBeVisible();
			await expect( designSystem.getSidebarRailButton( 'Add Element' ) ).toBeEnabled();
		} );
	} );

	test( 'Other sidebar rail entries still open their panels', async () => {
		const backToAddPanel = async () => {
			await designSystem.getSidebarRailButton( 'Add Element' ).click();
			await expect( designSystem.atomicElementsPanelHeading ).toBeVisible();
		};

		await test.step( 'Components', async () => {
			await designSystem.getSidebarRailButton( 'Components' ).click();
			await expect( designSystem.panel.getByRole( 'heading', { level: 2, name: 'Components', exact: true } ) ).toBeVisible();
			await backToAddPanel();
		} );

		await test.step( 'Page Settings', async () => {
			await designSystem.getSidebarRailButton( 'Page Settings' ).click();
			await expect.poll( () => isV1RouteActive( 'panel/page-settings' ) ).toBe( true );
			await backToAddPanel();
		} );

		await test.step( 'History', async () => {
			await designSystem.getSidebarRailButton( 'History' ).click();
			await expect.poll( () => isV1RouteActive( 'panel/history' ) ).toBe( true );
			await backToAddPanel();
		} );

		await test.step( 'Design System from Page Settings', async () => {
			await designSystem.getSidebarRailButton( 'Page Settings' ).click();
			await expect.poll( () => isV1RouteActive( 'panel/page-settings' ) ).toBe( true );
			await designSystem.getSidebarRailButton( 'Design System' ).click();
			await expect( designSystem.panelHeading ).toBeVisible();
		} );
	} );

	test( 'Closing Design System restores the selected element', async () => {
		let divBlockId: string;

		await test.step( 'Add and select a div block', async () => {
			divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
			await editor.selectElement( divBlockId );
		} );

		await test.step( 'Open Design System from the rail', async () => {
			await designSystem.getSidebarRailButton( 'Design System' ).click();
			await designSystem.dismissUnsavedChangesDialogIfVisible();
			await expect( designSystem.panelHeading ).toBeVisible();
		} );

		await test.step( 'Close the panel and check the selection', async () => {
			await designSystem.closePanel();
			await expect(
				editor.getPreviewFrame().locator( `.elementor-element-${ divBlockId }.elementor-element-editable` ),
			).toBeVisible();
		} );
	} );
} );
