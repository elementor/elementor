import { expect, type BrowserContext, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import { getAtomicWidgetDragHandleSelector } from '../../../assets/elements-utils';
import EditorSelectors from '../../../selectors/editor-selectors';

const WIDGET_PLACEHOLDER_SELECTOR = '.elementor-widget-placeholder';
const ROW_PLACEHOLDER_WIDTH_PX = 10;
const PLACEHOLDER_ANIMATION_MS = 300;
const PLACEHOLDER_WIDTH_TOLERANCE_PX = 5;
const V4_IMAGE_WIDGET_TYPE = 'e-image';
const DROP_TARGET_EDGE_OFFSET_PX = 2;
const MOUSE_DRAG_STEPS = 10;

test.describe( 'Atomic flexbox drag and drop @v4-tests', () => {
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

	test( 'Shows row drop placeholder when dragging V4 image from panel into row flexbox', async () => {
		editor = await wpAdmin.openNewPage();

		const flexboxId = await editor.addElement( { elType: EditorSelectors.v4.atoms.flexbox }, 'document' );
		await editor.addWidget( { widgetType: V4_IMAGE_WIDGET_TYPE, container: flexboxId } );
		const secondImageId = await editor.addWidget( { widgetType: V4_IMAGE_WIDGET_TYPE, container: flexboxId } );

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

		const placeholder = editor.getPreviewFrame().locator( WIDGET_PLACEHOLDER_SELECTOR );

		await expect( placeholder ).toBeVisible( { timeout: 5000 } );

		await expect
			.poll( async () => {
				const placeholderBox = await placeholder.boundingBox();

				if ( ! placeholderBox ) {
					return 0;
				}

				return placeholderBox.width;
			}, { timeout: PLACEHOLDER_ANIMATION_MS } )
			.toBeGreaterThan( 1 );

		const placeholderBox = await placeholder.boundingBox();

		expect( placeholderBox ).toBeTruthy();
		expect( placeholderBox!.width ).toBeLessThanOrEqual(
			ROW_PLACEHOLDER_WIDTH_PX + PLACEHOLDER_WIDTH_TOLERANCE_PX,
		);
		expect( placeholderBox!.height ).toBeGreaterThan( ROW_PLACEHOLDER_WIDTH_PX );

		await page.mouse.up();
	} );
} );
