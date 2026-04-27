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
