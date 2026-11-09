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

	const expectStableScreenshot = async ( target: Locator, name: string ) => {
		await editor.page.mouse.move( 0, 0 );
		await editor.page.evaluate( () => ( document.body.ownerDocument.activeElement as HTMLElement )?.blur?.() );

		await expect( target ).toHaveScreenshot( name, {
			animations: 'disabled',
			caret: 'hide',
			timeout: 20000,
		} );
	};

	const addMenu = async (): Promise<string> => {
		const flexboxId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );
		const menuId = await editor.addElement( { elType: menuType }, flexboxId );

		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();

		return menuId;
	};

	const navigatorSelectors = EditorSelectors.panels.navigator;

	const openStructurePanel = async (): Promise<Locator> => {
		await editor.page.locator( navigatorSelectors.footerButton ).click();

		const panel = editor.page.locator( navigatorSelectors.wrapper );

		await expect( panel ).toBeVisible();

		return panel;
	};

	const expandAllStructureNodes = async () => {
		await expect.poll( async () => {
			return await editor.page.evaluate( () => {
				const collapsed = Array.from(
					document.querySelectorAll( '#elementor-navigator .elementor-navigator__element--has-children' ),
				).filter( ( element ) => {
					const list = element.querySelector( ':scope > .elementor-navigator__elements' );

					return list && 'none' === getComputedStyle( list ).display;
				} );

				collapsed.forEach( ( element ) => {
					( element.querySelector( ':scope > .elementor-navigator__item .elementor-navigator__element__list-toggle' ) as HTMLElement )?.click();
				} );

				return collapsed.length;
			} );
		}, { timeout: 15000 } ).toBe( 0 );
	};

	const getStructureTitles = ( panel: Locator ): Locator => {
		return panel.locator( '.elementor-navigator__element__title__text' );
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
		await expectStableScreenshot( menu, 'menu-default-canvas.png' );
	} );

	test( 'Menu items repeater lists the default entries', async () => {
		// Arrange
		await addMenu();

		// Act
		const field = await openMenuItemsControl();

		// Assert
		await expect( field.locator( 'ul.MuiList-root > li' ) ).toHaveCount( 4 );
		await expectStableScreenshot( field.locator( 'ul.MuiList-root' ), 'menu-items-repeater-default.png' );
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
		await expectStableScreenshot( menu, 'menu-after-add-canvas.png' );
		await expectStableScreenshot( field.locator( 'ul.MuiList-root' ), 'menu-items-repeater-after-add.png' );
	} );

	test( 'Remove item via the repeater removes the entry from the canvas', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const field = await openMenuItemsControl();

		// Act
		const secondItem = field.locator( 'ul.MuiList-root > li' ).nth( 1 );

		await secondItem.hover();
		await secondItem.getByRole( 'button', { name: 'Remove' } ).click();

		// Assert
		await expect( getEntries( menu ) ).toHaveText( [ 'Home', 'About', 'Contact' ] );
		await expectStableScreenshot( menu, 'menu-after-remove-canvas.png' );
	} );

	test( 'Duplicate item via the repeater adds a copy after the original', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const field = await openMenuItemsControl();

		// Act
		const firstItem = field.locator( 'ul.MuiList-root > li' ).first();

		await firstItem.hover();
		await firstItem.getByRole( 'button', { name: 'Duplicate' } ).click();

		// Assert
		await expect( getEntries( menu ) ).toHaveText( [ 'Home', 'Home', 'Products', 'About', 'Contact' ] );
		await expectStableScreenshot( menu, 'menu-after-duplicate-canvas.png' );
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

	test( 'Structure panel nests the menu in a flexbox and lists every entry once expanded', async () => {
		// Arrange
		await addMenu();
		const panel = await openStructurePanel();
		const titles = getStructureTitles( panel );

		// Assert
		await expect( titles.filter( { hasText: /^Flexbox$/ } ) ).toHaveCount( 1 );
		await expect( titles.filter( { hasText: /^Menu$/ } ) ).toHaveCount( 1 );
		await expect( titles.filter( { hasText: /^Menu items$/ } ) ).toBeVisible();

		await expectStableScreenshot( panel, 'menu-structure-panel-collapsed.png' );

		// Act
		await expandAllStructureNodes();

		// Assert
		await expect( titles.filter( { hasText: /^Menu item$/ } ) ).toHaveCount( 4 );
		await expect( titles.filter( { hasText: /^Paragraph$/ } ) ).toHaveCount( 4 );

		for ( const name of [ 'Home', 'Products', 'About', 'Contact' ] ) {
			await expect( titles.filter( { hasText: new RegExp( `^${ name }$` ) } ) ).toHaveCount( 1 );
		}

		await expectStableScreenshot( panel, 'menu-structure-panel-expanded.png' );
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
		await expectStableScreenshot( nav, 'menu-frontend-default.png' );
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
		await expectStableScreenshot( nav, 'menu-frontend-with-link.png' );
	} );

	test( 'Frontend reflects added, removed and renamed entries after publish', async () => {
		// Arrange
		await addMenu();
		const field = await openMenuItemsControl();

		await field.getByRole( 'button', { name: 'Add item' } ).click();
		const secondItem = field.locator( 'ul.MuiList-root > li' ).nth( 1 );

		await secondItem.hover();
		await secondItem.getByRole( 'button', { name: 'Remove' } ).click();

		// Act
		await editor.publishAndViewPage();

		// Assert
		const nav = editor.page.locator( 'nav.e-menu' );

		await expect( nav.locator( 'ul > li' ) ).toHaveText( [ 'Home', 'About', 'Contact', 'Menu item 1' ] );
		await expectStableScreenshot( nav, 'menu-frontend-after-edits.png' );
	} );
} );
