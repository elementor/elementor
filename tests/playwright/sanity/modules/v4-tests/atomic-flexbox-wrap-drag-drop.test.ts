import { expect, type BrowserContext, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { getAtomicWidgetDragHandleSelector, getElementSelector } from '../../../assets/elements-utils';
import EditorSelectors from '../../../selectors/editor-selectors';
import { timeouts } from '../../../config/timeouts';

const WIDGET_PLACEHOLDER_SELECTOR = '.elementor-widget-placeholder';
const OVERLAY_PLACEHOLDER_SELECTOR = '.elementor-widget-placeholder.e-placeholder--overlay';
const ROW_PLACEHOLDER_WIDTH_PX = 10;
const PLACEHOLDER_WIDTH_TOLERANCE_PX = 5;
const LAYOUT_STABILITY_TOLERANCE_PX = 1;
const V4_IMAGE_WIDGET_TYPE = 'e-image';
const DROP_TARGET_EDGE_OFFSET_PX = 2;
const MOUSE_DRAG_STEPS = 10;
const FLEXBOX_MAX_WIDTH_PX = 220;

test.describe( 'Atomic flexbox wrap drag and drop @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_atomic_elements: 'active',
			e_opt_in_v4: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'Shows overlay drop placeholder without shifting wrapped flex children', async () => {
		editor = await wpAdmin.openNewPage();

		const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
		const firstImageId = await editor.addWidget( { widgetType: V4_IMAGE_WIDGET_TYPE, container: flexboxId } );
		const secondImageId = await editor.addWidget( { widgetType: V4_IMAGE_WIDGET_TYPE, container: flexboxId } );
		const thirdImageId = await editor.addWidget( { widgetType: V4_IMAGE_WIDGET_TYPE, container: flexboxId } );

		await editor.selectElement( flexboxId );
		await editor.v4Panel.style.openSection( 'Size' );
		await editor.v4Panel.style.setSizeSectionValue( 'Max width', FLEXBOX_MAX_WIDTH_PX, 'px' );
		await editor.v4Panel.style.closeSection( 'Size' );

		await editor.v4Panel.style.openSection( 'Layout' );
		await editor.v4Panel.style.setLayoutSectionValue( 'flex', {
			flexWrap: 'wrap',
		} );
		await editor.v4Panel.style.closeSection( 'Layout' );

		await editor.openElementsPanel();

		const panelImage = page
			.locator( EditorSelectors.panels.elements.v4elements )
			.getByText( 'Image', { exact: true } );
		const dropTarget = editor
			.getPreviewFrame()
			.locator( getAtomicWidgetDragHandleSelector( secondImageId ) )
			.first();

		await panelImage.waitFor( { state: 'visible' } );
		await dropTarget.waitFor( { state: 'visible' } );

		await expect
			.poll( async () => {
				const childBoxes = await getDirectChildBoundingBoxes( editor, flexboxId );

				return 3 === childBoxes.length && childBoxes.every( Boolean );
			}, { timeout: timeouts.expect } )
			.toBe( true );

		const childBoxesBefore = await getDirectChildBoundingBoxes( editor, flexboxId );

		const panelBox = await panelImage.boundingBox();
		const targetBox = await dropTarget.boundingBox();

		expect( panelBox ).toBeTruthy();
		expect( targetBox ).toBeTruthy();

		const dropX = targetBox!.x + DROP_TARGET_EDGE_OFFSET_PX;
		const dropY = targetBox!.y + ( targetBox!.height / 2 );

		await page.mouse.move(
			panelBox!.x + ( panelBox!.width / 2 ),
			panelBox!.y + ( panelBox!.height / 2 ),
		);
		await page.mouse.down();

		for ( let step = 0; step <= MOUSE_DRAG_STEPS; step++ ) {
			await page.mouse.move( dropX, dropY, { steps: 1 } );
		}

		const placeholder = editor.getPreviewFrame().locator( OVERLAY_PLACEHOLDER_SELECTOR );

		await expect( placeholder ).toBeVisible( { timeout: 5000 } );

		await expect
			.poll( async () => {
				const placeholderBox = await placeholder.boundingBox();

				if ( ! placeholderBox ) {
					return 0;
				}

				return placeholderBox.width;
			}, { timeout: timeouts.expect } )
			.toBeGreaterThan( 1 );

		const placeholderBox = await placeholder.boundingBox();

		expect( placeholderBox ).toBeTruthy();
		expect( placeholderBox!.width ).toBeLessThanOrEqual(
			ROW_PLACEHOLDER_WIDTH_PX + PLACEHOLDER_WIDTH_TOLERANCE_PX,
		);
		expect( placeholderBox!.height ).toBeGreaterThan( ROW_PLACEHOLDER_WIDTH_PX );

		const childBoxesDuringDrag = await getDirectChildBoundingBoxes( editor, flexboxId );
		expect( childBoxesDuringDrag.length ).toBe( childBoxesBefore.length );
		assertBoundingBoxesStable( childBoxesBefore, childBoxesDuringDrag );

		await page.mouse.up();

		await expect( editor.getPreviewFrame().locator( WIDGET_PLACEHOLDER_SELECTOR ) ).toBeHidden( {
			timeout: timeouts.expect,
		} );

		const childIds = await getFlexboxChildIds( editor, flexboxId );

		expect( childIds ).toHaveLength( 4 );
		expect( childIds[ 0 ] ).toBe( firstImageId );
		expect( childIds[ 1 ] ).not.toBe( firstImageId );
		expect( childIds[ 1 ] ).not.toBe( secondImageId );
		expect( childIds[ 1 ] ).not.toBe( thirdImageId );
		expect( childIds[ 2 ] ).toBe( secondImageId );
		expect( childIds[ 3 ] ).toBe( thirdImageId );
	} );
} );

async function getFlexboxChildIds( editor: EditorPage, flexboxId: string ): Promise<string[]> {
	return editor.getPreviewFrame().locator( getElementSelector( flexboxId ) ).evaluate( ( flexbox ) =>
		Array.from( flexbox.querySelectorAll( ':scope > .elementor-element' ) )
			.map( ( child ) => child.getAttribute( 'data-id' ) || '' )
			.filter( Boolean ),
	);
}

async function getDirectChildBoundingBoxes( editor: EditorPage, containerId: string ) {
	const children = editor.getPreviewFrame().locator( `${ getElementSelector( containerId ) } > .elementor-element` );
	const count = await children.count();
	const boxes = [];

	for ( let index = 0; index < count; index++ ) {
		const box = await children.nth( index ).boundingBox();
		boxes.push( box );
	}

	return boxes;
}

function assertBoundingBoxesStable(
	before: ( { x: number; y: number; width: number; height: number } | null )[],
	after: ( { x: number; y: number; width: number; height: number } | null )[],
) {
	for ( let index = 0; index < before.length; index++ ) {
		const previous = before[ index ];
		const current = after[ index ];

		expect( previous ).toBeTruthy();
		expect( current ).toBeTruthy();

		expect( Math.abs( previous!.x - current!.x ) ).toBeLessThanOrEqual( LAYOUT_STABILITY_TOLERANCE_PX );
		expect( Math.abs( previous!.y - current!.y ) ).toBeLessThanOrEqual( LAYOUT_STABILITY_TOLERANCE_PX );
		expect( Math.abs( previous!.width - current!.width ) ).toBeLessThanOrEqual( LAYOUT_STABILITY_TOLERANCE_PX );
		expect( Math.abs( previous!.height - current!.height ) ).toBeLessThanOrEqual( LAYOUT_STABILITY_TOLERANCE_PX );
	}
}
