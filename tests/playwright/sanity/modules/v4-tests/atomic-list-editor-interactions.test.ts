import { expect, type BrowserContext, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import EditorPage from '../../../pages/editor-page';
import WpAdminPage from '../../../pages/wp-admin-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Atomic List Editor Interactions @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	const listType = 'e-list';
	const listItemsLabel = 'List Items';

	const getListRoot = ( listId: string ): Locator => {
		return editor.getPreviewFrame().locator( editor.getWidgetSelector( listId ) );
	};

	const getListItems = ( listRoot: Locator ): Locator => {
		return listRoot.locator( '.e-list-item' );
	};

	const getListMarkers = ( listRoot: Locator ): Locator => {
		return listRoot.locator( '.e-list-item__marker .e-svg-base' );
	};

	const getListParagraphs = ( listRoot: Locator ): Locator => {
		return listRoot.locator( '[data-widget_type="e-paragraph.default"]' );
	};

	const getListItemIds = async ( listRoot: Locator ): Promise<string[]> => {
		return await listRoot.evaluate( ( root ) => {
			return Array.from( root.querySelectorAll( '.e-list-item' ) )
				.map( ( element ) => element.getAttribute( 'data-id' ) )
				.filter( Boolean );
		} );
	};

	const openListItemsControl = async () => {
		await editor.v4Panel.openTab( 'general' );

		const listItemsField = editor.page.locator( '[data-type="settings-field"]' )
			.filter( { hasText: listItemsLabel } );

		await expect( listItemsField ).toBeVisible();

		return listItemsField;
	};

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		await wpCli( 'wp elementor experiments activate e_list' );

		context = await browser.newContext();
		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Inserting List creates one default item with marker and content', async () => {
		// Arrange.
		const listId = await editor.addElement( { elType: listType }, 'document' );
		const listRoot = getListRoot( listId );

		// Assert.
		await expect( getListItems( listRoot ) ).toHaveCount( 1 );
		await expect( getListMarkers( listRoot ) ).toHaveCount( 1 );
		await expect( getListParagraphs( listRoot ) ).toHaveCount( 1 );
	} );

	test( 'Add, duplicate, and remove list items via control', async () => {
		// Arrange.
		const listId = await editor.addElement( { elType: listType }, 'document' );
		const listRoot = getListRoot( listId );
		await editor.selectElement( listId );
		await editor.waitForPanelToLoad();

		const listItemsField = await openListItemsControl();
		const initialIds = await getListItemIds( listRoot );

		// Act - add item.
		await listItemsField.getByRole( 'button', { name: 'Add item' } ).click();
		await expect.poll( () => getListItemIds( listRoot ) ).toHaveLength( initialIds.length + 1 );

		// Act - duplicate first item.
		const listRows = listItemsField.locator( 'ul.MuiList-root > li' );
		await listRows.first().hover();
		const duplicateButton = listRows.first().getByRole( 'button', { name: 'Duplicate' } );
		await expect( duplicateButton ).toBeVisible();
		await duplicateButton.click();

		await expect.poll( () => getListItemIds( listRoot ) ).toHaveLength( initialIds.length + 2 );

		// Assert duplicate creates a fresh subtree.
		const duplicatedIds = await getListItemIds( listRoot );
		expect( new Set( duplicatedIds ).size ).toBe( duplicatedIds.length );
		await expect( getListMarkers( listRoot ) ).toHaveCount( duplicatedIds.length );
		await expect( getListParagraphs( listRoot ) ).toHaveCount( duplicatedIds.length );

		// Act - remove one of the extra items.
		await listRows.nth( 1 ).hover();
		const removeButton = listRows.nth( 1 ).getByRole( 'button', { name: 'Remove' } );
		await expect( removeButton ).toBeVisible();
		await removeButton.click();

		await expect.poll( () => getListItemIds( listRoot ) ).toHaveLength( initialIds.length + 1 );

		// Act - remove down to the minimum.
		await listRows.nth( 1 ).hover();
		const secondRemoveButton = listRows.nth( 1 ).getByRole( 'button', { name: 'Remove' } );
		await expect( secondRemoveButton ).toBeVisible();
		await secondRemoveButton.click();

		await expect.poll( () => getListItemIds( listRoot ) ).toHaveLength( 1 );

		// Assert - last item cannot be removed.
		await listRows.first().hover();
		await expect( listRows.first().getByRole( 'button', { name: 'Remove' } ) ).toBeHidden();
	} );

	test( 'Reorder list items via control drag handle', async () => {
		// Arrange.
		const listId = await editor.addElement( { elType: listType }, 'document' );
		const listRoot = getListRoot( listId );
		await editor.selectElement( listId );
		await editor.waitForPanelToLoad();

		const listItemsField = await openListItemsControl();
		await listItemsField.getByRole( 'button', { name: 'Add item' } ).click();
		await expect.poll( () => getListItemIds( listRoot ) ).toHaveLength( 2 );

		const initialIds = await getListItemIds( listRoot );

		// Act.
		const listRows = listItemsField.locator( 'ul.MuiList-root > li' );
		const firstItem = listRows.first();
		const lastItem = listRows.last();
		const firstDragHandle = firstItem.locator( '.class-item-sortable-trigger' );

		await firstItem.hover();
		await firstDragHandle.dragTo( lastItem );

		// Assert.
		await expect.poll( () => getListItemIds( listRoot ) ).toEqual( [ initialIds[ 1 ], initialIds[ 0 ] ] );
	} );
} );
