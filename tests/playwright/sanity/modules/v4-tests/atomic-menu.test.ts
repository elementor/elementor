import { expect, type BrowserContext, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Atomic Menu @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	const menuType = 'e-menu';
	const entryType = 'e-menu-entry';
	const menuItemsLabel = 'Menu items';

	const getMenuRoot = ( menuId: string ): Locator => {
		return editor.getPreviewFrame().locator( editor.getWidgetSelector( menuId ) );
	};

	const getEntries = ( root: Locator ): Locator => {
		return root.locator( `[data-element_type="${ entryType }"]` );
	};

	const openMenuItemsControl = async (): Promise<Locator> => {
		await editor.v4Panel.openTab( 'general' );

		const field = editor.page.locator( '[data-type="settings-field"], .MuiStack-root' )
			.filter( { hasText: menuItemsLabel } )
			.last();

		await expect( field ).toBeVisible();

		return field;
	};

	const addMenu = async (): Promise<string> => {
		const menuId = await editor.addElement( { elType: menuType }, 'document' );

		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();

		return menuId;
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

	test( 'Default menu renders four entries as a nav landmark', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );

		// Assert
		await expect( menu ).toHaveJSProperty( 'tagName', 'NAV' );
		await expect( menu ).toHaveAttribute( 'aria-label', 'Menu' );
		await expect( getEntries( menu ) ).toHaveCount( 4 );
		await expect( getEntries( menu ) ).toHaveText( [ 'Home', 'Products', 'About', 'Contact' ] );
		await expect( menu ).toHaveScreenshot( 'menu-default-canvas.png' );
	} );

	test( 'Menu items repeater lists the default entries', async () => {
		// Arrange
		await addMenu();

		// Act
		const field = await openMenuItemsControl();

		// Assert
		await expect( field.locator( 'ul.MuiList-root > li' ) ).toHaveCount( 4 );
		await expect( field ).toHaveScreenshot( 'menu-items-repeater-default.png' );
	} );

	test( 'Add item via the repeater appends an entry to the canvas', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const field = await openMenuItemsControl();

		// Act
		await field.getByRole( 'button', { name: 'Add item' } ).click();

		// Assert
		await expect( getEntries( menu ) ).toHaveCount( 5 );
		await expect( getEntries( menu ).last() ).toHaveText( 'Menu item 1' );
		await expect( field.locator( 'ul.MuiList-root > li' ) ).toHaveCount( 5 );
		await expect( menu ).toHaveScreenshot( 'menu-after-add-canvas.png' );
		await expect( field ).toHaveScreenshot( 'menu-items-repeater-after-add.png' );
	} );

	test( 'Remove item via the repeater removes the entry from the canvas', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const field = await openMenuItemsControl();

		// Act
		await field.locator( 'ul.MuiList-root > li' ).nth( 1 ).getByRole( 'button', { name: 'Remove' } ).click();

		// Assert
		await expect( getEntries( menu ) ).toHaveText( [ 'Home', 'About', 'Contact' ] );
		await expect( menu ).toHaveScreenshot( 'menu-after-remove-canvas.png' );
	} );

	test( 'Duplicate item via the repeater adds a copy after the original', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const field = await openMenuItemsControl();

		// Act
		await field.locator( 'ul.MuiList-root > li' ).first().getByRole( 'button', { name: 'Duplicate' } ).click();

		// Assert
		await expect( getEntries( menu ) ).toHaveText( [ 'Home', 'Home', 'Products', 'About', 'Contact' ] );
		await expect( menu ).toHaveScreenshot( 'menu-after-duplicate-canvas.png' );
	} );

	test( 'Renaming an entry in the repeater updates the repeater label', async () => {
		// Arrange
		await addMenu();
		const field = await openMenuItemsControl();
		const firstItem = field.locator( 'ul.MuiList-root > li' ).first();

		// Act
		await firstItem.getByRole( 'button' ).first().click();
		await editor.page.getByRole( 'textbox', { name: 'Name' } ).fill( 'Start' );

		// Assert
		await expect( firstItem ).toContainText( 'Start' );
	} );

	test( 'Navigator nests entries under Menu items under Menu', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );

		// Assert
		await expect( menu.locator( '[data-element_type="e-menu-items"]' ) ).toHaveCount( 1 );
		await expect( menu.locator( '[data-element_type="e-menu-items"] > [data-element_type="e-menu-entry"]' ) ).toHaveCount( 4 );
		await expect( menu.locator( '[data-element_type="e-menu-entry"] > [data-element_type="e-menu-item"]' ) ).toHaveCount( 4 );
	} );
} );
