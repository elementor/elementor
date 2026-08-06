import { expect, type Locator, type BrowserContext } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { wpCli } from '../../../assets/wp-cli';

/**
 * Written, not executed — this environment has no browser/live editor session (see this plan's
 * task-12-report.md for the full verification statement). Structure, selectors and conventions
 * are grounded in `atomic-tabs-editor-interactions.test.ts` (read in full) and
 * `tests/playwright/pages/atomic-elements-panel/v4-elements-panel.ts`, plus the shared Repeater
 * component (`packages/packages/libs/editor-controls/src/components/repeater/repeater.tsx`) that
 * the Tabs items control and the Accordion items control both use — so button labels ("Add item",
 * "Remove", "Duplicate") and the `ul.MuiList-root > li` / `.class-item-sortable-trigger` drag
 * handle are the same real DOM the Tabs test already exercises, not invented.
 *
 * `e_accordion` is a hidden DEV experiment (`modules/atomic-widgets/module.php`), so it cannot be
 * toggled from the Settings UI (`WpAdminPage.setExperiments()` targets `#e-experiment-<name>`,
 * which never renders for a hidden feature) — activated via `wp-cli` instead, same as the Tabs
 * suite activates `e_atomic_elements`.
 */
test.describe( 'Atomic Accordion Editor Interactions @atomic-widgets', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	const accordionType = 'e-accordion';
	const itemType = 'e-accordion-item';
	const headType = 'e-accordion-item-head';
	const titleType = 'e-accordion-item-title';
	const iconType = 'e-accordion-item-icon';
	const contentType = 'e-accordion-item-content';
	const paragraphType = 'e-paragraph';
	const accordionItemsLabel = 'Accordion Items';

	const getAccordionRoot = ( accordionId: string ): Locator => {
		return editor.getPreviewFrame().locator( editor.getWidgetSelector( accordionId ) );
	};

	const getItems = ( root: Locator ): Locator => {
		return root.locator( `.e-con[data-element_type="${ itemType }"]` );
	};

	const getHeads = ( root: Locator ): Locator => {
		return root.locator( `.e-con[data-element_type="${ headType }"]` );
	};

	const getIcons = ( root: Locator ): Locator => {
		return root.locator( `.e-con[data-element_type="${ iconType }"]` );
	};

	const getContents = ( root: Locator ): Locator => {
		return root.locator( `.e-con[data-element_type="${ contentType }"]` );
	};

	const getIdsByType = async ( root: Locator, elementType: string ): Promise<string[]> => {
		return await root.evaluate( ( node, type ) => {
			return Array.from( node.querySelectorAll( `.e-con[data-element_type="${ type }"]` ) )
				.map( ( element ) => element.getAttribute( 'data-id' ) )
				.filter( Boolean );
		}, elementType );
	};

	const openAccordionItemsControl = async () => {
		await editor.v4Panel.openTab( 'general' );

		const field = editor.page.locator( '[data-type="settings-field"]' )
			.filter( { hasText: accordionItemsLabel } );

		await expect( field ).toBeVisible();

		return field;
	};

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		await wpCli( 'wp elementor experiments activate e_accordion' );

		context = await browser.newContext();
		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Accordion panel tile shows the accordion eicon', async () => {
		// Arrange
		await editor.openElementsPanel();
		const tile = editor.page.locator( '#elementor-panel-category-v4-elements .elementor-panel-category-items :text-is("Accordion")' );

		// Assert
		await expect( tile ).toBeVisible();
		const tileIcon = tile.locator( 'xpath=ancestor::*[self::div or self::li][1]' ).locator( 'i, svg' ).first();
		await expect( tileIcon ).toHaveClass( /eicon-accordion/ );
	} );

	test( 'Drop from panel creates two items, first expanded, with title, icon and content', async () => {
		// Act
		await editor.openElementsPanel();
		const tile = editor.page.locator( '#elementor-panel-category-v4-elements .elementor-panel-category-items :text-is("Accordion")' );
		await tile.click();

		const root = editor.getPreviewFrame().locator( `[data-element_type="${ accordionType }"]` ).first();
		await root.waitFor( { state: 'visible' } );

		// Assert
		const items = getItems( root );
		await expect( items ).toHaveCount( 2 );

		const details = root.locator( 'details' );
		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );
		await expect( details.nth( 1 ) ).not.toHaveAttribute( 'open', '' );

		await expect( root.locator( `[data-element_type="${ titleType }"]` ) ).toHaveCount( 2 );
		await expect( getIcons( root ) ).toHaveCount( 2 );
		await expect( getContents( root ) ).toHaveCount( 2 );

		await expect( root.locator( `[data-widget_type="${ paragraphType }.default"]` ).first() ).toContainText( 'Accordion Item 1' );
	} );

	test( 'Add item via repeater creates a self-contained item with head, title, icon and content', async () => {
		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		await editor.selectElement( accordionId );
		await editor.waitForPanelToLoad();

		const field = await openAccordionItemsControl();
		const initialItemIds = await getIdsByType( root, itemType );

		// Act
		await field.getByRole( 'button', { name: 'Add item' } ).click();

		// Assert
		await expect.poll( () => getIdsByType( root, itemType ) ).toHaveLength( initialItemIds.length + 1 );

		const newItemIds = await getIdsByType( root, itemType );
		expect( newItemIds ).toEqual( expect.arrayContaining( initialItemIds ) );

		const lastItem = getItems( root ).nth( newItemIds.length - 1 );
		await expect( lastItem.locator( `[data-element_type="${ headType }"]` ) ).toHaveCount( 1 );
		await expect( lastItem.locator( `[data-element_type="${ titleType }"]` ) ).toHaveCount( 1 );
		await expect( lastItem.locator( `[data-element_type="${ iconType }"]` ) ).toHaveCount( 1 );
		await expect( lastItem.locator( `[data-element_type="${ contentType }"]` ) ).toHaveCount( 1 );
	} );

	test( 'Remove item via repeater; remove affordance hidden once one item remains', async () => {
		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		await editor.selectElement( accordionId );
		await editor.waitForPanelToLoad();

		const field = await openAccordionItemsControl();
		const initialItemIds = await getIdsByType( root, itemType );
		const listItems = field.locator( 'ul.MuiList-root > li' );

		// Act — remove the second (default accordion ships with exactly two items).
		await listItems.nth( 1 ).hover();
		const removeButton = listItems.nth( 1 ).getByRole( 'button', { name: 'Remove' } );
		await expect( removeButton ).toBeVisible();
		await removeButton.click();

		// Assert
		await expect.poll( () => getIdsByType( root, itemType ) ).toHaveLength( initialItemIds.length - 1 );
		const remainingItemIds = await getIdsByType( root, itemType );
		expect( remainingItemIds ).not.toContain( initialItemIds[ 1 ] );

		// The remove affordance disappears once a single item is left.
		await listItems.first().hover();
		const lastRemoveButton = listItems.first().getByRole( 'button', { name: 'Remove' } );
		await expect( lastRemoveButton ).toBeHidden();
	} );

	test( 'Duplicate item via repeater', async () => {
		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		await editor.selectElement( accordionId );
		await editor.waitForPanelToLoad();

		const field = await openAccordionItemsControl();
		const initialItemIds = await getIdsByType( root, itemType );
		const listItems = field.locator( 'ul.MuiList-root > li' );

		// Act
		await listItems.first().hover();
		const duplicateButton = listItems.first().getByRole( 'button', { name: 'Duplicate' } );
		await expect( duplicateButton ).toBeVisible();
		await duplicateButton.click();

		// Assert
		await expect.poll( () => getIdsByType( root, itemType ) ).toHaveLength( initialItemIds.length + 1 );
		const newItemIds = await getIdsByType( root, itemType );
		expect( new Set( newItemIds ).size ).toBe( newItemIds.length );
	} );

	test( 'Reorder items via repeater drag handle', async () => {
		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		await editor.selectElement( accordionId );
		await editor.waitForPanelToLoad();

		const field = await openAccordionItemsControl();
		const initialItemIds = await getIdsByType( root, itemType );

		const listItems = field.locator( 'ul.MuiList-root > li' );
		const firstItem = listItems.first();
		const lastItem = listItems.last();
		const firstDragHandle = firstItem.locator( '.class-item-sortable-trigger' );

		// Act
		await firstItem.hover();
		await firstDragHandle.dragTo( lastItem );

		// Assert
		const expectedOrder = [ ...initialItemIds.slice( 1 ), initialItemIds[ 0 ] ];
		await expect.poll( () => getIdsByType( root, itemType ) ).toEqual( expectedOrder );
	} );

	test( 'Renaming an item updates only the Structure panel title, not the canvas', async () => {
		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		const itemIds = await getIdsByType( root, itemType );
		const firstItemId = itemIds[ 0 ];

		const canvasTitleBefore = await root.locator( `[data-widget_type="${ paragraphType }.default"]` ).first().textContent();

		// Act — open the Structure panel and rename the item's node there.
		await editor.page.locator( '#elementor-editor-wrapper-v2 button[value="Structure"]' ).click();
		const navigatorItem = editor.page.locator( `#elementor-navigator .elementor-navigator__element[data-id="${ firstItemId }"]` );
		await navigatorItem.waitFor();

		const titleField = navigatorItem.locator( '.elementor-navigator__element__title__text' ).first();
		await titleField.dblclick();
		await editor.page.keyboard.press( 'Control+A' );
		await editor.page.keyboard.type( 'Renamed Item' );
		await editor.page.keyboard.press( 'Enter' );

		// Assert — the Structure panel reflects the rename …
		await expect( navigatorItem ).toContainText( 'Renamed Item' );

		// … but the canvas paragraph text (the actual rendered content) is untouched.
		const canvasTitleAfter = await root.locator( `[data-widget_type="${ paragraphType }.default"]` ).first().textContent();
		expect( canvasTitleAfter ).toBe( canvasTitleBefore );
	} );

	test( 'Default State: all_collapsed renders no open item', async () => {
		// Arrange & Act
		const accordionId = await editor.addElement(
			{ elType: accordionType, settings: { default_state: 'all_collapsed' } },
			'document',
		);
		const root = getAccordionRoot( accordionId );

		// Assert
		const details = root.locator( 'details' );
		await expect( details ).toHaveCount( 2 );
		await expect( details.nth( 0 ) ).not.toHaveAttribute( 'open', '' );
		await expect( details.nth( 1 ) ).not.toHaveAttribute( 'open', '' );
	} );

	test( 'Default State: first_expanded opens only the first item', async () => {
		// Arrange & Act
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );

		// Assert
		const details = root.locator( 'details' );
		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );
		await expect( details.nth( 1 ) ).not.toHaveAttribute( 'open', '' );
	} );

	test( 'Max Expanded One: opening one item closes the previously open one', async () => {
		// Arrange — first_expanded + one is the schema default: item 0 starts open.
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		const heads = getHeads( root );
		const details = root.locator( 'details' );

		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );

		// Act — native <details name="..."> exclusivity: opening the second item's <summary>
		// closes the first via the browser itself, no JS involved.
		await heads.nth( 1 ).click();

		// Assert
		await expect( details.nth( 1 ) ).toHaveAttribute( 'open', '' );
		await expect( details.nth( 0 ) ).not.toHaveAttribute( 'open', '' );
	} );

	test( 'Max Expanded Multiple: several items can be open at once', async () => {
		// Arrange
		const accordionId = await editor.addElement(
			{ elType: accordionType, settings: { max_expanded: 'multiple' } },
			'document',
		);
		const root = getAccordionRoot( accordionId );
		const heads = getHeads( root );
		const details = root.locator( 'details' );

		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );

		// Act
		await heads.nth( 1 ).click();

		// Assert — both stay open, unlike the "one" case above.
		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );
		await expect( details.nth( 1 ) ).toHaveAttribute( 'open', '' );
	} );

	test( 'Show Icon OFF removes the icon from the DOM and the Structure panel; ON restores it', async () => {
		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		await editor.selectElement( accordionId );
		await editor.waitForPanelToLoad();
		await editor.v4Panel.openTab( 'general' );

		await expect( getIcons( root ) ).toHaveCount( 2 );

		const showIconField = editor.page.locator( 'span' ).filter( { hasText: 'Show Icon' } );

		// Act — OFF
		await showIconField.getByRole( 'checkbox' ).click();

		// Assert — gone from the canvas …
		await expect( getIcons( root ) ).toHaveCount( 0 );

		// … and gone from the Structure panel too. Every sub-element gets its own navigator row
		// titled from its `editor_settings.title` (`assets/dev/js/editor/regions/navigator/element.js`);
		// the icon slot is titled "Icon" (`Atomic_Accordion_Item_Head::define_default_children()`),
		// so its absence from the whole tree is a reliable proxy for "no icon node in Structure".
		await editor.page.locator( '#elementor-editor-wrapper-v2 button[value="Structure"]' ).click();
		const navigatorPanel = editor.page.locator( '#elementor-navigator' );
		await navigatorPanel.waitFor();
		await expect( navigatorPanel.locator( '.elementor-navigator__element__title__text', { hasText: 'Icon' } ) ).toHaveCount( 0 );

		// Act — ON again.
		await showIconField.getByRole( 'checkbox' ).click();

		// Assert — restored.
		await expect( getIcons( root ) ).toHaveCount( 2 );
	} );

	test( 'Icon rotates between the closed and open state', async () => {
		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		const heads = getHeads( root );
		const icons = getIcons( root );

		const closedTransform = await icons.nth( 1 ).evaluate( ( el ) => getComputedStyle( el ).transform );

		// Act
		await heads.nth( 1 ).click();

		// Assert
		const openTransform = await icons.nth( 1 ).evaluate( ( el ) => getComputedStyle( el ).transform );
		expect( openTransform ).not.toBe( closedTransform );
	} );

	test( 'Nested accordion inside a content slot toggles independently of its parent', async () => {
		// Arrange — capture the outer accordion's own item ids before the inner accordion exists,
		// so later descendant queries can't accidentally pick up the nested accordion's own items.
		const outerId = await editor.addElement( { elType: accordionType }, 'document' );
		const outerRoot = getAccordionRoot( outerId );
		const outerItemIds = await getIdsByType( outerRoot, itemType );
		const outerContentIds = await getIdsByType( outerRoot, contentType );

		const outerFirstItemDetails = editor.getPreviewFrame().locator( `[data-id="${ outerItemIds[ 0 ] }"]` );
		await expect( outerFirstItemDetails ).toHaveAttribute( 'open', '' );

		await editor.addElement( { elType: accordionType }, outerContentIds[ 0 ] );

		const innerRoot = outerRoot.locator( `[data-element_type="${ accordionType }"]` );
		await expect( innerRoot ).toHaveCount( 1 );

		const innerDetails = innerRoot.locator( `.e-con[data-element_type="${ itemType }"]` );
		await expect( innerDetails ).toHaveCount( 2 );

		// Act — open the inner accordion's second item.
		await getHeads( innerRoot ).nth( 1 ).click();

		// Assert — the inner accordion's own exclusivity applies …
		await expect( innerDetails.nth( 1 ) ).toHaveAttribute( 'open', '' );
		await expect( innerDetails.nth( 0 ) ).not.toHaveAttribute( 'open', '' );

		// … and the outer accordion's own open item is unaffected.
		await expect( outerFirstItemDetails ).toHaveAttribute( 'open', '' );
	} );

	test( 'Two accordions on the same page toggle independently', async () => {
		// Arrange
		const firstId = await editor.addElement( { elType: accordionType }, 'document' );
		const secondId = await editor.addElement( { elType: accordionType }, 'document' );
		const firstRoot = getAccordionRoot( firstId );
		const secondRoot = getAccordionRoot( secondId );

		await expect( firstRoot.locator( 'details' ).nth( 0 ) ).toHaveAttribute( 'open', '' );
		await expect( secondRoot.locator( 'details' ).nth( 0 ) ).toHaveAttribute( 'open', '' );

		// Act — open the second item of the first accordion only.
		await getHeads( firstRoot ).nth( 1 ).click();

		// Assert — first accordion's exclusivity kicked in, second accordion is untouched.
		await expect( firstRoot.locator( 'details' ).nth( 1 ) ).toHaveAttribute( 'open', '' );
		await expect( firstRoot.locator( 'details' ).nth( 0 ) ).not.toHaveAttribute( 'open', '' );
		await expect( secondRoot.locator( 'details' ).nth( 0 ) ).toHaveAttribute( 'open', '' );
		await expect( secondRoot.locator( 'details' ).nth( 1 ) ).not.toHaveAttribute( 'open', '' );
	} );

	test( 'Keyboard Tab/Enter/Space toggle the focused item', async () => {
		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		const heads = getHeads( root );
		const details = root.locator( 'details' );

		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );

		// Act — Tab to the second summary and activate it with Enter.
		await heads.nth( 0 ).focus();
		await editor.page.keyboard.press( 'Tab' );
		await editor.page.keyboard.press( 'Enter' );

		// Assert
		await expect( details.nth( 1 ) ).toHaveAttribute( 'open', '' );

		// Act — Space closes it again.
		await editor.page.keyboard.press( 'Space' );

		// Assert
		await expect( details.nth( 1 ) ).not.toHaveAttribute( 'open', '' );
	} );

	test( 'Icon is aria-hidden (screen readers rely on native <details>/<summary> state)', async () => {
		// Arrange & Act
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );

		// Assert
		const icons = getIcons( root );
		await expect( icons ).toHaveCount( 2 );

		for ( let i = 0; i < await icons.count(); i++ ) {
			await expect( icons.nth( i ) ).toHaveAttribute( 'aria-hidden', 'true' );
		}
	} );

	test( 'Renders correctly under RTL direction', async () => {
		// Arrange & Act
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );

		await editor.getPreviewFrame().evaluate( () => {
			document.documentElement.setAttribute( 'dir', 'rtl' );
		} );

		// Assert — the accordion still renders its two items, first open, header still clickable.
		await expect( getItems( root ) ).toHaveCount( 2 );
		await expect( root.locator( 'details' ).nth( 0 ) ).toHaveAttribute( 'open', '' );

		const heads = getHeads( root );
		await heads.nth( 1 ).click();
		await expect( root.locator( 'details' ).nth( 1 ) ).toHaveAttribute( 'open', '' );
	} );

	test( 'Title HTML Tag setting is reflected on the frontend', async () => {
		// Arrange
		await editor.addElement( { elType: accordionType, settings: { title_tag: 'h3' } }, 'document' );

		// Act
		await editor.publishAndViewPage();

		// Assert
		const titleHeading = editor.page.locator( `h3[data-element_type="${ titleType }"]` ).first();
		await expect( titleHeading ).toBeVisible();
		await expect( titleHeading ).toContainText( 'Accordion Item 1' );
	} );

	test( 'FAQ Schema ON emits FAQPage JSON-LD on the frontend; OFF emits none', async () => {
		// Arrange & Act — ON.
		await editor.addElement( { elType: accordionType, settings: { faq_schema: true } }, 'document' );
		await editor.publishAndViewPage();

		// Assert
		const html = await editor.page.content();
		expect( html ).toContain( 'application/ld+json' );
		expect( html ).toContain( '"@type":"FAQPage"' );
		expect( html ).toContain( 'Accordion Item 1' );
		expect( html ).toContain( 'Content goes here...' );

		// Arrange & Act — OFF, on a fresh page.
		editor = await wpAdmin.openNewPage();
		await editor.addElement( { elType: accordionType, settings: { faq_schema: false } }, 'document' );
		await editor.publishAndViewPage();

		const htmlOff = await editor.page.content();
		expect( htmlOff ).not.toContain( 'application/ld+json' );
	} );
} );
