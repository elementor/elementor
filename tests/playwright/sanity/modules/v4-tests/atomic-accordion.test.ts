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
	const headerType = 'e-accordion-item-header';
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

	const getHeaders = ( root: Locator ): Locator => {
		return root.locator( `.e-con[data-element_type="${ headerType }"]` );
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

	test( 'Add item via repeater creates a self-contained item with header, title, icon and content', async () => {
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
		await expect( lastItem.locator( `[data-element_type="${ headerType }"]` ) ).toHaveCount( 1 );
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
		const headers = getHeaders( root );
		const details = root.locator( 'details' );

		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );

		// Act — native <details name="..."> exclusivity: opening the second item's <summary>
		// closes the first via the browser itself, no JS involved.
		await headers.nth( 1 ).click();

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
		const headers = getHeaders( root );
		const details = root.locator( 'details' );

		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );

		// Act
		await headers.nth( 1 ).click();

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
		// the icon slot is titled "Icon" (`Atomic_Accordion_Item_Header::define_default_children()`),
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

	test( 'Icon stays flush with the header trailing edge, including after the SVG is replaced', async () => {
		// Two rules together produce this, and each fails in a way the other cannot catch:
		// `justify-content: flex-end` on the slot's base style
		// (`Atomic_Accordion_Item_Icon::define_base_styles()`) and the height-only icon sizing in
		// `module.php::add_inline_styles()`. The slot is 200px wide — far wider than the icon — so that
		// it stays a usable drop target once the default SVG is deleted; if the icon were stretched to
		// that width again, its *element box* would still end flush with the slot while
		// `preserveAspectRatio` centred the glyph ~90px short of the edge. Hence the width assertion
		// alongside the edge one. The second half deletes the default e-svg and drops a fresh one in,
		// because alignment declared on the child instead of the slot would not survive that.
		const trailingEdgeGeometry = async ( slot: Locator ) => {
			return await slot.evaluate( ( slotEl ) => {
				// The <svg> itself is rotated 180deg while the item is open, which inflates its
				// axis-aligned box mid-transition; its wrapper is what the sizing rule targets and it
				// never rotates.
				const icon = slotEl.querySelector( '.e-svg-base' ) ?? slotEl.firstElementChild;
				const header = slotEl.closest( '[data-element_type="e-accordion-item-header"]' );
				const headerStyle = getComputedStyle( header );
				const headerContentRight = header.getBoundingClientRect().right -
					parseFloat( headerStyle.paddingRight ) -
					parseFloat( headerStyle.borderRightWidth );
				const slotRect = slotEl.getBoundingClientRect();
				const iconRect = icon.getBoundingClientRect();

				return {
					gapToSlotEdge: slotRect.right - iconRect.right,
					gapToHeaderContentEdge: headerContentRight - iconRect.right,
					iconWidth: iconRect.width,
					iconHeight: iconRect.height,
					slotWidth: slotRect.width,
				};
			} );
		};

		// Arrange
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		const iconSlot = getIcons( root ).first();

		await expect( iconSlot ).toBeVisible();
		await expect( iconSlot ).toHaveCSS( 'justify-content', 'flex-end' );

		// Assert — the default SVG is square, sized from the slot's height, and ends exactly where the
		// header's content box does.
		const withDefaultSvg = await trailingEdgeGeometry( iconSlot );

		expect( withDefaultSvg.gapToSlotEdge ).toBeLessThanOrEqual( 1 );
		expect( withDefaultSvg.gapToHeaderContentEdge ).toBeLessThanOrEqual( 1 );
		expect( withDefaultSvg.iconWidth ).toBeLessThan( withDefaultSvg.slotWidth );
		expect( withDefaultSvg.iconWidth ).toBeCloseTo( withDefaultSvg.iconHeight, 0 );

		// Act — delete the default SVG and drop a fresh one into the same slot.
		const iconSlotId = ( await getIdsByType( root, iconType ) )[ 0 ];
		const defaultSvgId = await iconSlot.evaluate( ( el ) => {
			return el.querySelector( '[data-element_type="widget"]' )?.getAttribute( 'data-id' );
		} );

		expect( defaultSvgId ).toBeTruthy();

		await editor.removeElement( defaultSvgId! );
		await expect( iconSlot.locator( 'svg' ) ).toHaveCount( 0 );

		await editor.addWidget( { widgetType: 'e-svg', container: iconSlotId } );
		await expect( iconSlot.locator( 'svg' ) ).toHaveCount( 1 );

		// Assert — the replacement lands in exactly the same place.
		const withReplacedSvg = await trailingEdgeGeometry( iconSlot );

		expect( withReplacedSvg.gapToSlotEdge ).toBeLessThanOrEqual( 1 );
		expect( withReplacedSvg.gapToHeaderContentEdge ).toBeLessThanOrEqual( 1 );
		expect( withReplacedSvg.iconWidth ).toBeLessThan( withReplacedSvg.slotWidth );
	} );

	test( 'Icon and content animate via CSS transition on open/close, not JavaScript', async () => {
		// Grounded directly in `modules/atomic-widgets/module.php::add_inline_styles()`, the only
		// place this animation is defined (there is no frontend JS handler for the toggle — the
		// element ships none, by design):
		//   '.e-accordion-item-icon-base svg { transition: transform .3s ease; }'
		//   '.e-accordion-item-base[open] > summary .e-accordion-item-icon-base svg { transform: rotate(180deg); }'
		//   '.e-accordion-item-base::details-content { block-size: 0; overflow: hidden;
		//      transition: block-size .3s ease, content-visibility .3s ease allow-discrete; }'
		//   '.e-accordion-item-base[open]::details-content { block-size: auto; }'
		// The `::details-content` rules target a pseudo-element with graceful degradation by design
		// (an unsupporting browser drops the whole rule and keeps the native instant toggle — see the
		// long comment above that CSS), so querying it via `getComputedStyle(el, '::details-content')`
		// is not asserted here: whether that call even returns non-default values is itself dependent
		// on the exact Chromium build Playwright bundles, which this environment cannot execute to
		// confirm. The icon `<svg>` is a real, always-present DOM node, so its transition is asserted
		// precisely instead; the content panel's own animation is covered by the coarser
		// non-zero-height assertion below (an approach a human reviewer of this suite pre-approved as
		// sufficient for the pseudo-element case).
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		const headers = getHeaders( root );
		const icons = getIcons( root );
		const details = root.locator( 'details' );
		const secondContent = getContents( root ).nth( 1 );

		const closedIconStyle = await icons.nth( 1 ).locator( 'svg' ).evaluate( ( el ) => {
			const style = getComputedStyle( el );
			return { transitionProperty: style.transitionProperty, transitionDuration: style.transitionDuration, transform: style.transform };
		} );

		// The transition is declared, not merely an instant snap — this is what makes it an
		// "animation" rather than a plain visibility toggle.
		expect( closedIconStyle.transitionProperty ).toContain( 'transform' );
		expect( closedIconStyle.transitionDuration ).toBe( '0.3s' );
		// No `[open]` ancestor yet, so no rotation rule applies.
		expect( closedIconStyle.transform ).toBe( 'none' );

		// Act
		await headers.nth( 1 ).click();
		await expect( details.nth( 1 ) ).toHaveAttribute( 'open', '' );

		// Assert — exactly `rotate(180deg)`, computed as the 2D rotation matrix
		// `matrix(cos180, sin180, -sin180, cos180, 0, 0)` = `matrix(-1, 0, 0, -1, 0, 0)`. Parsed
		// numerically (rather than matched as a literal string) to stay robust to browser-specific
		// formatting of the zero components.
		const openTransform = await icons.nth( 1 ).locator( 'svg' ).evaluate( ( el ) => getComputedStyle( el ).transform );
		const matrixValues = openTransform.match( /matrix\(([^)]+)\)/ )?.[ 1 ].split( ',' ).map( Number );

		expect( matrixValues ).toBeDefined();
		expect( matrixValues![ 0 ] ).toBeCloseTo( -1, 5 ); // Cos(180deg)
		expect( matrixValues![ 1 ] ).toBeCloseTo( 0, 5 ); // Sin(180deg)
		expect( matrixValues![ 2 ] ).toBeCloseTo( 0, 5 ); // -sin(180deg)
		expect( matrixValues![ 3 ] ).toBeCloseTo( -1, 5 ); // Cos(180deg)

		// Coarse content-animation check (reviewer-approved fallback for the `::details-content`
		// pseudo-element case above): the previously-collapsed content panel now renders at a real,
		// non-zero height once the transition settles.
		await expect.poll( async () => secondContent.evaluate( ( el ) => el.getBoundingClientRect().height ) )
			.toBeGreaterThan( 0 );
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
		await getHeaders( innerRoot ).nth( 1 ).click();

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
		await getHeaders( firstRoot ).nth( 1 ).click();

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
		const headers = getHeaders( root );
		const details = root.locator( 'details' );

		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );

		// Act — Tab to the second summary and activate it with Enter.
		await headers.nth( 0 ).focus();
		await editor.page.keyboard.press( 'Tab' );
		await editor.page.keyboard.press( 'Enter' );

		// Assert
		await expect( details.nth( 1 ) ).toHaveAttribute( 'open', '' );

		// Act — Space closes it again.
		await editor.page.keyboard.press( 'Space' );

		// Assert
		await expect( details.nth( 1 ) ).not.toHaveAttribute( 'open', '' );
	} );

	test( 'Icon is decorative (aria-hidden), not part of the accessible name', async () => {
		// Note on scope: this only covers the icon's own `aria-hidden`. Open/closed *state* exposure
		// to assistive tech is a separate concern, covered by the next test.
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

	test( 'Open/closed state is exposed to the accessibility tree via native <details>/<summary> semantics', async () => {
		// No `aria-expanded` attribute is ever written to the DOM — deliberately: the whole point of
		// building on native `<details>`/`<summary>` (per `$widget_description` on
		// `Atomic_Accordion_Item`/`Atomic_Accordion`) is that the browser derives accessible
		// open/closed state and the implicit "button" role from the native elements/`[open]`
		// attribute itself, with no ARIA authored by us. `Locator.ariaSnapshot()` (confirmed present
		// in this repo's Playwright version — `node_modules/playwright-core/types/types.d.ts`; the
		// older `page.accessibility.snapshot()` API some other Playwright codebases use is NOT present
		// in this version's type declarations, and is not used here) reads exactly that browser-
		// computed accessibility tree, so it is what this test asserts against instead of any HTML
		// attribute.
		//
		// This assertion could not be executed here (no browser in this environment - see this task's
		// report) — the two checks below are deliberately loose (a stable "button" role + the
		// item's own accessible name, and "the snapshot text changes across the open/close toggle")
		// rather than pinned to the exact bracketed-state token Playwright's ARIA snapshot serializer
		// emits for a boolean `expanded` state, because that exact formatting was not something this
		// task could confirm by execution.
		const accordionId = await editor.addElement( { elType: accordionType }, 'document' );
		const root = getAccordionRoot( accordionId );
		const headers = getHeaders( root );
		const details = root.locator( 'details' );

		await expect( details.nth( 0 ) ).toHaveAttribute( 'open', '' );
		const openSnapshot = await headers.nth( 0 ).ariaSnapshot();

		expect( openSnapshot.toLowerCase() ).toContain( 'button' );
		expect( openSnapshot ).toContain( 'Accordion Item 1' );

		// Act — close the first item by opening the second (max_expanded defaults to "one").
		await headers.nth( 1 ).click();
		await expect( details.nth( 0 ) ).not.toHaveAttribute( 'open', '' );

		// Assert — the accessibility tree reflects the state change; the browser derives this from
		// `[open]` alone, nothing here writes `aria-expanded` by hand.
		const closedSnapshot = await headers.nth( 0 ).ariaSnapshot();
		expect( closedSnapshot ).not.toBe( openSnapshot );
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

		const headers = getHeaders( root );
		await headers.nth( 1 ).click();
		await expect( root.locator( 'details' ).nth( 1 ) ).toHaveAttribute( 'open', '' );
	} );

	// NOTE: The former `'Title HTML Tag setting is reflected on the frontend'` test asserted a
	// root-level `title_tag` setting that no longer exists — an earlier task in this fix wave
	// removed the `title_tag` root prop entirely (see `atomic-accordion-item-title.php`: "This
	// element no longer has a settable `tag` prop of its own"). The tag control now lives solely on
	// the title's inner Paragraph child (`Atomic_Paragraph`'s own `tag` prop/control, constrained to
	// `p`/`span`, not heading tags). That Paragraph `tag` control is generic — not accordion-specific
	// — and this suite has no existing e2e coverage of it anywhere (checked across
	// `tests/playwright/sanity/modules/v4-tests/`), so a replacement test for it belongs with the
	// Paragraph element's own suite, not the accordion one; adding one here would be out of scope for
	// this fix wave. The test is removed rather than replaced.

	test( 'FAQ Schema ON emits FAQPage JSON-LD on the frontend; OFF emits none', async () => {
		// Arrange — default accordion items ship with an empty content area (an earlier task in this
		// fix wave removed the default content-area paragraph child), so `build_faq_schema_json()` /
		// `get_faq_item_text()` (`atomic-accordion.php`) would skip every item as empty and emit no
		// `<script>` tag at all. Mirrors the equivalent PHPUnit fix's
		// `build_tree_with_explicit_content()` helper: give each item's content area real text before
		// asserting, using this suite's established idiom for authoring atomic paragraph content —
		// `editor.triggerEditingElement()` + inline canvas editing (see
		// `inline-text-editing/canvas-editing.test.ts`) — rather than a settings shape that isn't
		// exercised anywhere else in this file.
		const accordionId = await editor.addElement( { elType: accordionType, settings: { faq_schema: true } }, 'document' );
		const root = getAccordionRoot( accordionId );
		const contentIds = await getIdsByType( root, contentType );
		expect( contentIds ).toHaveLength( 2 );

		const answers = [ 'Answer one content.', 'Answer two content.' ];

		for ( let i = 0; i < contentIds.length; i++ ) {
			const paragraphId = await editor.addWidget( { widgetType: paragraphType, container: contentIds[ i ] } );
			const inlineEditor = await editor.triggerEditingElement( paragraphId );
			await inlineEditor.clear();
			await editor.page.keyboard.type( answers[ i ] );
			await editor.page.keyboard.press( 'Escape', { delay: 100 } );
		}

		// Act
		await editor.publishAndViewPage();

		// Assert
		const html = await editor.page.content();
		expect( html ).toContain( 'application/ld+json' );
		expect( html ).toContain( '"@type":"FAQPage"' );
		expect( html ).toContain( 'Accordion Item 1' );
		expect( html ).toContain( answers[ 0 ] );
		expect( html ).toContain( answers[ 1 ] );

		// Arrange & Act — OFF, on a fresh page.
		editor = await wpAdmin.openNewPage();
		await editor.addElement( { elType: accordionType, settings: { faq_schema: false } }, 'document' );
		await editor.publishAndViewPage();

		const htmlOff = await editor.page.content();
		expect( htmlOff ).not.toContain( 'application/ld+json' );
	} );
} );
