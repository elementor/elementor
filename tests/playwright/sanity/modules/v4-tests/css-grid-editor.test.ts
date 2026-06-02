import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'CSS Grid Editor @css-grid', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp elementor experiments activate e_atomic_elements' );
		await wpCli( 'wp elementor experiments activate e_css_grid' );
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
		await expect( layoutSection ).toHaveScreenshot( 'grid-controls-panel.png' );
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
		await expect( gridOutline ).toHaveScreenshot( 'grid-outline-4x3.png' );

		// Act
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Layout' );
		const outlineToggle = page.locator( '[aria-label="Show Grid Outline control"] input[type="checkbox"]' );
		await outlineToggle.click();

		// Assert
		await expect( gridOutline ).toHaveCount( 0 );
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

		const cells = gridOutline.locator( 'svg line' );
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

		const cells = gridOutline.locator( 'svg line' );
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
		const bottomLine = gridOutline.locator( 'svg line' ).last();
		const readBottomY = async () => Number( await bottomLine.getAttribute( 'y1' ) );

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
		await expect( container ).toHaveScreenshot( 'grid-layout-editor.png' );
	} );
} );
