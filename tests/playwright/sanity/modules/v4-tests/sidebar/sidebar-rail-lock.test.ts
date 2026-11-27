import { type BrowserContext, expect, type Locator, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import DesignSystemPage from '../design-system/design-system-page';

const SIDEBAR_RAIL_EXPERIMENTS = {
	e_atomic_elements: 'active',
	e_editor_sidebar: 'active',
	e_editor_atomic_panel: 'active',
} as const;

const ELEMENTS_PANEL_STORAGE_KEY = 'elementor:new-experience:elements-panel';

const DESIGN_SYSTEM = 'Design System';
const COMPONENTS = 'Components';
const OTHER_RAIL_ITEMS = [ 'Add Element', 'Theme Builder', 'Page Settings', 'History', 'Finder', 'Help' ];

test.describe( 'Sidebar rail lock @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let page: Page;
	let context: BrowserContext;
	let designSystem: DesignSystemPage;

	const railButton = ( name: string ): Locator => page
		.getByRole( 'complementary', { name: 'Editor sidebar' } )
		.getByRole( 'button', { name, exact: true } );

	const atomicPanelHeading = (): Locator => designSystem.panel.getByRole( 'heading', { level: 2, name: 'Add', exact: true } );
	const componentsPanelHeading = (): Locator => designSystem.panel.getByRole( 'heading', { level: 2, name: COMPONENTS, exact: true } );
	const componentsCloseButton = (): Locator => designSystem.panel.getByRole( 'button', { name: 'Close', exact: true } );
	const atomicSwitcherButton = (): Locator => designSystem.panel.getByRole( 'button', { name: 'Atomic elements panel', exact: true } );
	const legacySwitcherButton = (): Locator => designSystem.panel.getByRole( 'button', { name: 'Legacy elements panel', exact: true } );

	const expectRailEnabled = async ( names: string[] ) => {
		for ( const name of names ) {
			await expect( railButton( name ), `${ name } should be enabled` ).toBeEnabled();
		}
	};

	const expectRailDisabled = async ( names: string[] ) => {
		for ( const name of names ) {
			await expect( railButton( name ), `${ name } should be disabled` ).toBeDisabled();
		}
	};

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( SIDEBAR_RAIL_EXPERIMENTS );
		designSystem = new DesignSystemPage( page );
	} );

	test.beforeEach( async () => {
		await page.evaluate( ( key ) => {
			window.localStorage.removeItem( key );
		}, ELEMENTS_PANEL_STORAGE_KEY );
		await wpAdmin.openNewPage();
		await expect( atomicPanelHeading() ).toBeVisible();
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Legacy elements mode disables Design System and Components in the sidebar rail', async () => {
		await test.step( 'Atomic mode keeps both enabled', async () => {
			await expectRailEnabled( [ DESIGN_SYSTEM, COMPONENTS ] );
		} );

		await test.step( 'Switch to Legacy', async () => {
			await legacySwitcherButton().click();
			await expect( atomicSwitcherButton() ).toBeVisible();
			await expect( atomicPanelHeading() ).toBeHidden();
		} );

		await test.step( 'Design System and Components are disabled, Add Element is enabled', async () => {
			await expectRailDisabled( [ DESIGN_SYSTEM, COMPONENTS ] );
			await expect( railButton( 'Add Element' ) ).toBeEnabled();
		} );

		await test.step( 'The state survives a reload', async () => {
			await page.reload();
			await expect( railButton( 'Add Element' ) ).toBeEnabled();
			await expectRailDisabled( [ DESIGN_SYSTEM, COMPONENTS ] );
		} );

		await test.step( 'Switch back to Atomic and both become enabled without a reload', async () => {
			await atomicSwitcherButton().click();
			await expect( atomicPanelHeading() ).toBeVisible();
			await expectRailEnabled( [ DESIGN_SYSTEM, COMPONENTS ] );
		} );
	} );

	test( 'Opening Design System locks the other sidebar rail items', async () => {
		await test.step( 'Open Design System from the rail', async () => {
			await railButton( DESIGN_SYSTEM ).click();
			await expect( designSystem.panelHeading ).toBeVisible();
		} );

		await test.step( 'Every other rail item is disabled, Design System stays enabled', async () => {
			await expectRailDisabled( [ COMPONENTS, ...OTHER_RAIL_ITEMS ] );
			await expect( railButton( DESIGN_SYSTEM ) ).toBeEnabled();
		} );

		await test.step( 'Close from the panel header', async () => {
			await designSystem.closePanel();
		} );

		await test.step( 'Atomic elements panel is back and the rail is unlocked', async () => {
			await expect( atomicPanelHeading() ).toBeVisible();
			await expectRailEnabled( [ DESIGN_SYSTEM, COMPONENTS, ...OTHER_RAIL_ITEMS ] );
		} );
	} );

	test( 'Opening Components locks the other sidebar rail items', async () => {
		await test.step( 'Open Components from the rail', async () => {
			await railButton( COMPONENTS ).click();
			await expect( componentsPanelHeading() ).toBeVisible();
		} );

		await test.step( 'Every other rail item is disabled, Components stays enabled', async () => {
			await expectRailDisabled( [ DESIGN_SYSTEM, ...OTHER_RAIL_ITEMS ] );
			await expect( railButton( COMPONENTS ) ).toBeEnabled();
		} );

		await test.step( 'Close from the panel header', async () => {
			await componentsCloseButton().click();
			await expect( componentsPanelHeading() ).toBeHidden();
		} );

		await test.step( 'Atomic elements panel is back and the rail is unlocked', async () => {
			await expect( atomicPanelHeading() ).toBeVisible();
			await expectRailEnabled( [ DESIGN_SYSTEM, COMPONENTS, ...OTHER_RAIL_ITEMS ] );
		} );

		await test.step( 'Reopen Components and close it with the rail toggle', async () => {
			await railButton( COMPONENTS ).click();
			await expect( componentsPanelHeading() ).toBeVisible();
			await expectRailDisabled( [ DESIGN_SYSTEM, ...OTHER_RAIL_ITEMS ] );

			await railButton( COMPONENTS ).click();
			await expect( componentsPanelHeading() ).toBeHidden();
			await expect( atomicPanelHeading() ).toBeVisible();
			await expectRailEnabled( [ DESIGN_SYSTEM, COMPONENTS, ...OTHER_RAIL_ITEMS ] );
		} );
	} );
} );
