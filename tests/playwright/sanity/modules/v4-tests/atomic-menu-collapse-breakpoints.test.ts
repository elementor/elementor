import { expect, type BrowserContext, type Locator } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import Breakpoints from '../../../assets/breakpoints';
import { wpCli } from '../../../assets/wp-cli';

type EditorWindow = {
	elementor: {
		getContainer: ( id: string ) => unknown;
	};
};

const ALL_OPTIONS = [
	'Mobile Portrait',
	'Mobile Landscape',
	'Tablet Portrait',
	'Tablet Landscape',
	'Laptop',
	'Desktop',
	'Widescreen',
	'None',
];

const DEFAULT_OPTIONS = [ 'Mobile Portrait', 'Tablet Portrait', 'Desktop', 'None' ];
const FRONTEND_VIEWPORTS = {
	mobile: { width: 400, height: 800 },
	tablet: { width: 900, height: 800 },
	laptop: { width: 1300, height: 800 },
	desktop: { width: 1800, height: 800 },
	widescreen: { width: 2600, height: 900 },
};

test.describe( 'Atomic Menu collapse breakpoint follows the site breakpoints @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let breakpoints: Breakpoints;

	const getMenuRoot = ( menuId: string ): Locator => {
		return editor.getPreviewFrame().locator( editor.getWidgetSelector( menuId ) );
	};

	const getToggle = ( nav: Locator ): Locator => nav.locator( ':scope > button[type="button"]' );
	const getItems = ( nav: Locator ): Locator => nav.locator( ':scope > ul' );

	const addMenu = async (): Promise<string> => {
		const menuId = await editor.v4Panel.addAtomicElementFromPanel( 'e-menu' );

		await expect( getMenuRoot( menuId ) ).toHaveJSProperty( 'tagName', 'NAV' );

		return menuId;
	};

	const setCollapseBreakpoint = async ( menuId: string, value: string ) => {
		await editor.applyElementSettings( menuId, { 'collapse-breakpoint': { $$type: 'string', value } } );
	};

	const getStoredCollapseBreakpoint = async ( menuId: string ) => {
		return await editor.page.evaluate( ( id ) => {
			const { elementor } = window as unknown as EditorWindow;
			const container = elementor.getContainer( id ) as { settings: { get: ( key: string ) => unknown } };

			return container.settings.get( 'collapse-breakpoint' );
		}, menuId );
	};

	const getCollapseField = async ( menuId: string ): Promise<Locator> => {
		await editor.selectElement( menuId );
		await editor.waitForPanelToLoad();
		await editor.v4Panel.openTab( 'general' );

		const field = editor.page.locator( '[data-type="settings-field"]' ).filter( { hasText: 'Collapse at breakpoint' } );

		if ( ! await field.isVisible() ) {
			await editor.page.getByText( 'Menu Settings', { exact: true } ).click();
		}

		await expect( field ).toBeVisible();

		return field;
	};

	const getControlOptions = async ( field: Locator ): Promise<string[]> => {
		await field.getByRole( 'combobox' ).click();

		const options = editor.page.getByRole( 'option' );

		await expect( options.first() ).toBeVisible();

		const names = ( await options.allTextContents() ).map( ( name ) => name.trim() );

		await editor.page.keyboard.press( 'Escape' );

		return names;
	};

	const reloadEditor = async () => {
		await editor.page.reload();
		await editor.page.waitForSelector( '#elementor-editor-wrapper' );
		await editor.getPreviewFrame().locator( 'body' ).waitFor();
	};

	const openFrontend = async ( viewport: { width: number; height: number } ) => {
		await editor.publishAndViewPage();
		await editor.page.setViewportSize( viewport );
	};

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements,e_nav_menu,additional_custom_breakpoints' );

		context = await browser.newContext();
		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		breakpoints = new Breakpoints( page );
		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async () => {
		await breakpoints.resetBreakpoints( editor );
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Without extra breakpoints the control offers Mobile, Tablet, Desktop and None', async () => {
		// Arrange
		const menuId = await addMenu();
		const field = await getCollapseField( menuId );

		// Assert
		expect( await getControlOptions( field ) ).toEqual( DEFAULT_OPTIONS );
	} );

	test( 'With every breakpoint active the control offers all of them, Desktop, Widescreen and None, in order', async () => {
		// Arrange
		await breakpoints.addAllBreakpoints( editor );

		const menuId = await addMenu();
		const field = await getCollapseField( menuId );

		// Assert
		expect( await getControlOptions( field ) ).toEqual( ALL_OPTIONS );
	} );

	test( 'Choosing an option in the control stores it and applies it on the canvas', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const field = await getCollapseField( menuId );

		// Act
		await field.getByRole( 'combobox' ).click();
		await editor.page.getByRole( 'option', { name: 'Desktop', exact: true } ).click();

		// Assert
		expect( await getStoredCollapseBreakpoint( menuId ) ).toEqual( { $$type: 'string', value: 'desktop' } );
		await expect( menu ).toHaveAttribute( 'data-e-collapse', 'desktop' );
		await expect( getToggle( menu ) ).toBeVisible();
		await expect( getItems( menu ) ).toBeHidden();
	} );

	test( 'Desktop collapses the menu at every width, on the canvas and the frontend', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );

		// Act
		await setCollapseBreakpoint( menuId, 'desktop' );

		// Assert - canvas
		await expect( getToggle( menu ) ).toBeVisible();
		await editor.changeResponsiveView( 'mobile' );
		await expect( getToggle( menu ) ).toBeVisible();

		// Assert - frontend
		await openFrontend( FRONTEND_VIEWPORTS.desktop );

		const nav = editor.page.locator( 'nav.e-menu' ).first();

		await expect( getToggle( nav ) ).toBeVisible();
		await expect( getItems( nav ) ).toBeHidden();
	} );

	test( 'None never collapses the menu, on the canvas and the frontend', async () => {
		// Arrange
		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );

		// Act
		await setCollapseBreakpoint( menuId, 'none' );
		await editor.changeResponsiveView( 'mobile' );

		// Assert - canvas
		await expect( getToggle( menu ) ).toBeHidden();
		await expect( getItems( menu ) ).toBeVisible();

		// Assert - frontend
		await openFrontend( FRONTEND_VIEWPORTS.mobile );

		const nav = editor.page.locator( 'nav.e-menu' ).first();

		await expect( getToggle( nav ) ).toBeHidden();
		await expect( getItems( nav ) ).toBeVisible();
	} );

	test( 'Laptop collapses at the laptop width and not above it, on the canvas and the frontend', async () => {
		// Arrange
		await breakpoints.addAllBreakpoints( editor );

		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );

		// Act
		await setCollapseBreakpoint( menuId, 'laptop' );

		// Assert - canvas
		await expect( getToggle( menu ) ).toBeHidden();
		await editor.changeResponsiveView( 'laptop' );
		await expect( getToggle( menu ) ).toBeVisible();
		await expect( getItems( menu ) ).toBeHidden();

		// Assert - frontend
		await openFrontend( FRONTEND_VIEWPORTS.laptop );

		const nav = editor.page.locator( 'nav.e-menu' ).first();

		await expect( getToggle( nav ) ).toBeVisible();

		await editor.page.setViewportSize( FRONTEND_VIEWPORTS.desktop );
		await expect( getToggle( nav ) ).toBeHidden();
		await expect( getItems( nav ) ).toBeVisible();
	} );

	test( 'With Widescreen active, Desktop collapses below it and Widescreen collapses at every width', async () => {
		// Arrange
		await breakpoints.addAllBreakpoints( editor );

		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );

		// Act
		await setCollapseBreakpoint( menuId, 'desktop' );

		// Assert - Desktop on the canvas
		await expect( getToggle( menu ) ).toBeVisible();
		await editor.changeResponsiveView( 'widescreen' );
		await expect( getToggle( menu ) ).toBeHidden();

		// Act
		await setCollapseBreakpoint( menuId, 'widescreen' );

		// Assert - Widescreen on the canvas
		await expect( getToggle( menu ) ).toBeVisible();
		await expect( getItems( menu ) ).toBeHidden();

		// Assert - frontend
		await openFrontend( FRONTEND_VIEWPORTS.widescreen );

		const nav = editor.page.locator( 'nav.e-menu' ).first();

		await expect( nav ).toHaveAttribute( 'data-e-collapse', 'widescreen' );
		await expect( getToggle( nav ) ).toBeVisible();
	} );

	test( 'A saved breakpoint the site no longer has resolves to the next smaller one in the control, the canvas and the frontend', async () => {
		// Arrange
		await breakpoints.addAllBreakpoints( editor );

		const menuId = await addMenu();

		await setCollapseBreakpoint( menuId, 'laptop' );
		await expect( getMenuRoot( menuId ) ).toHaveAttribute( 'data-e-collapse', 'laptop' );
		await editor.publishPage();

		// Act
		await breakpoints.resetBreakpoints( editor );
		await reloadEditor();

		// Assert - canvas
		await expect( getMenuRoot( menuId ) ).toHaveAttribute( 'data-e-collapse', 'tablet' );

		// Assert - control keeps the stored value but shows the resolved option
		expect( await getStoredCollapseBreakpoint( menuId ) ).toEqual( { $$type: 'string', value: 'laptop' } );

		const field = await getCollapseField( menuId );

		await expect( field.getByRole( 'combobox' ) ).toHaveText( 'Tablet Portrait' );
		expect( await getControlOptions( field ) ).toEqual( DEFAULT_OPTIONS );

		// Assert - frontend
		await openFrontend( FRONTEND_VIEWPORTS.tablet );
		await expect( editor.page.locator( 'nav.e-menu' ).first() ).toHaveAttribute( 'data-e-collapse', 'tablet' );
	} );

	test( 'A removed Widescreen resolves to Desktop and re-adding it restores the saved value', async () => {
		// Arrange
		await breakpoints.addAllBreakpoints( editor );

		const menuId = await addMenu();

		await setCollapseBreakpoint( menuId, 'widescreen' );
		await editor.publishPage();

		// Act - remove the breakpoints
		await breakpoints.resetBreakpoints( editor );
		await reloadEditor();

		// Assert
		await expect( getMenuRoot( menuId ) ).toHaveAttribute( 'data-e-collapse', 'desktop' );
		expect( await getStoredCollapseBreakpoint( menuId ) ).toEqual( { $$type: 'string', value: 'widescreen' } );

		// Act - add them back
		await breakpoints.addAllBreakpoints( editor );
		await reloadEditor();

		// Assert
		await expect( getMenuRoot( menuId ) ).toHaveAttribute( 'data-e-collapse', 'widescreen' );
	} );

	test( 'A menu saved at a removed breakpoint still collapses at the next smaller active one', async () => {
		// Arrange
		await breakpoints.addAllBreakpoints( editor );

		const menuId = await addMenu();

		await setCollapseBreakpoint( menuId, 'laptop' );
		await editor.publishPage();

		// Act
		await breakpoints.resetBreakpoints( editor );
		await reloadEditor();
		await editor.changeResponsiveView( 'tablet' );

		// Assert
		await expect( getToggle( getMenuRoot( menuId ) ) ).toBeVisible();
	} );

	test( 'Visual: the canvas at Laptop width with the menu collapsed at Laptop', async () => {
		// Arrange
		await breakpoints.addAllBreakpoints( editor );

		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );

		// Act
		await setCollapseBreakpoint( menuId, 'laptop' );
		await editor.changeResponsiveView( 'laptop' );
		await expect( getToggle( menu ) ).toBeVisible();
		await expect( getItems( menu ) ).toBeHidden();

		// Assert
		await expect( editor.page.locator( '#elementor-preview-iframe' ) ).toHaveScreenshot( 'menu-collapsed-laptop-canvas.png' );
	} );

	test( 'Visual: the canvas at Widescreen width, expanded with Desktop and collapsed with Widescreen', async () => {
		// Arrange
		await breakpoints.addAllBreakpoints( editor );

		const menuId = await addMenu();
		const menu = getMenuRoot( menuId );
		const preview = editor.page.locator( '#elementor-preview-iframe' );

		// Act
		await setCollapseBreakpoint( menuId, 'desktop' );
		await editor.changeResponsiveView( 'widescreen' );
		await expect( getToggle( menu ) ).toBeHidden();
		await expect( getItems( menu ) ).toBeVisible();

		// Assert
		await expect( preview ).toHaveScreenshot( 'menu-widescreen-expanded-with-desktop-canvas.png' );

		// Act
		await setCollapseBreakpoint( menuId, 'widescreen' );
		await expect( getToggle( menu ) ).toBeVisible();
		await expect( getItems( menu ) ).toBeHidden();

		// Assert
		await expect( preview ).toHaveScreenshot( 'menu-widescreen-collapsed-with-widescreen-canvas.png' );
	} );

	test( 'Visual: the frontend menu collapsed at Desktop, closed and opened', async () => {
		// Arrange
		const menuId = await addMenu();

		await setCollapseBreakpoint( menuId, 'desktop' );
		await openFrontend( FRONTEND_VIEWPORTS.desktop );

		const nav = editor.page.locator( 'nav.e-menu' ).first();

		await expect( getToggle( nav ) ).toBeVisible();

		const closedBox = await nav.boundingBox();
		const clip = { x: 0, y: Math.max( 0, ( closedBox?.y ?? 0 ) - 8 ), width: 600, height: 260 };

		// Assert - closed
		await expect( editor.page ).toHaveScreenshot( 'menu-collapsed-desktop-closed-frontend.png', { clip } );

		// Act
		await getToggle( nav ).click();
		await expect( getItems( nav ) ).toBeVisible();

		// Assert - opened
		await expect( editor.page ).toHaveScreenshot( 'menu-collapsed-desktop-open-frontend.png', { clip } );
	} );
} );
