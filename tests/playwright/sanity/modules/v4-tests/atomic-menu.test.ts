import { expect, type BrowserContext, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { wpCli } from '../../../assets/wp-cli';

type EditorWindow = { $e: { run: ( cmd: string, args?: unknown ) => void }, elementor: { getContainer: ( id: string ) => unknown } };

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
		const menuId = await editor.v4Panel.addAtomicElementFromPanel( menuType );

		await expect( getMenuRoot( menuId ).locator( '..' ) ).toHaveAttribute( 'data-element_type', 'e-flexbox' );

		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();

		return menuId;
	};

	const urlPlaceholder = 'Type or paste your URL';
	const newTabLabel = 'Open in a new tab';

	const getRows = ( field: Locator ): Locator => field.locator( 'ul.MuiList-root > li' );

	const openRowPopover = async ( field: Locator, index: number ): Promise<Locator> => {
		await getRows( field ).nth( index ).getByLabel( 'Open item' ).click();

		const popover = editor.page.locator( '.MuiPopover-paper' ).last();

		await expect( popover.getByText( 'Item name' ) ).toBeVisible();

		return popover;
	};

	const closePopover = async () => {
		await editor.page.keyboard.press( 'Escape' );
		await expect( editor.page.locator( '.MuiPopover-paper' ) ).toHaveCount( 0 );
	};

	const getNewTabSwitch = ( scope: Locator ): Locator => {
		return scope.locator( 'div' ).filter( { hasText: newTabLabel } ).last().locator( 'input[type="checkbox"]' );
	};

	const getEntryIds = async ( menu: Locator ): Promise<string[]> => {
		return menu.locator( `[data-element_type="${ entryType }"]` ).evaluateAll(
			( nodes ) => nodes.map( ( node ) => node.getAttribute( 'data-id' ) as string ),
		);
	};

	const getItemIdOf = async ( menu: Locator, entryId: string ): Promise<string> => {
		return await menu.locator( `[data-id="${ entryId }"] [data-element_type="e-menu-item"]` )
			.first().getAttribute( 'data-id' ) as string;
	};

	const getStructureRow = ( elementId: string ): Locator => {
		return editor.page.locator( `#elementor-navigator .elementor-navigator__element[data-id="${ elementId }"]` );
	};

	const getRowLabels = async ( field: Locator ): Promise<string[]> => {
		return ( await getRows( field ).allTextContents() ).map( ( text ) => text.trim() );
	};

	const getStructureEntryTitles = async ( entryIds: string[] ): Promise<string[]> => {
		return Promise.all( entryIds.map( async ( id ) => {
			return ( await getStructureRow( id ).locator( '.elementor-navigator__element__title__text' ).first().textContent() )?.trim() ?? '';
		} ) );
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
		await expect( field.locator( 'ul.MuiList-root' ) ).toHaveScreenshot( 'menu-items-repeater-default.png' );
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
		await expect( getEntries( menu ).last() ).toHaveText( 'Menu item' );
		await expect( field.locator( 'ul.MuiList-root > li' ) ).toHaveCount( 5 );
		await expect( menu ).toHaveScreenshot( 'menu-after-add-canvas.png' );
		await expect( field.locator( 'ul.MuiList-root' ) ).toHaveScreenshot( 'menu-items-repeater-after-add.png' );
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
		await expect( menu ).toHaveScreenshot( 'menu-after-remove-canvas.png' );
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
		await expect( menu ).toHaveScreenshot( 'menu-after-duplicate-canvas.png' );
	} );

	test( 'Renaming an entry in the repeater updates the repeater label', async () => {
		// Arrange
		await addMenu();
		const field = await openMenuItemsControl();
		const firstItem = field.locator( 'ul.MuiList-root > li' ).first();

		// Act
		await firstItem.getByLabel( 'Open item' ).click();
		await editor.page.locator( '.MuiPopover-paper input[type="text"]' ).fill( 'Start' );

		// Assert
		await expect( firstItem ).toContainText( 'Start' );
	} );

	test( 'Row popover sets the entry link and renders an anchor on the canvas', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const field = await openMenuItemsControl();
		const firstItem = field.locator( 'ul.MuiList-root > li' ).first();

		// Act
		await firstItem.getByLabel( 'Open item' ).click();

		const popover = editor.page.locator( '.MuiPopover-paper' );

		await expect( popover.getByText( 'Item name' ) ).toBeVisible();
		await popover.locator( '[aria-label="Toggle link"]' ).click( { timeout: 30000 } );

		await popover.getByPlaceholder( 'Type or paste your URL' ).fill( 'https://example.com/home' );

		// Assert
		await expect( menu.locator( 'a[href="https://example.com/home"]' ) ).toHaveCount( 1 );
		await expect( getEntries( menu ) ).toHaveText( [ 'Home', 'Products', 'About', 'Contact' ] );
	} );

	test( 'The last remaining entry cannot be removed', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const field = await openMenuItemsControl();

		// Act
		for ( let remaining = 4; remaining > 1; remaining-- ) {
			const item = field.locator( 'ul.MuiList-root > li' ).first();

			await item.hover();
			await item.getByRole( 'button', { name: 'Remove' } ).click();
			await expect( getEntries( menu ) ).toHaveCount( remaining - 1 );
		}

		// Assert
		const lastItem = field.locator( 'ul.MuiList-root > li' ).first();

		await lastItem.hover();
		await expect( lastItem.getByRole( 'button', { name: 'Remove' } ) ).toHaveCount( 0 );
		await expect( getEntries( menu ) ).toHaveText( [ 'Contact' ] );
	} );

	test( 'Entry link flow: rename, link, new tab and URL stay in sync between the repeater and the Menu Item', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const [ firstEntryId ] = await getEntryIds( menu );
		const firstItemId = await getItemIdOf( menu, firstEntryId );
		let field = await openMenuItemsControl();

		// Act - rename from the repeater
		let popover = await openRowPopover( field, 0 );

		await popover.getByLabel( 'Item name' ).fill( 'Start' );
		await closePopover();
		await editor.openStructurePanel();
		await editor.expandStructureNode( menuId );
		await editor.expandAllStructureNodes();

		// Assert - Structure shows it, the canvas text is untouched
		await expect( getStructureRow( firstEntryId ).locator( '.elementor-navigator__element__title__text' ).first() )
			.toHaveText( 'Start' );
		await expect( getEntries( menu ).first() ).toHaveText( 'Home' );

		// Act - rename from Structure
		await getStructureRow( firstEntryId ).locator( '.elementor-navigator__element__title__text' ).first().dblclick();
		await editor.page.keyboard.press( 'Control+A' );
		await editor.page.keyboard.type( 'Begin' );
		await editor.page.keyboard.press( 'Enter' );
		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();
		field = await openMenuItemsControl();

		// Assert - the repeater shows it, the canvas text is untouched
		await expect( getRows( field ).first() ).toContainText( 'Begin' );
		await expect( getEntries( menu ).first() ).toHaveText( 'Home' );

		// Act - link and new tab from the repeater
		popover = await openRowPopover( field, 0 );
		await popover.locator( '[aria-label="Toggle link"]' ).click();
		await popover.getByPlaceholder( urlPlaceholder ).fill( 'https://example.com/first' );
		await getNewTabSwitch( popover ).check();
		await closePopover();

		// Assert - the Menu Item panel matches
		await editor.selectElementInStructurePanel( firstItemId );
		await editor.waitForPanelToLoad();
		await editor.v4Panel.openTab( 'general' );

		await expect( editor.page.getByPlaceholder( urlPlaceholder ) ).toHaveValue( 'https://example.com/first' );
		await expect( getNewTabSwitch( editor.page.locator( '#elementor-panel' ) ) ).toBeChecked();
		await expect( menu.locator( '[data-id="' + firstItemId + '"]' ) ).toHaveAttribute( 'target', '_blank' );

		// Act - switch the new tab off on the item itself
		await getNewTabSwitch( editor.page.locator( '#elementor-panel' ) ).uncheck();

		// Assert - the repeater matches
		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();
		field = await openMenuItemsControl();
		popover = await openRowPopover( field, 0 );

		await expect( getNewTabSwitch( popover ) ).not.toBeChecked();
		await expect( popover.getByPlaceholder( urlPlaceholder ) ).toHaveValue( 'https://example.com/first' );
		await closePopover();

		// Act - pick a page from the query results on the item itself
		await editor.selectElementInStructurePanel( firstItemId );
		await editor.waitForPanelToLoad();
		await editor.v4Panel.openTab( 'general' );

		const itemUrlInput = editor.page.getByPlaceholder( urlPlaceholder );

		await itemUrlInput.fill( 'Sample' );
		await editor.page.getByRole( 'option' ).first().click();

		const selectedValue = await itemUrlInput.inputValue();

		expect( selectedValue ).not.toBe( 'https://example.com/first' );

		// Assert - the repeater shows the same selection
		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();
		field = await openMenuItemsControl();
		popover = await openRowPopover( field, 0 );

		await expect( popover.getByPlaceholder( urlPlaceholder ) ).toHaveValue( selectedValue );

		// Act - change the link in the repeater and switch the new tab back on
		await popover.getByPlaceholder( urlPlaceholder ).fill( 'https://example.com/final' );
		await getNewTabSwitch( popover ).check();
		await closePopover();

		// Assert - frontend
		await editor.publishAndViewPage();
		await editor.waitForFrontendFonts();

		const anchor = editor.page.locator( 'nav.e-menu a' );

		await expect( anchor ).toHaveCount( 1 );
		await expect( anchor ).toHaveAttribute( 'href', 'https://example.com/final' );
		await expect( anchor ).toHaveAttribute( 'target', '_blank' );
	} );

	test( 'Order and empty flow: reorder from Structure and the repeater, emptied items are skipped on the frontend', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const initialIds = await getEntryIds( menu );
		const field = await openMenuItemsControl();

		await editor.openStructurePanel();
		await editor.expandStructureNode( menuId );
		await editor.expandAllStructureNodes();

		// Act - empty one item and undo, then empty it again
		const emptiedEntryId = initialIds[ 1 ];
		const emptiedParagraphId = await menu.locator( `[data-id="${ emptiedEntryId }"] [data-element_type="widget"]` )
			.first().getAttribute( 'data-id' ) as string;

		await editor.removeElement( emptiedParagraphId );
		await expect( menu.locator( `[data-id="${ emptiedEntryId }"] [data-id="${ emptiedParagraphId }"]` ) ).toHaveCount( 0 );

		await editor.page.evaluate( () => ( window as unknown as EditorWindow ).$e.run( 'document/history/undo' ) );
		await expect( menu.locator( `[data-id="${ emptiedEntryId }"] [data-id="${ emptiedParagraphId }"]` ) ).toHaveCount( 1 );

		await editor.page.evaluate( ( id ) => {
			( window as unknown as EditorWindow ).$e.run( 'document/elements/delete', { container: ( window as unknown as EditorWindow ).elementor.getContainer( id ) } );
		}, emptiedParagraphId );

		// Assert - the entry stays in the editor and in the repeater
		await expect( getEntries( menu ) ).toHaveCount( 4 );
		await expect( getRows( field ) ).toHaveCount( 4 );

		// Act - reorder as a Structure drop does: move the first entry to the end
		await editor.page.evaluate( ( id ) => {
			const win = window as unknown as EditorWindow;
			const container = win.elementor.getContainer( id ) as { parent: unknown };

			win.$e.run( 'document/elements/move', { container, target: container.parent, options: { at: 3 } } );
		}, initialIds[ 0 ] );

		// Assert - the repeater follows
		const afterStructureMove = await getEntryIds( menu );

		expect( afterStructureMove ).toEqual( [ initialIds[ 1 ], initialIds[ 2 ], initialIds[ 3 ], initialIds[ 0 ] ] );
		await expect.poll( () => getRowLabels( field ) ).toEqual( [ 'Products', 'About', 'Contact', 'Home' ] );

		// Act - the opposite: reorder from the repeater (last row to the top)
		const lastRow = getRows( field ).last();

		await lastRow.hover();
		await lastRow.locator( '.class-item-sortable-trigger' ).dragTo( getRows( field ).first() );

		// Assert - Structure and canvas follow
		await expect.poll( () => getEntryIds( menu ) ).toEqual( initialIds );
		await expect.poll( () => getStructureEntryTitles( initialIds ) ).toEqual( [ 'Home', 'Products', 'About', 'Contact' ] );

		// Assert - frontend skips the emptied entry and keeps the order
		await editor.publishAndViewPage();
		await editor.waitForFrontendFonts();

		await expect( editor.page.locator( 'nav.e-menu ul > li' ) ).toHaveText( [ 'Home', 'About', 'Contact' ] );
	} );

	test( 'Structure panel nests the menu in a flexbox and lists every entry once expanded', async () => {
		// Arrange
		const menuId = await addMenu();
		const panel = await editor.openStructurePanel();
		const titles = editor.getStructureTitles();

		await editor.selectElementInStructurePanel( menuId );
		await editor.expandStructureNode( menuId );

		// Assert
		await expect( titles.filter( { hasText: /^Flexbox$/ } ) ).toHaveCount( 1 );
		await expect( titles.filter( { hasText: /^Menu$/ } ) ).toHaveCount( 1 );
		await expect( titles.filter( { hasText: /^Menu items$/ } ) ).toBeVisible();
		await expect( titles.filter( { hasText: /^Home$/ } ) ).toBeHidden();

		// Act
		await editor.expandAllStructureNodes();

		// Assert
		await expect( titles.filter( { hasText: /^Menu item$/ } ) ).toHaveCount( 4 );
		await expect( titles.filter( { hasText: /^Paragraph$/ } ) ).toHaveCount( 4 );

		for ( const name of [ 'Home', 'Products', 'About', 'Contact' ] ) {
			await expect( titles.filter( { hasText: new RegExp( `^${ name }$` ) } ) ).toHaveCount( 1 );
		}

		await expect( panel ).toHaveScreenshot( 'menu-structure-panel-expanded.png' );
	} );

	test( 'Frontend renders the menu as a nav with a list of entries', async () => {
		// Arrange
		await addMenu();

		// Act
		await editor.publishAndViewPage();
		await editor.waitForFrontendFonts();

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
		await editor.waitForFrontendFonts();

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
		const secondItem = field.locator( 'ul.MuiList-root > li' ).nth( 1 );

		await secondItem.hover();
		await secondItem.getByRole( 'button', { name: 'Remove' } ).click();

		// Act
		await editor.publishAndViewPage();
		await editor.waitForFrontendFonts();

		// Assert
		const nav = editor.page.locator( 'nav.e-menu' );

		await expect( nav.locator( 'ul > li' ) ).toHaveText( [ 'Home', 'About', 'Contact', 'Menu item' ] );
		await expect( nav ).toHaveScreenshot( 'menu-frontend-after-edits.png' );
	} );
} );
