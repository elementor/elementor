import { expect, type Locator, type BrowserContext } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Atomic Tabs Editor Interactions @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	const tabsType = 'e-tabs';
	const tabsMenuType = 'e-tabs-menu';
	const tabType = 'e-tab';
	const paragraphType = 'e-paragraph';
	const tabsContentAreaType = 'e-tabs-content-area';
	const tabContentType = 'e-tab-content';
	const menuItemsLabel = 'Menu items';

	const getTabsRoot = ( tabsId: string ): Locator => {
		return editor.getPreviewFrame().locator( editor.getWidgetSelector( tabsId ) );
	};

	const getMenuTabs = ( tabsRoot: Locator ): Locator => {
		return tabsRoot.locator( `.e-con[data-element_type="${ tabsMenuType }"] .e-con[data-element_type="${ tabType }"]` );
	};

	const getTabParagraphs = ( tabsRoot: Locator ): Locator => {
		return tabsRoot.locator( `.e-con[data-element_type="${ tabsMenuType }"] .e-con[data-element_type="${ tabType }"] [data-widget_type="${ paragraphType }.default"]` );
	};

	const getTabContents = ( tabsRoot: Locator ): Locator => {
		return tabsRoot.locator( `.e-con[data-element_type="${ tabsContentAreaType }"] .e-con[data-element_type="${ tabContentType }"]` );
	};

	const getIdsByType = async ( tabsRoot: Locator, elementType: string ): Promise<string[]> => {
		return await tabsRoot.evaluate( ( root, type ) => {
			return Array.from( root.querySelectorAll( `.e-con[data-element_type="${ type }"]` ) )
				.map( ( element ) => element.getAttribute( 'data-id' ) )
				.filter( Boolean );
		}, elementType );
	};

	const openMenuItemsControl = async () => {
		await editor.v4Panel.openTab( 'general' );

		const menuItemsField = editor.page.locator( '[data-type="settings-field"]' )
			.filter( { hasText: menuItemsLabel } );

		await expect( menuItemsField ).toBeVisible();

		return menuItemsField;
	};

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		context = await browser.newContext();
		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async () => {
		await wpAdmin.resetExperiments();

		await context.close();
	} );

	test( 'Clicking tab changes active content', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		const tabItems = getMenuTabs( tabsRoot );
		const tabContents = getTabContents( tabsRoot );
		const tabParagraphs = getTabParagraphs( tabsRoot );
		const firstTab = tabItems.nth( 0 );
		const secondTab = tabItems.nth( 1 );
		const firstContent = tabContents.nth( 0 );
		const secondContent = tabContents.nth( 1 );

		await expect( tabItems ).toHaveCount( 3 );
		await expect( tabParagraphs ).toHaveCount( 3 );
		await expect( firstTab ).toHaveAttribute( 'aria-selected', 'true' );
		await expect( secondTab ).toHaveAttribute( 'aria-selected', 'false' );
		await expect( firstContent ).toBeVisible();
		await expect( secondContent ).not.toBeVisible();

		// Act
		await secondTab.dispatchEvent( 'click' );

		// Assert
		await expect( secondTab ).toHaveAttribute( 'aria-selected', 'true' );
		await expect( firstTab ).toHaveAttribute( 'aria-selected', 'false' );
		await expect( secondContent ).toBeVisible();
		await expect( firstContent ).not.toBeVisible();
	} );

	test( 'Add a tab via tabs control', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();
		const initialTabIds = await getIdsByType( tabsRoot, tabType );
		const initialContentIds = await getIdsByType( tabsRoot, tabContentType );

		// Act
		await menuItemsField.getByRole( 'button', { name: 'Add item' } ).click();

		// Assert
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( initialTabIds.length + 1 );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toHaveLength( initialContentIds.length + 1 );

		const newTabIds = await getIdsByType( tabsRoot, tabType );
		const newContentIds = await getIdsByType( tabsRoot, tabContentType );

		expect( newTabIds ).toEqual( expect.arrayContaining( initialTabIds ) );
		expect( newContentIds ).toEqual( expect.arrayContaining( initialContentIds ) );

		const lastTab = getMenuTabs( tabsRoot ).nth( newTabIds.length - 1 );
		const lastContent = getTabContents( tabsRoot ).nth( newContentIds.length - 1 );

		const tabControls = await lastTab.getAttribute( 'aria-controls' );
		const tabId = await lastTab.getAttribute( 'id' );
		const contentId = await lastContent.getAttribute( 'id' );
		const contentLabelledBy = await lastContent.getAttribute( 'aria-labelledby' );

		expect( tabControls ).toBe( contentId );
		expect( contentLabelledBy ).toBe( tabId );
	} );

	test( 'Reorder tabs via control drag handle', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();
		const initialTabIds = await getIdsByType( tabsRoot, tabType );
		const initialContentIds = await getIdsByType( tabsRoot, tabContentType );

		// Act
		const listItems = menuItemsField.locator( 'ul.MuiList-root > li' );
		const firstItem = listItems.first();
		const lastItem = listItems.last();

		const firstDragHandle = firstItem.locator( '.class-item-sortable-trigger' );

		// Hover to reveal the drag handle (visibility: hidden -> visible on hover)
		await firstItem.hover();
		await firstDragHandle.dragTo( lastItem );

		// Assert
		const expectedTabOrder = [ ...initialTabIds.slice( 1 ), initialTabIds[ 0 ] ];
		const expectedContentOrder = [ ...initialContentIds.slice( 1 ), initialContentIds[ 0 ] ];

		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toEqual( expectedTabOrder );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toEqual( expectedContentOrder );
	} );

	test( 'Remove a tab via control', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();
		const initialTabIds = await getIdsByType( tabsRoot, tabType );
		const initialContentIds = await getIdsByType( tabsRoot, tabContentType );

		// Act
		const listItems = menuItemsField.locator( 'ul.MuiList-root > li' );
		await listItems.nth( 1 ).hover();

		const removeButton = listItems.nth( 1 ).getByRole( 'button', { name: 'Remove' } );
		await expect( removeButton ).toBeVisible();
		await removeButton.click();

		// Assert
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( initialTabIds.length - 1 );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toHaveLength( initialContentIds.length - 1 );

		const remainingTabIds = await getIdsByType( tabsRoot, tabType );
		const remainingContentIds = await getIdsByType( tabsRoot, tabContentType );

		expect( remainingTabIds ).not.toContain( initialTabIds[ 1 ] );
		expect( remainingContentIds ).not.toContain( initialContentIds[ 1 ] );
		expect( remainingTabIds.length ).toBe( remainingContentIds.length );
	} );

	test( 'Duplicate a tab via control', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();
		const initialTabIds = await getIdsByType( tabsRoot, tabType );
		const initialContentIds = await getIdsByType( tabsRoot, tabContentType );

		// Act
		const listItems = menuItemsField.locator( 'ul.MuiList-root > li' );
		await listItems.first().hover();

		const duplicateButton = listItems.first().getByRole( 'button', { name: 'Duplicate' } );
		await expect( duplicateButton ).toBeVisible();
		await duplicateButton.click();

		// Assert
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( initialTabIds.length + 1 );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toHaveLength( initialContentIds.length + 1 );

		const newTabIds = await getIdsByType( tabsRoot, tabType );
		const newContentIds = await getIdsByType( tabsRoot, tabContentType );

		const uniqueTabIds = new Set( newTabIds );
		const uniqueContentIds = new Set( newContentIds );

		expect( uniqueTabIds.size ).toBe( newTabIds.length );
		expect( uniqueContentIds.size ).toBe( newContentIds.length );
	} );

	test( 'Default tab resets to first when removed', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		const tabItems = getMenuTabs( tabsRoot );

		await tabItems.nth( 1 ).dispatchEvent( 'click' );
		await expect( tabItems.nth( 1 ) ).toHaveAttribute( 'aria-selected', 'true' );

		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();

		// Act
		const listItems = menuItemsField.locator( 'ul.MuiList-root > li' );
		await listItems.nth( 1 ).hover();

		const removeButton = listItems.nth( 1 ).getByRole( 'button', { name: 'Remove' } );
		await expect( removeButton ).toBeVisible();
		await removeButton.click();

		// Assert
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( 2 );

		const remainingTabs = getMenuTabs( tabsRoot );
		await expect( remainingTabs.first() ).toHaveAttribute( 'aria-selected', 'true' );
	} );

	test( 'All tabs have unique and valid content links', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();
		await menuItemsField.getByRole( 'button', { name: 'Add item' } ).click();
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( 4 );

		// Act
		const tabItems = getMenuTabs( tabsRoot );
		const tabContents = getTabContents( tabsRoot );
		const tabCount = await tabItems.count();
		const contentCount = await tabContents.count();

		// Assert
		expect( tabCount ).toBe( contentCount );

		const ariaControlsSet = new Set< string >();
		const contentIdSet = new Set< string >();

		for ( let i = 0; i < tabCount; i++ ) {
			const tab = tabItems.nth( i );
			const content = tabContents.nth( i );

			const ariaControls = await tab.getAttribute( 'aria-controls' );
			const tabId = await tab.getAttribute( 'id' );
			const contentId = await content.getAttribute( 'id' );
			const ariaLabelledby = await content.getAttribute( 'aria-labelledby' );

			expect( ariaControlsSet.has( ariaControls! ) ).toBe( false );
			ariaControlsSet.add( ariaControls! );

			expect( contentIdSet.has( contentId! ) ).toBe( false );
			contentIdSet.add( contentId! );

			expect( ariaControls ).toBe( contentId );
			expect( ariaLabelledby ).toBe( tabId );
		}

		let visibleCount = 0;
		for ( let i = 0; i < contentCount; i++ ) {
			const isVisible = await tabContents.nth( i ).isVisible();
			if ( isVisible ) {
				visibleCount++;
			}
		}
		expect( visibleCount ).toBe( 1 );
	} );

	test( 'Keyboard navigation between tabs', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		const tabItems = getMenuTabs( tabsRoot );

		const firstTab = tabItems.nth( 0 );
		const secondTab = tabItems.nth( 1 );
		const thirdTab = tabItems.nth( 2 );

		await expect( firstTab ).toHaveAttribute( 'aria-selected', 'true' );
		await expect( firstTab ).toHaveAttribute( 'tabindex', '0' );
		await expect( secondTab ).toHaveAttribute( 'tabindex', '-1' );

		// Act & Assert - Navigate right
		await firstTab.focus();
		await firstTab.press( 'ArrowRight' );

		await expect( secondTab ).toBeFocused();

		await secondTab.press( 'ArrowRight' );
		await expect( thirdTab ).toBeFocused();

		// Act & Assert - Navigate left
		await thirdTab.press( 'ArrowLeft' );
		await expect( secondTab ).toBeFocused();

		await secondTab.press( 'ArrowLeft' );
		await expect( firstTab ).toBeFocused();
	} );

	test( 'Cannot remove last remaining tab', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();

		// Remove tabs until only one remains
		const listItems = menuItemsField.locator( 'ul.MuiList-root > li' );

		await listItems.nth( 2 ).hover();
		const removeButton2 = listItems.nth( 2 ).getByRole( 'button', { name: 'Remove' } );
		await expect( removeButton2 ).toBeVisible();
		await removeButton2.click();

		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( 2 );

		await listItems.nth( 1 ).hover();
		const removeButton1 = listItems.nth( 1 ).getByRole( 'button', { name: 'Remove' } );
		await expect( removeButton1 ).toBeVisible();
		await removeButton1.click();

		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( 1 );

		// Act & Assert - Last tab should not have remove button
		await listItems.first().hover();
		const lastRemoveButton = listItems.first().getByRole( 'button', { name: 'Remove' } );
		await expect( lastRemoveButton ).not.toBeVisible();

		// Verify tab and content still exist
		await expect( getMenuTabs( tabsRoot ) ).toHaveCount( 1 );
		await expect( getTabContents( tabsRoot ) ).toHaveCount( 1 );
	} );

	test( 'Undo and redo tab operations', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();
		const initialTabIds = await getIdsByType( tabsRoot, tabType );
		const initialContentIds = await getIdsByType( tabsRoot, tabContentType );

		// Act - Add a tab
		await menuItemsField.getByRole( 'button', { name: 'Add item' } ).click();
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( 4 );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toHaveLength( 4 );

		// Act - Undo the add
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await editor.page.evaluate( () => ( window as any ).$e.run( 'document/history/undo' ) );

		// Assert - Back to initial state
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( initialTabIds.length );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toHaveLength( initialContentIds.length );

		const afterUndoTabIds = await getIdsByType( tabsRoot, tabType );
		const afterUndoContentIds = await getIdsByType( tabsRoot, tabContentType );

		expect( afterUndoTabIds ).toEqual( initialTabIds );
		expect( afterUndoContentIds ).toEqual( initialContentIds );

		// Act - Redo the add
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await editor.page.evaluate( () => ( window as any ).$e.run( 'document/history/redo' ) );

		// Assert - Tab is added again
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toHaveLength( 4 );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toHaveLength( 4 );
	} );

	test( 'Undo and redo reorder restores tab order', async () => {
		// Arrange
		const tabsId = await editor.addElement( { elType: tabsType }, 'document' );
		const tabsRoot = getTabsRoot( tabsId );
		await editor.selectElement( tabsId );
		await editor.waitForPanelToLoad();

		const menuItemsField = await openMenuItemsControl();
		const initialTabIds = await getIdsByType( tabsRoot, tabType );
		const initialContentIds = await getIdsByType( tabsRoot, tabContentType );

		// Act - Reorder: move first tab to last position
		const listItems = menuItemsField.locator( 'ul.MuiList-root > li' );
		const firstItem = listItems.first();
		const lastItem = listItems.last();
		const firstDragHandle = firstItem.locator( '.class-item-sortable-trigger' );

		await firstItem.hover();
		await firstDragHandle.dragTo( lastItem );

		// Assert - Order changed
		const expectedTabOrder = [ ...initialTabIds.slice( 1 ), initialTabIds[ 0 ] ];
		const expectedContentOrder = [ ...initialContentIds.slice( 1 ), initialContentIds[ 0 ] ];
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toEqual( expectedTabOrder );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toEqual( expectedContentOrder );

		// Act - Undo the reorder
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await editor.page.evaluate( () => ( window as any ).$e.run( 'document/history/undo' ) );

		// Assert - Order restored
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toEqual( initialTabIds );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toEqual( initialContentIds );

		// Act - Redo the reorder
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await editor.page.evaluate( () => ( window as any ).$e.run( 'document/history/redo' ) );

		// Assert - Order changed again
		await expect.poll( () => getIdsByType( tabsRoot, tabType ) ).toEqual( expectedTabOrder );
		await expect.poll( () => getIdsByType( tabsRoot, tabContentType ) ).toEqual( expectedContentOrder );
	} );
} );
