import { expect, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import TopBarSelectors from '../../../selectors/top-bar-selectors';

const ICON_BUTTON_TYPE = 'e-icon-button';
const CONTENT_SLOT_TYPE = 'e-icon-button-content';
const ICON_SLOT_TYPE = 'e-icon-button-icon';
const PARAGRAPH_TYPE = 'e-paragraph';
const SVG_TYPE = 'e-svg';
const LEGACY_BUTTON_TYPE = 'e-button';

test.describe( 'Atomic Icon Button @v4-tests', () => {
	let context: BrowserContext;
	let page: Page;
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;

	const panelTile = ( elementType: string ): Locator =>
		page.locator( `#elementor-panel-page-elements [data-library-element-type="${ elementType }"]` );

	const previewLocator = ( selector: string ): Locator => editor.getPreviewFrame().locator( selector );

	const elementById = ( elementId: string ): Locator => previewLocator( `[data-id="${ elementId }"]` );

	const tagNameOf = async ( elementId: string ): Promise<string> =>
		elementById( elementId ).evaluate( ( element ) => element.tagName );

	const descendantId = async ( rootId: string, selector: string ): Promise<string> =>
		elementById( rootId ).locator( selector ).first().getAttribute( 'data-id' );

	/**
	 * Adds the Icon Button by clicking its tile in the Atomic Elements panel section — the same
	 * path a user takes, so the client-side default-children hydration runs.
	 */
	const addIconButtonFromPanel = async (): Promise<string> => {
		await editor.openElementsPanel();

		const tile = panelTile( ICON_BUTTON_TYPE );
		await tile.waitFor( { state: 'visible' } );
		await tile.click();

		const root = previewLocator( `[data-element_type="${ ICON_BUTTON_TYPE }"]` ).first();
		await root.waitFor( { state: 'visible' } );

		return await root.getAttribute( 'data-id' );
	};

	const openNavigator = async (): Promise<void> => {
		await editor.waitForPreviewFrame();

		const isOpen = await editor.getPreviewFrame().evaluate( () => elementor.navigator.isOpen() );

		if ( ! isOpen ) {
			await editor.clickTopBarItem( TopBarSelectors.navigator );
		}

		await page.locator( EditorSelectors.panels.navigator.wrapper ).waitFor();
	};

	const navigatorEntry = ( elementId: string ): Locator =>
		page.locator( EditorSelectors.panels.navigator.getElement( elementId ) );

	const showIconSwitch = (): Locator =>
		page.locator( 'span' ).filter( { hasText: 'Show Icon' } ).getByRole( 'checkbox' );

	const toggleLinkButton = (): Locator => page.locator( '[aria-label="Toggle link"]' );

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
			e_icon_button: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdmin?.resetExperiments();
		await context.close();
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
	} );

	// QA row 11.
	test( 'The Button tile lives in the Atomic Elements section and the legacy button tile is gone', async () => {
		// Act.
		await editor.openElementsPanel();

		const v4Section = page.locator( EditorSelectors.panels.elements.v4elements );

		// Assert.
		await expect( v4Section.locator( `[data-library-element-type="${ ICON_BUTTON_TYPE }"]` ) ).toBeVisible();
		await expect( v4Section.locator( `[data-library-element-type="${ ICON_BUTTON_TYPE }"]` ) ).toContainText( 'Button' );
		await expect( panelTile( LEGACY_BUTTON_TYPE ) ).toHaveCount( 0 );
	} );

	// QA row 1.
	test( 'Dropping the Button renders an icon and the "Click here" label inside a <button>', async () => {
		// Act.
		const rootId = await addIconButtonFromPanel();
		const root = elementById( rootId );

		// Assert.
		await expect.poll( () => tagNameOf( rootId ) ).toBe( 'BUTTON' );
		await expect( root.locator( `[data-element_type="${ CONTENT_SLOT_TYPE }"]` ) ).toHaveCount( 1 );
		await expect( root.locator( `[data-element_type="${ ICON_SLOT_TYPE }"]` ) ).toHaveCount( 1 );
		await expect( root.locator( `[data-widget_type="${ PARAGRAPH_TYPE }.default"]` ) ).toContainText( 'Click here' );
		await expect( root.locator( `[data-widget_type="${ SVG_TYPE }.default"] svg` ).first() ).toBeVisible();
	} );

	// QA row 5.
	test( 'The content slot label can be edited on the canvas', async () => {
		// Arrange.
		const rootId = await addIconButtonFromPanel();
		const root = elementById( rootId );
		const paragraphId = await descendantId( rootId, `[data-widget_type="${ PARAGRAPH_TYPE }.default"]` );

		// Act.
		const inlineEditor = await editor.triggerEditingElement( paragraphId );
		await inlineEditor.click();
		await page.keyboard.press( 'ControlOrMeta+A' );
		await page.keyboard.type( 'Buy now' );
		await page.keyboard.press( 'Escape' );

		// Assert.
		await expect( root.locator( `[data-widget_type="${ PARAGRAPH_TYPE }.default"]` ) ).toContainText( 'Buy now' );
	} );

	// QA rows 6 + 7.
	test( 'Setting a link switches the root to an <a>, clearing it switches back to a <button>', async () => {
		// Arrange.
		const rootId = await addIconButtonFromPanel();
		const root = elementById( rootId );
		const url = 'https://elementor.com/';

		await editor.selectElement( rootId );
		await editor.v4Panel.openTab( 'general' );

		// Act - set a link.
		const urlInput = page.getByPlaceholder( 'Type or paste your URL' );

		if ( ! await urlInput.isVisible() ) {
			await toggleLinkButton().click();
		}

		await urlInput.fill( url );

		// Assert - the root became an anchor.
		await expect.poll( () => tagNameOf( rootId ) ).toBe( 'A' );
		await expect( root ).toHaveAttribute( 'href', url );

		// Act - clear the link.
		await toggleLinkButton().click();

		// Assert - the root is a button again.
		await expect.poll( () => tagNameOf( rootId ) ).toBe( 'BUTTON' );
		await expect( root ).not.toHaveAttribute( 'href', url );
	} );

	// QA rows 8 + 9.
	test( 'Show Icon removes the icon from the canvas and the Structure panel, and restores it', async () => {
		// Arrange.
		const rootId = await addIconButtonFromPanel();
		const root = elementById( rootId );
		const iconSlotId = await descendantId( rootId, `[data-element_type="${ ICON_SLOT_TYPE }"]` );

		await openNavigator();
		await expect( navigatorEntry( iconSlotId ) ).toHaveCount( 1 );

		await editor.selectElement( rootId );
		await editor.v4Panel.openTab( 'general' );

		// Act - turn Show Icon off.
		await showIconSwitch().click();

		// Assert - gone from both the canvas and the Structure panel.
		await expect( root.locator( `[data-element_type="${ ICON_SLOT_TYPE }"]` ) ).toHaveCount( 0 );
		await expect( navigatorEntry( iconSlotId ) ).toHaveCount( 0 );

		// Act - turn Show Icon back on.
		await showIconSwitch().click();

		// Assert - restored in both.
		await expect( root.locator( `[data-element_type="${ ICON_SLOT_TYPE }"]` ) ).toHaveCount( 1 );
		await expect( root.locator( `[data-widget_type="${ SVG_TYPE }.default"] svg` ).first() ).toBeVisible();

		const restoredIconSlotId = await descendantId( rootId, `[data-element_type="${ ICON_SLOT_TYPE }"]` );
		await expect( navigatorEntry( restoredIconSlotId ) ).toHaveCount( 1 );
	} );
} );
