import { expect, type BrowserContext, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';
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

		const field = editor.page.locator( '[data-type="settings-field"]' )
			.filter( { hasText: menuItemsLabel } );

		await expect( field ).toBeVisible();

		return field;
	};

	const addMenu = async (): Promise<string> => {
		const menuId = await editor.addElement( { elType: menuType }, 'document' );

		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();

		return menuId;
	};

	const openStructurePanel = async (): Promise<Locator> => {
		await editor.page.locator( EditorSelectors.panels.navigator.footerButton ).click();

		const panel = editor.page.locator( '[role="dialog"], [role="tree"]' ).filter( { hasText: 'Structure' } ).first();

		await expect( panel ).toBeVisible();

		return panel;
	};

	const expandAllStructureNodes = async ( panel: Locator ) => {
		const collapsed = panel.locator( '[role="treeitem"][aria-expanded="false"]' );

		while ( await collapsed.count() ) {
			await collapsed.first().locator( '> div' ).first().getByRole( 'button' ).first().click();
		}
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

	test( 'Structure panel lists the menu, its items and the four entries once expanded', async () => {
		// Arrange
		await addMenu();
		const panel = await openStructurePanel();

		// Act
		await expandAllStructureNodes( panel );

		// Assert
		const rows = panel.locator( '[role="treeitem"]' );

		await expect( rows.filter( { hasText: /^Menu$/ } ) ).toHaveCount( 1 );
		await expect( rows.filter( { hasText: /^Menu items$/ } ) ).toHaveCount( 1 );
		await expect( rows.filter( { hasText: /^Menu item$/ } ) ).toHaveCount( 4 );

		for ( const name of [ 'Home', 'Products', 'About', 'Contact' ] ) {
			await expect( rows.filter( { hasText: new RegExp( `^${ name }` ) } ).first() ).toBeVisible();
		}

		await expect( panel ).toHaveScreenshot( 'menu-structure-panel-expanded.png' );
	} );

	test( 'Frontend renders the menu as a nav with a list of entries', async () => {
		// Arrange
		await addMenu();

		// Act
		await editor.publishAndViewPage();

		// Assert
		const nav = editor.page.locator( 'nav.e-menu' );

		await expect( nav ).toHaveAttribute( 'aria-label', 'Menu' );
		await expect( nav.locator( 'ul > li' ) ).toHaveText( [ 'Home', 'Products', 'About', 'Contact' ] );
		await expect( nav.locator( 'a' ) ).toHaveCount( 0 );
		await expect( nav ).toHaveScreenshot( 'menu-frontend-default.png' );
	} );

	test( 'Frontend renders a linked menu item as an anchor and the rest as spans', async () => {
		// Arrange
		const menuId = await addMenu();
		const firstItemId = await getMenuRoot( menuId )
			.locator( '[data-element_type="e-menu-item"]' )
			.first()
			.getAttribute( 'data-id' );

		await editor.applyElementSettings( firstItemId as string, {
			link: {
				$$type: 'link',
				value: { destination: { $$type: 'url', value: 'https://example.com/home' } },
			},
		} );

		await expect( getMenuRoot( menuId ).locator( 'a[href="https://example.com/home"]' ) ).toHaveCount( 1 );

		// Act
		await editor.publishAndViewPage();

		// Assert
		const nav = editor.page.locator( 'nav.e-menu' );

		await expect( nav.locator( 'a' ) ).toHaveCount( 1 );
		await expect( nav.locator( 'a' ) ).toHaveAttribute( 'href', 'https://example.com/home' );
		await expect( nav.locator( 'a' ) ).toHaveText( 'Home' );
		await expect( nav.locator( 'li > span' ) ).toHaveCount( 3 );
		await expect( nav ).toHaveScreenshot( 'menu-frontend-with-link.png' );
	} );

	test( 'Frontend reflects added, removed and renamed entries after publish', async () => {
		// Arrange
		await addMenu();
		const field = await openMenuItemsControl();

		await field.getByRole( 'button', { name: 'Add item' } ).click();
		await field.locator( 'ul.MuiList-root > li' ).nth( 1 ).getByRole( 'button', { name: 'Remove' } ).click();

		// Act
		await editor.publishAndViewPage();

		// Assert
		const nav = editor.page.locator( 'nav.e-menu' );

		await expect( nav.locator( 'ul > li' ) ).toHaveText( [ 'Home', 'About', 'Contact', 'Menu item 1' ] );
		await expect( nav ).toHaveScreenshot( 'menu-frontend-after-edits.png' );
	} );
} );
