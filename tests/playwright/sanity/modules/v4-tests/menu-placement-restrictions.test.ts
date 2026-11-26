import { expect, type BrowserContext, type Locator, type TestInfo } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { wpCli } from '../../../assets/wp-cli';
import ContextMenu from '../../../pages/widgets/context-menu';

type Container = { id: string; children: Container[] };

type EditorWindow = {
	$e: { run: ( command: string, args?: unknown ) => unknown };
	elementor: { getContainer: ( id: string ) => Container };
};

const MENU_IN_LINK_MESSAGE = "A Menu can't be placed inside a link. Remove the link from the parent container first.";
const MENU_IN_MENU_MESSAGE = "A Menu can't be placed inside another Menu.";

const LINK_SETTING = {
	link: {
		$$type: 'link',
		value: { destination: { $$type: 'url', value: 'https://example.com' } },
	},
};

test.describe( 'Menu placement restrictions @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let testInfo: TestInfo;

	const getMenus = ( parentId: string ): Locator => {
		return editor.getPreviewFrame().locator( `[data-id="${ parentId }"] [data-element_type="e-menu"]` );
	};

	const addMenu = async (): Promise<string> => {
		const menuId = await editor.v4Panel.addAtomicElementFromPanel( 'e-menu' );

		await expect( editor.getPreviewFrame().locator( editor.getWidgetSelector( menuId ) ) ).toBeVisible();

		return menuId;
	};

	const addLinkedDivBlock = async (): Promise<string> => {
		const divId = await editor.addElement( { elType: 'e-div-block' }, 'document' );

		await editor.applyElementSettings( divId, LINK_SETTING );

		await expect.poll( () => editor.getPreviewFrame().locator( `[data-id="${ divId }"]` )
			.evaluate( ( el ) => el.tagName.toLowerCase() ) ).toBe( 'a' );

		return divId;
	};

	const clickMenuInPanelWith = async ( containerId: string ) => {
		await editor.selectElement( containerId );
		await editor.openElementsPanel();
		await editor.page.locator( `#elementor-panel-category-v4-elements [data-library-element-type="e-menu"]` ).click();
	};

	const addMenuIn = async ( containerId: string ) => {
		await editor.selectElement( containerId );
		await addMenu();
	};

	const addMenuInNewDivBlock = async (): Promise<string> => {
		const divId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
		await addMenuIn( divId );

		return await getMenus( divId ).first().getAttribute( 'data-id' ) as string;
	};

	const copyAndPasteInto = async ( sourceId: string, targetId: string ) => {
		const contextMenu = new ContextMenu( editor.page, testInfo );

		await editor.openStructurePanel();
		await editor.expandAllStructureNodes();
		await contextMenu.copyElementFromNavigator( sourceId );
		await contextMenu.pasteElementInNavigator( targetId );
	};

	const moveInto = async ( sourceId: string, targetId: string ) => {
		await editor.page.evaluate( ( [ source, target ] ) => {
			const { $e, elementor } = window as unknown as EditorWindow;

			$e.run( 'document/elements/move', {
				container: elementor.getContainer( source ),
				target: elementor.getContainer( target ),
			} );
		}, [ sourceId, targetId ] );
	};

	const getMenuItemId = async ( menuId: string ): Promise<string> => {
		return await editor.getPreviewFrame()
			.locator( `[data-id="${ menuId }"] [data-element_type="e-menu-item"]` )
			.first()
			.getAttribute( 'data-id' ) as string;
	};

	test.beforeEach( async ( { browser, apiRequests }, info ) => {
		testInfo = info;
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

	test( 'A Menu cannot be added into a linked Div block', async () => {
		// Arrange
		const divId = await addLinkedDivBlock();

		// Act
		await clickMenuInPanelWith( divId );

		// Assert
		await expect( editor.page.getByText( MENU_IN_LINK_MESSAGE ) ).toBeVisible();
		await expect( getMenus( divId ) ).toHaveCount( 0 );
	} );

	test( 'A Menu can be added into an unlinked Div block', async () => {
		// Arrange
		const divId = await editor.addElement( { elType: 'e-div-block' }, 'document' );

		// Act
		await addMenuIn( divId );

		// Assert
		await expect( getMenus( divId ) ).toHaveCount( 1 );
		await expect( editor.page.getByText( MENU_IN_LINK_MESSAGE ) ).toHaveCount( 0 );
	} );

	test( 'A Menu cannot be pasted into a linked Div block', async () => {
		// Arrange
		const menuId = await addMenu();
		const divId = await addLinkedDivBlock();

		// Act
		await copyAndPasteInto( menuId, divId );

		// Assert
		await expect( editor.page.getByText( MENU_IN_LINK_MESSAGE ) ).toBeVisible();
		await expect( getMenus( divId ) ).toHaveCount( 0 );
	} );

	test( 'A Menu cannot be moved into a linked Div block', async () => {
		// Arrange
		const menuId = await addMenu();
		const divId = await addLinkedDivBlock();

		// Act
		await moveInto( menuId, divId );

		// Assert
		await expect( editor.page.getByText( MENU_IN_LINK_MESSAGE ) ).toBeVisible();
		await expect( getMenus( divId ) ).toHaveCount( 0 );
	} );

	test( 'A Menu cannot be pasted into another Menu', async () => {
		// Arrange
		const sourceMenuId = await addMenu();
		const targetMenuId = await addMenuInNewDivBlock();
		const itemId = await getMenuItemId( targetMenuId );

		// Act
		await copyAndPasteInto( sourceMenuId, itemId );

		// Assert
		await expect( editor.page.getByText( MENU_IN_MENU_MESSAGE ) ).toBeVisible();
		await expect( getMenus( itemId ) ).toHaveCount( 0 );
	} );

	test( 'A container holding a Menu cannot get a link', async () => {
		// Arrange
		const divId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
		await addMenuIn( divId );
		await expect( getMenus( divId ) ).toHaveCount( 1 );

		// Act
		await editor.selectElement( divId );
		await editor.v4Panel.openTab( 'general' );

		// Assert
		await expect( editor.page.locator( '[aria-label="Toggle link"]' ) ).toBeDisabled();
	} );

	test( 'A linked Paragraph inside a Menu Item blocks the Menu Item link in its panel and in the repeater', async () => {
		// Arrange
		const menuId = await addMenu();
		const itemId = await getMenuItemId( menuId );
		const paragraphId = await editor.getPreviewFrame()
			.locator( `[data-id="${ itemId }"] [data-widget_type="e-paragraph.default"]` )
			.first()
			.getAttribute( 'data-id' ) as string;

		// Act
		await editor.applyElementSettings( paragraphId, LINK_SETTING );
		await expect( editor.getPreviewFrame().locator( `[data-id="${ itemId }"] a[href="https://example.com"]` ) ).toHaveCount( 1 );

		// Assert
		await editor.selectElement( itemId );
		await editor.v4Panel.openTab( 'general' );
		await expect( editor.page.locator( '[aria-label="Toggle link"]' ) ).toBeDisabled();

		await editor.selectElement( menuId );
		await editor.v4Panel.openTab( 'general' );

		const field = editor.page.locator( '[data-type="settings-field"]' ).filter( { hasText: 'Menu items' } );
		await field.locator( 'ul.MuiList-root > li' ).first().getByLabel( 'Open item' ).click();

		const popover = editor.page.locator( '.MuiPopover-paper' ).last();
		await expect( popover.getByText( 'Item name' ) ).toBeVisible();
		await expect( popover.locator( '[aria-label="Toggle link"]' ) ).toBeDisabled();
	} );
} );
