import { expect, type BrowserContext, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Atomic Menu Submenu Pro lock @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	const menuType = 'e-menu';
	const entryType = 'e-menu-entry';
	const menuItemsLabel = 'Menu items';
	const promotionTitle = 'Mega Menu';
	const promotionContent = 'Create rich navigation menus with custom layouts, images, and interactive content.';
	const upgradeUrl = 'https://go.elementor.com/go-pro-atomic-mega-menu/';

	const getMenuRoot = ( menuId: string ): Locator => {
		return editor.getPreviewFrame().locator( editor.getWidgetSelector( menuId ) );
	};

	const getEntries = ( root: Locator ): Locator => {
		return root.locator( `[data-element_type="${ entryType }"]` );
	};

	const addMenu = async (): Promise<string> => {
		const menuId = await editor.v4Panel.addAtomicElementFromPanel( menuType );

		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();

		return menuId;
	};

	const openMenuItemsControl = async (): Promise<Locator> => {
		await editor.v4Panel.openTab( 'general' );

		const field = editor.page.locator( '[data-type="settings-field"]' ).filter( { hasText: menuItemsLabel } );

		await expect( field ).toBeVisible();

		return field;
	};

	const getEnableSubmenuSwitch = ( scope: Locator ): Locator => {
		return scope.locator( 'input[aria-label="Enable Submenu"]' );
	};

	const getPromotionPopover = (): Locator => {
		return editor.page.locator( '.MuiAlert-root' ).filter( { hasText: promotionTitle } );
	};

	const expectPromotionCard = async () => {
		const card = getPromotionPopover();

		await expect( card.getByText( promotionTitle ) ).toBeVisible();
		await expect( card.getByText( promotionContent ) ).toBeVisible();
		await expect( card.getByRole( 'link', { name: 'Upgrade Now' } ) ).toHaveAttribute( 'href', upgradeUrl );
	};

	const getSubmenuChildCount = async ( menuId: string ): Promise<number> => {
		return await editor.page.evaluate( ( id ) => {
			const win = window as unknown as { elementor: { getContainer: ( containerId: string ) => { view: { $el: { find: ( selector: string ) => { length: number } } } } } };

			return win.elementor.getContainer( id ).view.$el.find( '[data-element_type="e-menu-submenu"]' ).length;
		}, menuId );
	};

	const openEntryPopover = async ( field: Locator, index: number ): Promise<Locator> => {
		await field.locator( 'ul.MuiList-root > li' ).nth( index ).getByLabel( 'Open item' ).click();

		const popover = editor.page.locator( '.MuiPopover-paper' ).last();

		await expect( popover.getByText( 'Item name' ) ).toBeVisible();

		return popover;
	};

	const selectMenuItemOfEntry = async ( menu: Locator, entryIndex: number ): Promise<void> => {
		const itemId = await getEntries( menu ).nth( entryIndex )
			.locator( '[data-element_type="e-menu-item"]' ).first().getAttribute( 'data-id' ) as string;

		await editor.selectElement( itemId );
		await editor.waitForPanelToLoad();
		await editor.v4Panel.openTab( 'general' );
	};

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements,e_nav_menu' );

		context = await browser.newContext();
		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Row popover of the Menu items repeater shows Enable Submenu locked with the Pro crown', async () => {
		// Arrange
		const menuId = await addMenu();
		const field = await openMenuItemsControl();

		// Act
		const popover = await openEntryPopover( field, 0 );

		// Assert
		const submenuSwitch = getEnableSubmenuSwitch( popover );

		await expect( submenuSwitch ).toBeVisible();
		await expect( submenuSwitch ).not.toBeChecked();
		await expect( popover.getByLabel( 'Promotion chip' ) ).toBeVisible();
		expect( await getSubmenuChildCount( menuId ) ).toBe( 0 );
	} );

	test( 'Clicking the locked switch in the row popover opens the Pro promotion without flipping it', async () => {
		// Arrange
		const menuId = await addMenu();
		const field = await openMenuItemsControl();
		const popover = await openEntryPopover( field, 0 );

		// Act
		await getEnableSubmenuSwitch( popover ).click( { force: true } );

		// Assert
		await expectPromotionCard();
		await expect( getEnableSubmenuSwitch( popover ) ).not.toBeChecked();
		expect( await getSubmenuChildCount( menuId ) ).toBe( 0 );
	} );

	test( 'Menu Item settings show Enable Submenu locked with the Pro crown', async () => {
		// Arrange
		const menuId = await addMenu();

		// Act
		await selectMenuItemOfEntry( getMenuRoot( menuId ), 0 );

		// Assert
		const submenuSwitch = getEnableSubmenuSwitch( editor.page );

		await expect( submenuSwitch ).toBeVisible();
		await expect( submenuSwitch ).not.toBeChecked();
		await expect( editor.page.getByLabel( 'Promotion chip' ).first() ).toBeVisible();
		await expect( editor.page.getByRole( 'button', { name: 'Edit Submenu' } ) ).toHaveCount( 0 );
	} );

	test( 'Clicking the locked switch in the Menu Item settings opens the Pro promotion without flipping it', async () => {
		// Arrange
		const menuId = await addMenu();

		await selectMenuItemOfEntry( getMenuRoot( menuId ), 2 );

		// Act
		await getEnableSubmenuSwitch( editor.page ).click( { force: true } );

		// Assert
		await expectPromotionCard();
		await expect( getEnableSubmenuSwitch( editor.page ) ).not.toBeChecked();
		expect( await getSubmenuChildCount( menuId ) ).toBe( 0 );
	} );

	test( 'The promotion closes and the switch stays off', async () => {
		// Arrange
		await addMenu();
		const field = await openMenuItemsControl();
		const popover = await openEntryPopover( field, 0 );

		await popover.getByLabel( 'Promotion chip' ).click();
		await expectPromotionCard();

		// Act
		await getPromotionPopover().getByRole( 'button', { name: 'Close' } ).click();

		// Assert
		await expect( getPromotionPopover() ).toHaveCount( 0 );
		await expect( getEnableSubmenuSwitch( popover ) ).not.toBeChecked();
	} );
} );
