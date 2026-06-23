import { expect, type Locator, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import { wpCli } from '../../../assets/wp-cli';

const WIDGET_PLACEHOLDER_SELECTOR = '.elementor-widget-placeholder';
const OCCUPIED_GRID_CELL_WIDGET_TYPE = 'e-heading';
const MOUSE_DRAG_STEPS = 10;
const OCCUPIED_CELL_DROP_EDGE_OFFSET_PX = 5;
const PLACEHOLDER_DRAG_TIMEOUT_MS = 5_000;

test.describe( 'CSS Grid Editor @css-grid', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Grid widget can be added and renders in the editor', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act - add a Grid element to the document
		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

		// Assert - element exists in preview with the e-grid element type and atomic container classes
		const gridElement = editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` );
		await expect( gridElement ).toBeVisible();
		await expect( gridElement ).toHaveAttribute( 'data-element_type', 'e-grid' );
		await expect( gridElement ).toHaveClass( /e-con/ );
		await expect( gridElement ).toHaveClass( /e-atomic-element/ );
		await expect( gridElement ).toHaveCSS( 'display', 'grid' );
	} );

	test( 'Grid controls are visible in the panel when display is set to grid', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const containerId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );

		// Act - select element and switch to grid display
		await editor.selectElement( containerId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const layoutSection = await editor.v4Panel.style.getSectionContentByLabel( 'Layout' );
		const displayControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'display', { nestingLevel: 2 } );
		await editor.v4Panel.style.changeButtonGroupControl( displayControl, 'grid' );

		// Assert - screenshot the layout section with grid controls
		await expect.soft( layoutSection ).toHaveScreenshot( 'grid-controls-panel.png' );
	} );

	test( 'Grid outline overlay renders for a selected V4 grid and toggles off', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act
		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
		await editor.v4Panel.style.changeSizeControl( columnsControl, 4 );

		const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );
		await editor.v4Panel.style.changeSizeControl( rowsControl, 3 );

		await editor.publishPage();
		await page.reload();
		await editor.waitForPanelToLoad();

		await editor.selectElement( gridId );
		await editor.closeNavigatorIfOpen();

		// Assert
		const gridOutline = page.locator( `[data-grid-outline="${ gridId }"]` );
		await expect( gridOutline ).toBeVisible();
		await expect.soft( gridOutline ).toHaveScreenshot( 'grid-outline-4x3.png' );

		// Act
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );
		const outlineToggle = page.locator( '[aria-label="Show Grid Outline control"] input[type="checkbox"]' );
		await outlineToggle.click();

		// Assert
		await expect( gridOutline ).toHaveCount( 0 );
	} );

	test( 'Grid outline renders dashed cell perimeters when a gap is applied', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.closeNavigatorIfOpen();
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
		const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );
		await editor.v4Panel.style.changeSizeControl( columnsControl, 4 );
		await editor.v4Panel.style.changeSizeControl( rowsControl, 3 );

		await editor.publishPage();
		await page.reload();
		await editor.waitForPanelToLoad();

		await editor.selectElement( gridId );
		await editor.closeNavigatorIfOpen();

		const gridOutline = page.locator( `[data-grid-outline="${ gridId }"]` );
		await expect( gridOutline ).toBeVisible();
		await expect( gridOutline.locator( 'svg rect' ).first() ).toBeVisible();
		await expect( gridOutline.locator( 'svg line' ) ).toHaveCount( 0 );
		await expect.soft( gridOutline ).toHaveScreenshot( 'grid-outline-4x3-with-gap.png' );
	} );

	test( 'Grid outline updates live when columns, rows, and breakpoint change', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.closeNavigatorIfOpen();
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
		const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );

		await editor.v4Panel.style.changeSizeControl( columnsControl, 3 );
		await editor.v4Panel.style.changeSizeControl( rowsControl, 2 );

		const gridOutline = page.locator( `[data-grid-outline="${ gridId }"]` );
		await expect( gridOutline ).toBeVisible();

		const cells = gridOutline.locator( 'svg rect' );
		const countCells = async () => cells.count();

		await expect.poll( countCells ).toBeGreaterThan( 0 );

		// Act & Assert
		await test.step( 'Column count change updates the outline without reload', async () => {
			const baseline = await countCells();

			await editor.v4Panel.style.changeSizeControl( columnsControl, 5 );
			await expect.poll( countCells ).toBeGreaterThan( baseline );
		} );

		await test.step( 'Row count change updates the outline without reload', async () => {
			const baseline = await countCells();

			await editor.v4Panel.style.changeSizeControl( rowsControl, 4 );
			await expect.poll( countCells ).toBeGreaterThan( baseline );
		} );

		await test.step( 'Per-breakpoint columns update the outline in the matching device mode', async () => {
			const desktopCells = await countCells();

			await editor.changeResponsiveView( 'tablet' );
			await expect( gridOutline ).toBeVisible();

			const tabletColumns = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
			await editor.v4Panel.style.changeSizeControl( tabletColumns, 3 );
			await expect.poll( countCells ).not.toBe( desktopCells );

			await editor.changeResponsiveView( 'desktop' );
			await expect.poll( countCells ).toBe( desktopCells );
		} );
	} );

	test( 'Grid outline grows when a child creates a new implicit row', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.closeNavigatorIfOpen();
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
		const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );
		await editor.v4Panel.style.changeSizeControl( columnsControl, 2 );
		await editor.v4Panel.style.changeSizeControl( rowsControl, 1 );

		const gridOutline = page.locator( `[data-grid-outline="${ gridId }"]` );
		await expect( gridOutline ).toBeVisible();

		const cells = gridOutline.locator( 'svg rect' );
		const countCells = async () => cells.count();

		await expect.poll( countCells ).toBeGreaterThan( 0 );

		await editor.addElement( { elType: 'e-div-block' }, gridId );
		await editor.addElement( { elType: 'e-div-block' }, gridId );

		await editor.selectElement( gridId );
		const baseline = await countCells();

		await editor.addElement( { elType: 'e-div-block' }, gridId );
		await editor.selectElement( gridId );

		await expect.poll( countCells ).toBeGreaterThan( baseline );
	} );

	test( 'Grid outline updates when a child resizes a row track', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.closeNavigatorIfOpen();
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
		const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );
		await editor.v4Panel.style.changeSizeControl( columnsControl, 1 );
		await editor.v4Panel.style.changeSizeControl( rowsControl, 1 );

		const childId = await editor.addElement( { elType: 'e-div-block' }, gridId );

		await editor.selectElement( gridId );
		const gridOutline = page.locator( `[data-grid-outline="${ gridId }"]` );
		await expect( gridOutline ).toBeVisible();
		const bottomCell = gridOutline.locator( 'svg rect' ).last();
		const readBottomY = async () =>
			Number( await bottomCell.getAttribute( 'y' ) ) + Number( await bottomCell.getAttribute( 'height' ) );

		await expect.poll( readBottomY ).toBeGreaterThan( 0 );
		const initialBottomY = await readBottomY();

		await editor.selectElement( childId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Size' );
		await editor.v4Panel.style.setSizeSectionValue( 'Height', 240, 'px' );

		await editor.selectElement( gridId );
		await expect.poll( readBottomY ).toBeGreaterThan( initialBottomY );
	} );

	test( 'Grid layout with content renders in editor', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const containerId = await editor.addElement( { elType: 'e-flexbox' }, 'document' );

		// Act - switch to grid display and set columns via panel
		await editor.selectElement( containerId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const displayControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'display', { nestingLevel: 2 } );
		await editor.v4Panel.style.changeButtonGroupControl( displayControl, 'grid' );

		const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
		await editor.v4Panel.style.changeSizeControl( columnsControl, 2 );

		// Add 4 div-block children with distinct background colors
		const colors = [ '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4' ];
		const childIds: string[] = [];

		for ( const color of colors ) {
			const childId = await editor.addElement( { elType: 'e-div-block' }, containerId );
			childIds.push( childId );
			await editor.selectElement( childId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.openSection( 'Size' );
			await editor.v4Panel.style.setSizeSectionValue( 'Height', 80, 'px' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( color );
		}

		// Add a heading inside the first child
		await editor.addWidget( { widgetType: 'e-heading', container: childIds[ 0 ] } );

		// Select the grid container to frame the screenshot
		await editor.selectElement( containerId );
		const container = editor.getPreviewFrame().locator( `[data-id="${ containerId }"]` );

		// Assert - screenshot the grid layout in editor
		await expect.soft( container ).toHaveScreenshot( 'grid-layout-editor.png' );
	} );

	test( 'First-empty-cell indicator advances as children are added', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.closeNavigatorIfOpen();
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
		const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );
		await editor.v4Panel.style.changeSizeControl( columnsControl, 3 );
		await editor.v4Panel.style.changeSizeControl( rowsControl, 2 );

		const columnGapInput = page.locator( 'input[aria-label="Column gap"]' ).first();
		await columnGapInput.fill( '20' );
		await columnGapInput.blur();

		const gridOutline = page.locator( `[data-grid-outline="${ gridId }"]` );
		await expect( gridOutline ).toBeVisible();

		const cells = gridOutline.locator( 'svg rect' );
		await expect( cells ).toHaveCount( 6 );

		const plus = gridOutline.locator( '.eicon-plus' );

		const plusCenterInCell = async ( cellIndex: number ): Promise<boolean> => {
			const plusBox = await plus.boundingBox();
			const cellBox = await cells.nth( cellIndex ).boundingBox();
			if ( ! plusBox || ! cellBox ) {
				return false;
			}
			const px = plusBox.x + ( plusBox.width / 2 );
			const py = plusBox.y + ( plusBox.height / 2 );
			return (
				px >= cellBox.x &&
				px <= cellBox.x + cellBox.width &&
				py >= cellBox.y &&
				py <= cellBox.y + cellBox.height
			);
		};

		await expect( plus ).toHaveCount( 1 );
		await expect.poll( () => plusCenterInCell( 0 ) ).toBe( true );

		await editor.addElement( { elType: 'e-div-block' }, gridId );
		await editor.selectElement( gridId );
		await expect( plus ).toHaveCount( 1 );
		await expect.poll( () => plusCenterInCell( 1 ) ).toBe( true );

		await editor.addElement( { elType: 'e-div-block' }, gridId );
		await editor.selectElement( gridId );
		await expect( plus ).toHaveCount( 1 );
		await expect.poll( () => plusCenterInCell( 2 ) ).toBe( true );

		await editor.addElement( { elType: 'e-div-block' }, gridId );
		await editor.selectElement( gridId );
		await expect( plus ).toHaveCount( 1 );
		await expect.poll( () => plusCenterInCell( 3 ) ).toBe( true );
	} );

	test( 'Grid justify-items and align-items combinations render in editor', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );
		await editor.selectElement( gridId );
		await editor.closeNavigatorIfOpen();
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
		const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );
		await editor.v4Panel.style.changeSizeControl( columnsControl, 3 );
		await editor.v4Panel.style.changeSizeControl( rowsControl, 3 );

		const columnGapInput = page.locator( 'input[aria-label="Column gap"]' ).first();
		await columnGapInput.fill( '20' );
		await columnGapInput.blur();

		await editor.v4Panel.style.openSection( 'Size' );
		await editor.v4Panel.style.setSizeSectionValue( 'Width', 600, 'px' );
		await editor.v4Panel.style.setSizeSectionValue( 'Height', 600, 'px' );

		const children: Array< { width: number; height: number; color: string } > = [
			{ width: 80, height: 80, color: '#FF6B6B' },
			{ width: 120, height: 60, color: '#4ECDC4' },
			{ width: 60, height: 120, color: '#45B7D1' },
			{ width: 100, height: 100, color: '#96CEB4' },
		];

		for ( const child of children ) {
			const childId = await editor.addElement( { elType: 'e-div-block' }, gridId );
			await editor.selectElement( childId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.openSection( 'Size' );
			await editor.v4Panel.style.setSizeSectionValue( 'Width', child.width, 'px' );
			await editor.v4Panel.style.setSizeSectionValue( 'Height', child.height, 'px' );
			await editor.v4Panel.style.openSection( 'Background' );
			await editor.v4Panel.style.setBackgroundColor( child.color );
		}

		await editor.selectElement( gridId );
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );

		const combinations: Array< { justify: 'start' | 'center' | 'end'; align: 'start' | 'center' | 'end' } > = [
			{ justify: 'start', align: 'center' },
			{ justify: 'center', align: 'end' },
			{ justify: 'end', align: 'end' },
		];

		const gridInPreview = editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` );

		for ( const combo of combinations ) {
			const justifyControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Justify items' );
			await editor.v4Panel.style.changeButtonGroupControl( justifyControl, combo.justify );

			const alignControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Align items' );
			await editor.v4Panel.style.changeButtonGroupControl( alignControl, combo.align );

			await expect.soft( gridInPreview ).toHaveScreenshot(
				`grid-justify-${ combo.justify }-align-${ combo.align }.png`,
			);
		}
	} );

	test.describe( 'Grid drop zone', () => {
		test( 'First-empty-cell drop placeholder is visible when dragging a widget into the grid', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();

			// Act - add a Grid element to the document
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await editor.openElementsPanel();

			const { box: panelBox } = await getPanelHeadingBox( page );

			const gridFirstAdd = editor
				.getPreviewFrame()
				.locator( `[data-id="${ gridId }"] .elementor-empty-view > .elementor-first-add` )
				.first();

			await gridFirstAdd.waitFor( { state: 'visible' } );

			const targetBox = await gridFirstAdd.boundingBox();

			expect( targetBox ).toBeTruthy();

			await page.mouse.move(
				panelBox.x + ( panelBox.width / 2 ),
				panelBox.y + ( panelBox.height / 2 ),
			);
			await page.mouse.down();

			await page.mouse.move(
				targetBox!.x + ( targetBox!.width / 2 ),
				targetBox!.y + ( targetBox!.height / 2 ),
				{ steps: 10 },
			);

			const placeholder = editor.getPreviewFrame().locator( '.elementor-widget-placeholder' );
			await expect( placeholder ).toBeVisible();

			// Assert.
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-drag-heading-placeholder.png',
			);
		} );

		test( 'First-empty-cell drop placeholder follows the first empty cell when the grid has children', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();

			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await editor.selectElement( gridId );
			await editor.closeNavigatorIfOpen();
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.openSection( 'Layout' );

			const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
			const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );
			await editor.v4Panel.style.changeSizeControl( columnsControl, 3 );
			await editor.v4Panel.style.changeSizeControl( rowsControl, 2 );

			const firstChildId = await editor.addWidget( { widgetType: OCCUPIED_GRID_CELL_WIDGET_TYPE, container: gridId } );

			await editor.openElementsPanel();

			const { box: panelBox } = await getPanelHeadingBox( page );

			const gridFirstAdd = editor
				.getPreviewFrame()
				.locator( `[data-id="${ gridId }"] > .elementor-empty-view > .elementor-first-add` );

			await expect( gridFirstAdd ).toHaveCount( 1 );

			const firstChild = await getOccupiedCellLocator( editor, gridId, firstChildId );
			const firstChildBox = await firstChild.boundingBox();
			const dropTargetBox = await gridFirstAdd.boundingBox();

			expect( firstChildBox ).toBeTruthy();
			expect( dropTargetBox ).toBeTruthy();
			expect( dropTargetBox!.x ).toBeGreaterThan( firstChildBox!.x + ( firstChildBox!.width / 2 ) );

			const placeholder = editor.getPreviewFrame().locator( '.elementor-widget-placeholder' );

			// Act
			await page.mouse.move(
				panelBox.x + ( panelBox.width / 2 ),
				panelBox.y + ( panelBox.height / 2 ),
			);
			await page.mouse.down();

			await page.mouse.move(
				dropTargetBox!.x + ( dropTargetBox!.width / 2 ),
				dropTargetBox!.y + ( dropTargetBox!.height / 2 ),
				{ steps: 10 },
			);

			// Assert
			await expect( placeholder ).toBeVisible();

			await expect( gridFirstAdd ).toHaveClass( /elementor-html5dnd-current-element/ );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-drop-placeholder-first-empty-with-children.png',
			);
		} );

		test( 'Empty view CSS variables track the first empty cell', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await configureGridLayout( editor, gridId, 3, 2 );
			await editor.addWidget( { widgetType: OCCUPIED_GRID_CELL_WIDGET_TYPE, container: gridId } );

			// Act
			const cssVars = await readGridEmptyCellCssVars( editor, gridId );

			// Assert
			expect( cssVars.row ).toBe( '1' );
			expect( cssVars.col ).toBe( '2' );
			expect( cssVars.visibility ).toBe( 'visible' );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-empty-view-css-vars-first-cell.png',
			);
		} );

		test( 'Empty view CSS variables hide the placeholder when all cells are occupied', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await configureGridLayout( editor, gridId, 3, 2 );

			for ( let i = 0; i < 6; i++ ) {
				await editor.addWidget( { widgetType: OCCUPIED_GRID_CELL_WIDGET_TYPE, container: gridId } );
			}

			// Act
			const cssVars = await readGridEmptyCellCssVars( editor, gridId );

			// Assert
			expect( cssVars.visibility ).toBe( 'hidden' );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-empty-view-all-cells-occupied.png',
			);
		} );

		test( 'Grid outline plus hides while dragging over the grid', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await configureGridLayout( editor, gridId, 3, 2 );
			await editor.selectElement( gridId );

			const gridOutline = page.locator( `[data-grid-outline="${ gridId }"]` );
			const plus = gridOutline.locator( '.eicon-plus' );

			await editor.openElementsPanel();

			const panelHeading = getPanelHeading( page );
			const gridFirstAdd = editor
				.getPreviewFrame()
				.locator( `[data-id="${ gridId }"] .elementor-empty-view > .elementor-first-add` )
				.first();

			await panelHeading.waitFor( { state: 'visible' } );

			const panelBox = await panelHeading.boundingBox();
			const targetBox = await gridFirstAdd.boundingBox();

			expect( panelBox ).toBeTruthy();
			expect( targetBox ).toBeTruthy();
			await expect( plus ).toHaveCount( 1 );

			// Act
			await startPanelWidgetDrag( page, panelHeading );
			await dragMouseTo(
				page,
				targetBox!.x + ( targetBox!.width / 2 ),
				targetBox!.y + ( targetBox!.height / 2 ),
			);

			// Assert
			await expect( plus ).toHaveCount( 0 );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-outline-plus-hidden-while-dragging.png',
			);
			await releasePanelWidgetDrag( page );
		} );

		test( 'Occupied cell shows a top drop placeholder when dragging over the upper half', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await configureGridLayout( editor, gridId, 3, 2 );
			const childId = await addOccupiedGridCellChild( editor, gridId );

			await editor.openElementsPanel();

			const panelHeading = getPanelHeading( page );
			const occupiedCell = await getOccupiedCellLocator( editor, gridId, childId );
			const targetBox = await occupiedCell.boundingBox();

			expect( targetBox ).toBeTruthy();

			const dropX = targetBox!.x + ( targetBox!.width / 2 );
			const dropY = targetBox!.y + OCCUPIED_CELL_DROP_EDGE_OFFSET_PX;

			// Act
			await startPanelWidgetDrag( page, panelHeading );
			await page.mouse.move( dropX, dropY, { steps: MOUSE_DRAG_STEPS } );

			// Assert
			await assertOccupiedCellPlaceholder( editor, gridId, childId, /e-dragging-top/ );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-occupied-cell-top-placeholder.png',
			);
			await releasePanelWidgetDrag( page );
		} );

		test( 'Occupied cell shows a bottom drop placeholder when dragging over the lower half', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await configureGridLayout( editor, gridId, 3, 2 );
			const childId = await addOccupiedGridCellChild( editor, gridId );

			await editor.openElementsPanel();

			const panelHeading = getPanelHeading( page );
			const occupiedCell = await getOccupiedCellLocator( editor, gridId, childId );
			const targetBox = await occupiedCell.boundingBox();

			expect( targetBox ).toBeTruthy();

			const dropX = targetBox!.x + ( targetBox!.width / 2 );
			const dropY = targetBox!.y + targetBox!.height - OCCUPIED_CELL_DROP_EDGE_OFFSET_PX;

			// Act
			await startPanelWidgetDrag( page, panelHeading );
			await page.mouse.move( dropX, dropY, { steps: MOUSE_DRAG_STEPS } );

			// Assert
			await assertOccupiedCellPlaceholder( editor, gridId, childId, /e-dragging-bottom/ );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-occupied-cell-bottom-placeholder.png',
			);
			await releasePanelWidgetDrag( page );
		} );

		test( 'Dropping on the first empty cell appends after existing children', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await configureGridLayout( editor, gridId, 3, 2 );
			const firstChildId = await editor.addWidget( { widgetType: OCCUPIED_GRID_CELL_WIDGET_TYPE, container: gridId } );

			await editor.openElementsPanel();

			const panelHeading = getPanelHeading( page );
			const gridFirstAdd = editor
				.getPreviewFrame()
				.locator( `[data-id="${ gridId }"] > .elementor-empty-view > .elementor-first-add` );

			await panelHeading.waitFor( { state: 'visible' } );
			await expect( gridFirstAdd ).toHaveCount( 1 );

			const targetBox = await gridFirstAdd.boundingBox();

			expect( targetBox ).toBeTruthy();

			// Act
			await startPanelWidgetDrag( page, panelHeading );
			await dragMouseTo(
				page,
				targetBox!.x + ( targetBox!.width / 2 ),
				targetBox!.y + ( targetBox!.height / 2 ),
			);
			await releasePanelWidgetDrag( page );

			// Assert
			await expect
				.poll( () => getGridChildIds( editor, gridId ) )
				.toHaveLength( 2 );

			const childIds = await getGridChildIds( editor, gridId );

			expect( childIds[ 0 ] ).toBe( firstChildId );
			expect( childIds[ 1 ] ).not.toBe( firstChildId );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-drop-append-first-empty-cell.png',
			);
		} );

		test( 'Dropping above an occupied cell inserts before it', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await configureGridLayout( editor, gridId, 3, 2 );
			const firstChildId = await addOccupiedGridCellChild( editor, gridId );
			const secondChildId = await addOccupiedGridCellChild( editor, gridId );

			await editor.openElementsPanel();

			const panelHeading = getPanelHeading( page );
			const secondChild = await getOccupiedCellLocator( editor, gridId, secondChildId );
			const targetBox = await secondChild.boundingBox();

			expect( targetBox ).toBeTruthy();

			const dropY = targetBox!.y + OCCUPIED_CELL_DROP_EDGE_OFFSET_PX;

			// Act
			await dragPanelHeadingToCoordinates(
				page,
				panelHeading,
				targetBox!.x + ( targetBox!.width / 2 ),
				dropY,
			);

			// Assert
			await expect
				.poll( () => getGridChildIds( editor, gridId ) )
				.toHaveLength( 3 );

			const childIds = await getGridChildIds( editor, gridId );

			expect( childIds[ 0 ] ).toBe( firstChildId );
			expect( childIds[ 2 ] ).toBe( secondChildId );
			expect( childIds[ 1 ] ).not.toBe( firstChildId );
			expect( childIds[ 1 ] ).not.toBe( secondChildId );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-drop-insert-before-occupied-cell.png',
			);
		} );

		test( 'Dropping below an occupied cell inserts after it', async ( { page, apiRequests }, testInfo ) => {
			// Arrange
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			const gridId = await editor.addElement( { elType: 'e-grid' }, 'document' );

			await configureGridLayout( editor, gridId, 3, 2 );
			const firstChildId = await addOccupiedGridCellChild( editor, gridId );
			const secondChildId = await addOccupiedGridCellChild( editor, gridId );

			await editor.openElementsPanel();

			const panelHeading = getPanelHeading( page );
			const firstChild = await getOccupiedCellLocator( editor, gridId, firstChildId );
			const targetBox = await firstChild.boundingBox();

			expect( targetBox ).toBeTruthy();

			// Act
			await dragPanelHeadingToCoordinates(
				page,
				panelHeading,
				targetBox!.x + ( targetBox!.width / 2 ),
				targetBox!.y + targetBox!.height - OCCUPIED_CELL_DROP_EDGE_OFFSET_PX,
			);

			// Assert
			await expect
				.poll( () => getGridChildIds( editor, gridId ) )
				.toHaveLength( 3 );

			const childIds = await getGridChildIds( editor, gridId );

			expect( childIds[ 0 ] ).toBe( firstChildId );
			expect( childIds[ 2 ] ).toBe( secondChildId );
			expect( childIds[ 1 ] ).not.toBe( firstChildId );
			expect( childIds[ 1 ] ).not.toBe( secondChildId );
			await expect.soft( editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ) ).toHaveScreenshot(
				'grid-drop-insert-after-occupied-cell.png',
			);
		} );
	} );
} );

async function configureGridLayout(
	editor: EditorPage,
	gridId: string,
	columns: number,
	rows: number,
): Promise<void> {
	await editor.selectElement( gridId );
	await editor.closeNavigatorIfOpen();
	await editor.v4Panel.openTab( 'style' );
	await editor.v4Panel.style.openSection( 'Layout' );

	const columnsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Columns' );
	const rowsControl = await editor.v4Panel.style.getControlByLabel( 'Layout', 'Rows' );
	await editor.v4Panel.style.changeSizeControl( columnsControl, columns );
	await editor.v4Panel.style.changeSizeControl( rowsControl, rows );
}

function getPanelHeading( page: Page ): Locator {
	return page
		.locator( EditorSelectors.panels.elements.v4elements )
		.locator( `.elementor-element[data-library-element-type="${ OCCUPIED_GRID_CELL_WIDGET_TYPE }"]` );
}

async function getLocatorBox( locator: Locator ): Promise<{ x: number; y: number; width: number; height: number }> {
	await locator.waitFor( { state: 'visible' } );
	await locator.scrollIntoViewIfNeeded();

	await expect
		.poll( async () => locator.boundingBox(), { timeout: PLACEHOLDER_DRAG_TIMEOUT_MS } )
		.not.toBeNull();

	const box = await locator.boundingBox();

	expect( box ).toBeTruthy();

	return box!;
}

async function getPanelHeadingBox( page: Page ): Promise<{ locator: Locator; box: { x: number; y: number; width: number; height: number } }> {
	const panelHeading = getPanelHeading( page );
	const box = await getLocatorBox( panelHeading );

	return { locator: panelHeading, box };
}

async function dragPanelHeadingToCoordinates(
	page: Page,
	panelHeading: Locator,
	dropX: number,
	dropY: number,
): Promise<void> {
	await startPanelWidgetDrag( page, panelHeading );
	await page.mouse.move( dropX, dropY, { steps: MOUSE_DRAG_STEPS } );
	await releasePanelWidgetDrag( page );
}

async function startPanelWidgetDrag( page: Page, panelWidget: Locator ): Promise<void> {
	const panelBox = await getLocatorBox( panelWidget );

	await page.mouse.move(
		panelBox.x + ( panelBox.width / 2 ),
		panelBox.y + ( panelBox.height / 2 ),
	);
	await page.mouse.down();
}

async function releasePanelWidgetDrag( page: Page ): Promise<void> {
	await page.mouse.up();
}

async function getOccupiedCellLocator( editor: EditorPage, gridId: string, childId: string ): Promise<Locator> {
	const occupiedCell = editor
		.getPreviewFrame()
		.locator( `[data-id="${ gridId }"] > [data-id="${ childId }"]` );

	await occupiedCell.waitFor( { state: 'attached' } );

	const dropTarget = occupiedCell.locator( `:scope > :not(${ WIDGET_PLACEHOLDER_SELECTOR })` ).first();

	await dropTarget.waitFor( { state: 'visible' } );
	await dropTarget.scrollIntoViewIfNeeded();

	await expect
		.poll( async () => dropTarget.boundingBox(), { timeout: PLACEHOLDER_DRAG_TIMEOUT_MS } )
		.not.toBeNull();

	return dropTarget;
}

async function addOccupiedGridCellChild( editor: EditorPage, gridId: string ): Promise<string> {
	return editor.addWidget( { widgetType: OCCUPIED_GRID_CELL_WIDGET_TYPE, container: gridId } );
}

async function dragMouseTo( page: Page, x: number, y: number ): Promise<void> {
	for ( let step = 0; step <= MOUSE_DRAG_STEPS; step++ ) {
		await page.mouse.move( x, y, { steps: 1 } );
	}
}

function getGridCellPlaceholder( editor: EditorPage, gridId: string, childId: string ): Locator {
	return editor
		.getPreviewFrame()
		.locator( `[data-id="${ gridId }"] > [data-id="${ childId }"] ${ WIDGET_PLACEHOLDER_SELECTOR }` )
		.first();
}

async function assertOccupiedCellPlaceholder(
	editor: EditorPage,
	gridId: string,
	childId: string,
	expectedSideClass: RegExp,
): Promise<void> {
	const placeholder = getGridCellPlaceholder( editor, gridId, childId );

	await expect( placeholder ).toBeVisible( { timeout: PLACEHOLDER_DRAG_TIMEOUT_MS } );
	await expect( placeholder ).toHaveClass( expectedSideClass, { timeout: PLACEHOLDER_DRAG_TIMEOUT_MS } );
}

async function getGridChildIds( editor: EditorPage, gridId: string ): Promise<string[]> {
	return editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ).evaluate( ( grid ) =>
		Array.from( grid.querySelectorAll( ':scope > .elementor-element' ) )
			.map( ( child ) => child.getAttribute( 'data-id' ) || '' )
			.filter( Boolean ),
	);
}

async function readGridEmptyCellCssVars(
	editor: EditorPage,
	gridId: string,
): Promise<{ col: string; row: string; visibility: string }> {
	return editor.getPreviewFrame().locator( `[data-id="${ gridId }"]` ).evaluate( ( grid ) => ( {
		col: grid.style.getPropertyValue( '--e-grid-empty-cell-col' ),
		row: grid.style.getPropertyValue( '--e-grid-empty-cell-row' ),
		visibility: grid.style.getPropertyValue( '--e-grid-empty-cell-visibility' ),
	} ) );
}
