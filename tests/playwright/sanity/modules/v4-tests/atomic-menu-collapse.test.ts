import { expect, type BrowserContext, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { wpCli } from '../../../assets/wp-cli';

type EditorWindow = {
	$e: { run: ( cmd: string, args?: unknown ) => void };
	elementor: {
		getContainer: ( id: string ) => unknown;
		config: { elements: Record<string, unknown> };
	};
};

const DESKTOP = { width: 1280, height: 800 };
const TABLET = { width: 900, height: 800 };
const MOBILE = { width: 400, height: 800 };
const OUTSIDE_CLICK_OFFSET = 5;

test.describe( 'Atomic Menu toggle and collapse @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	const getMenuRoot = ( menuId: string ): Locator => {
		return editor.getPreviewFrame().locator( editor.getWidgetSelector( menuId ) );
	};

	const addMenu = async (): Promise<string> => {
		const menuId = await editor.v4Panel.addAtomicElementFromPanel( 'e-menu' );

		await expect( getMenuRoot( menuId ) ).toHaveJSProperty( 'tagName', 'NAV' );

		return menuId;
	};

	const getChildId = async ( root: Locator, elementType: string ): Promise<string> => {
		return await root.locator( `[data-element_type="${ elementType }"]` ).first().getAttribute( 'data-id' ) as string;
	};

	const linkFirstItem = async ( menuId: string ) => {
		const firstItemId = await getChildId( getMenuRoot( menuId ), 'e-menu-item' );

		await editor.applyElementSettings( firstItemId, {
			link: {
				$$type: 'link',
				value: { destination: { $$type: 'url', value: 'https://example.com/home' } },
			},
		} );

		await expect( getMenuRoot( menuId ).locator( 'a[href="https://example.com/home"]' ) ).toHaveCount( 1 );
	};

	const setMenuSettings = async ( menuId: string, settings: Record<string, string> ) => {
		const typed = Object.fromEntries(
			Object.entries( settings ).map( ( [ key, value ] ) => [ key, { $$type: 'string', value } ] ),
		);

		await editor.applyElementSettings( menuId, typed );
	};

	const viewFrontend = async () => {
		await editor.publishAndViewPage();
		await editor.waitForFrontendFonts();
	};

	const getNav = ( index = 0 ): Locator => editor.page.locator( 'nav.e-menu' ).nth( index );
	const getToggle = ( nav: Locator ): Locator => nav.locator( ':scope > button[type="button"]' );
	const getItems = ( nav: Locator ): Locator => nav.locator( ':scope > ul' );

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

	test.describe( 'Editor', () => {
		test( 'A new menu contains the locked toggle with closed and open content, after the items', async () => {
			// Arrange
			const menuId = await addMenu();
			const menu = getMenuRoot( menuId );

			// Assert
			await expect( menu.locator( ':scope > button[data-element_type="e-menu-toggle"]' ) ).toHaveCount( 1 );
			await expect( menu.locator( ':scope > ul + button' ) ).toHaveCount( 1 );
			await expect( menu.locator( '[data-element_type="e-menu-toggle-closed"] svg' ) ).toHaveCount( 1 );
			await expect( menu.locator( '[data-element_type="e-menu-toggle-open"] svg' ) ).toHaveCount( 1 );
		} );

		test( 'The toggle and its containers are locked and hidden from the Elements panel', async () => {
			// Arrange
			const menuId = await addMenu();
			const menu = getMenuRoot( menuId );

			// Act
			const state = await editor.page.evaluate( ( ids ) => {
				const { elementor } = window as unknown as EditorWindow;

				return ids.map( ( { id, type } ) => {
					const container = elementor.getContainer( id ) as { model: { get: ( key: string ) => unknown } };
					const config = elementor.config.elements[ type ] as { show_in_panel: boolean };

					return { type, locked: container.model.get( 'isLocked' ), inPanel: config.show_in_panel };
				} );
			}, [
				{ id: await getChildId( menu, 'e-menu-toggle' ), type: 'e-menu-toggle' },
				{ id: await getChildId( menu, 'e-menu-toggle-closed' ), type: 'e-menu-toggle-closed' },
				{ id: await getChildId( menu, 'e-menu-toggle-open' ), type: 'e-menu-toggle-open' },
			] );

			// Assert
			for ( const { locked, inPanel } of state ) {
				expect( locked ).toBe( true );
				expect( inPanel ).toBe( false );
			}
		} );

		test( 'The four menu settings appear with their defaults', async () => {
			// Arrange
			const menuId = await addMenu();

			await editor.selectElement( menuId );
			await editor.waitForPanelToLoad();
			await editor.v4Panel.openTab( 'general' );

			// Assert
			const sectionTitle = editor.page.getByText( 'Menu Settings', { exact: true } );

			await expect( sectionTitle ).toBeVisible();
			await sectionTitle.click();

			for ( const label of [ 'Open submenus on', 'Collapse at breakpoint', 'Collapsed submenus', 'Collapsed menu position' ] ) {
				await expect( editor.page.locator( '[data-type="settings-field"]' ).filter( { hasText: label } ) ).toBeVisible();
			}

			const stored = await editor.page.evaluate( ( id ) => {
				const { elementor } = window as unknown as EditorWindow;
				const container = elementor.getContainer( id ) as { settings: { get: ( key: string ) => unknown } };

				return container.settings.get( 'collapse-breakpoint' );
			}, menuId );

			expect( stored ).toEqual( { $$type: 'string', value: 'tablet' } );
		} );

		test( 'At the collapse breakpoint the toggle shows and the items hide, above it the reverse', async () => {
			// Arrange
			const menuId = await addMenu();
			const menu = getMenuRoot( menuId );

			// Assert - desktop
			await expect( getToggle( menu ) ).toBeHidden();
			await expect( getItems( menu ) ).toBeVisible();

			// Act
			await editor.changeResponsiveView( 'tablet' );

			// Assert - tablet
			await expect( getToggle( menu ) ).toBeVisible();
			await expect( getItems( menu ) ).toBeHidden();
		} );

		test( 'Closed and Open states can be previewed from the Structure panel', async () => {
			// Arrange
			const menuId = await addMenu();
			const menu = getMenuRoot( menuId );
			const openContentId = await getChildId( menu, 'e-menu-toggle-open' );
			const closedContentId = await getChildId( menu, 'e-menu-toggle-closed' );

			await editor.changeResponsiveView( 'tablet' );
			await editor.openStructurePanel();
			await editor.expandStructureNode( menuId );
			await editor.expandAllStructureNodes();

			// Act - preview Open
			await editor.selectElementInStructurePanel( openContentId );

			// Assert
			await expect( menu ).toHaveAttribute( 'data-e-open', 'true' );
			await expect( getItems( menu ) ).toBeVisible();

			// Act - preview Closed
			await editor.selectElementInStructurePanel( closedContentId );

			// Assert
			await expect( menu ).not.toHaveAttribute( 'data-e-open', 'true' );
			await expect( getItems( menu ) ).toBeHidden();
		} );

		test( 'Both states stay editable in Structure while only one is visible on the canvas', async () => {
			// Arrange
			const menuId = await addMenu();

			await editor.openStructurePanel();
			await editor.expandStructureNode( menuId );
			await editor.expandAllStructureNodes();

			const titles = editor.getStructureTitles();

			// Assert
			await expect( titles.filter( { hasText: /^Menu toggle$/ } ) ).toHaveCount( 1 );
			await expect( titles.filter( { hasText: /^Toggle closed content$/ } ) ).toHaveCount( 1 );
			await expect( titles.filter( { hasText: /^Toggle open content$/ } ) ).toHaveCount( 1 );
		} );

		test( 'With the experiment off none of the menu types are registered', async () => {
			// Arrange
			await wpCli( 'wp elementor experiments deactivate e_nav_menu' );
			editor = await wpAdmin.openNewPage();

			// Act
			const registered = await editor.page.evaluate( () => {
				const { elements } = ( window as unknown as EditorWindow ).elementor.config;

				return [ 'e-menu', 'e-menu-items', 'e-menu-toggle', 'e-menu-toggle-closed', 'e-menu-toggle-open' ]
					.filter( ( type ) => Boolean( elements[ type ] ) );
			} );

			// Assert
			expect( registered ).toEqual( [] );
		} );
	} );

	test.describe( 'Frontend', () => {
		test( 'Toggle opens and closes the collapsed menu and updates aria-expanded and the label', async () => {
			// Arrange
			await addMenu();
			await viewFrontend();

			const nav = getNav();
			const toggle = getToggle( nav );

			// Assert - desktop
			await editor.page.setViewportSize( DESKTOP );
			await expect( toggle ).toBeHidden();
			await expect( getItems( nav ) ).toBeVisible();

			// Act - tablet
			await editor.page.setViewportSize( TABLET );

			// Assert
			await expect( toggle ).toBeVisible();
			await expect( getItems( nav ) ).toBeHidden();
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
			await expect( toggle ).toHaveAttribute( 'aria-label', 'Open menu' );

			const itemsId = await getItems( nav ).getAttribute( 'id' );

			await expect( toggle ).toHaveAttribute( 'aria-controls', itemsId as string );

			// Act - open
			await toggle.click();

			// Assert
			await expect( getItems( nav ) ).toBeVisible();
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
			await expect( toggle ).toHaveAttribute( 'aria-label', 'Close menu' );

			// Act - close
			await toggle.click();

			// Assert
			await expect( getItems( nav ) ).toBeHidden();
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
			await expect( toggle ).toHaveAttribute( 'aria-label', 'Open menu' );
		} );

		test( 'Collapse also applies at mobile and goes back to the full menu on desktop', async () => {
			// Arrange
			await addMenu();
			await viewFrontend();

			const nav = getNav();

			// Act & Assert
			await editor.page.setViewportSize( MOBILE );
			await expect( getToggle( nav ) ).toBeVisible();
			await expect( getItems( nav ) ).toBeHidden();

			await editor.page.setViewportSize( DESKTOP );
			await expect( getToggle( nav ) ).toBeHidden();
			await expect( getItems( nav ) ).toBeVisible();
		} );

		test( 'Toggle is operable by keyboard, Escape closes and returns focus to the toggle', async () => {
			// Arrange
			const menuId = await addMenu();

			await linkFirstItem( menuId );
			await viewFrontend();
			await editor.page.setViewportSize( TABLET );

			const nav = getNav();
			const toggle = getToggle( nav );

			// Act - reach the toggle with the keyboard and open it
			await toggle.focus();
			await editor.page.keyboard.press( 'Enter' );

			// Assert - open, and focus moves to the first link
			await expect( getItems( nav ) ).toBeVisible();
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
			await expect( nav.locator( 'a' ).first() ).toBeFocused();

			// Act - Escape
			await editor.page.keyboard.press( 'Escape' );

			// Assert
			await expect( getItems( nav ) ).toBeHidden();
			await expect( toggle ).toBeFocused();

			// Act - Space also operates it
			await editor.page.keyboard.press( 'Space' );

			// Assert
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
		} );

		test( 'Overlay floats over the page and closes on outside click', async () => {
			// Arrange
			await addMenu();
			await viewFrontend();
			await editor.page.setViewportSize( TABLET );

			const nav = getNav();
			const items = getItems( nav );
			const heightClosed = ( await nav.boundingBox() )!.height;

			// Act
			await getToggle( nav ).click();

			// Assert
			await expect( items ).toBeVisible();
			await expect( items ).toHaveCSS( 'position', 'absolute' );
			expect( ( await nav.boundingBox() )!.height ).toBe( heightClosed );

			// Act
			await editor.page.mouse.click( OUTSIDE_CLICK_OFFSET, TABLET.height - OUTSIDE_CLICK_OFFSET );

			// Assert
			await expect( items ).toBeHidden();
		} );

		test( 'In Flow pushes the content down and ignores outside clicks', async () => {
			// Arrange
			const menuId = await addMenu();

			await setMenuSettings( menuId, { 'collapsed-position': 'in-flow' } );
			await viewFrontend();
			await editor.page.setViewportSize( TABLET );

			const nav = getNav();
			const items = getItems( nav );
			const heightClosed = ( await nav.boundingBox() )!.height;

			// Act
			await getToggle( nav ).click();

			// Assert
			await expect( items ).toBeVisible();
			await expect( items ).not.toHaveCSS( 'position', 'absolute' );
			expect( ( await nav.boundingBox() )!.height ).toBeGreaterThan( heightClosed );

			// Act
			await editor.page.mouse.click( OUTSIDE_CLICK_OFFSET, TABLET.height - OUTSIDE_CLICK_OFFSET );

			// Assert
			await expect( items ).toBeVisible();
		} );

		test( 'RTL: the overlay anchors to the inline start and the toggle stays reachable', async () => {
			// Arrange
			await addMenu();
			await viewFrontend();
			await editor.page.setViewportSize( TABLET );
			await editor.page.evaluate( () => {
				document.documentElement.dir = 'rtl';
			} );

			const nav = getNav();

			// Act
			await getToggle( nav ).click();

			// Assert
			const navBox = ( await nav.boundingBox() )!;
			const itemsBox = ( await getItems( nav ).boundingBox() )!;

			expect( Math.abs( ( itemsBox.x + itemsBox.width ) - ( navBox.x + navBox.width ) ) ).toBeLessThan( 2 );
			await expect( getToggle( nav ) ).toBeVisible();
		} );

		test( 'A custom id on the menu items is what aria-controls points to', async () => {
			// Arrange
			const menuId = await addMenu();
			const itemsId = await getChildId( getMenuRoot( menuId ), 'e-menu-items' );

			await editor.applyElementSettings( itemsId, { _cssid: { $$type: 'string', value: 'my-items' } } );
			await viewFrontend();
			await editor.page.setViewportSize( TABLET );

			// Assert
			await expect( getItems( getNav() ) ).toHaveAttribute( 'id', 'my-items' );
			await expect( getToggle( getNav() ) ).toHaveAttribute( 'aria-controls', 'my-items' );
		} );

		test( 'The button keeps its accessible name when both toggle containers are emptied', async () => {
			// Arrange
			const menuId = await addMenu();
			const menu = getMenuRoot( menuId );

			for ( const type of [ 'e-menu-toggle-closed', 'e-menu-toggle-open' ] ) {
				const containerId = await getChildId( menu, type );

				await editor.page.evaluate( ( id ) => {
					const { $e, elementor } = window as unknown as EditorWindow;
					const parent = elementor.getContainer( id ) as { children: unknown[] };

					$e.run( 'document/elements/delete', { container: parent.children[ 0 ] } );
				}, containerId );
			}

			await viewFrontend();
			await editor.page.setViewportSize( TABLET );

			// Assert
			await expect( getToggle( getNav() ) ).toHaveAccessibleName( 'Open menu' );
		} );

		test( 'Two menus on one page toggle independently', async () => {
			// Arrange
			await addMenu();
			await addMenu();
			await viewFrontend();
			await editor.page.setViewportSize( TABLET );

			const first = getNav( 0 );
			const second = getNav( 1 );

			// Act
			await getToggle( first ).click();

			// Assert
			await expect( getItems( first ) ).toBeVisible();
			await expect( getItems( second ) ).toBeHidden();
			await expect( getItems( first ) ).not.toHaveAttribute( 'id', ( await getItems( second ).getAttribute( 'id' ) ) as string );
		} );

		test( 'The collapse follows the viewport, not a narrow container', async () => {
			// Arrange
			const menuId = await addMenu();
			const container = getMenuRoot( menuId ).locator( '..' );
			const containerId = await container.getAttribute( 'data-id' ) as string;

			await editor.applyElementSettings( containerId, {
				size: { $$type: 'size', value: { size: 300, unit: 'px' } },
			} );
			await viewFrontend();
			await editor.page.setViewportSize( DESKTOP );

			// Assert
			await expect( getToggle( getNav() ) ).toBeHidden();
			await expect( getItems( getNav() ) ).toBeVisible();
		} );

		test( 'A menu saved without a toggle keeps its links visible on small screens', async () => {
			// Arrange
			const menuId = await addMenu();
			const toggleId = await getChildId( getMenuRoot( menuId ), 'e-menu-toggle' );

			await editor.page.evaluate( ( id ) => {
				const { $e, elementor } = window as unknown as EditorWindow;
				const toggle = elementor.getContainer( id ) as { model: { set: ( key: string, value: boolean ) => void } };

				toggle.model.set( 'isLocked', false );
				$e.run( 'document/elements/delete', { container: toggle } );
			}, toggleId );

			await expect( getMenuRoot( menuId ).locator( '[data-element_type="e-menu-toggle"]' ) ).toHaveCount( 0 );

			// Act
			await viewFrontend();
			await editor.page.setViewportSize( TABLET );

			// Assert
			await expect( getNav().locator( 'button' ) ).toHaveCount( 0 );
			await expect( getItems( getNav() ) ).toBeVisible();
			await expect( getNav().locator( 'ul > li' ) ).toHaveText( [ 'Home', 'Products', 'About', 'Contact' ] );
		} );

		test( 'Without JavaScript the menu items stay visible and no toggle is shown', async ( { browser } ) => {
			// Arrange
			await addMenu();
			await viewFrontend();

			const url = editor.page.url();
			const noScriptContext = await browser.newContext( { javaScriptEnabled: false, viewport: TABLET } );
			const noScriptPage = await noScriptContext.newPage();

			// Act
			await noScriptPage.goto( url );

			// Assert
			const nav = noScriptPage.locator( 'nav.e-menu' );

			await expect( nav.locator( ':scope > ul' ) ).toBeVisible();
			await expect( nav.locator( ':scope > button[type="button"]' ) ).toBeHidden();

			await noScriptContext.close();
		} );

		test( 'Saving and reloading the editor does not duplicate the toggle', async () => {
			// Arrange
			const menuId = await addMenu();

			await editor.publishPage();

			// Act
			await editor.page.reload();
			await editor.waitForPanelToLoad();

			// Assert
			await expect( getMenuRoot( menuId ).locator( '[data-element_type="e-menu-toggle"]' ) ).toHaveCount( 1 );
		} );
	} );
} );
