import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';
import ContextMenu from '../pages/widgets/context-menu';
import Style from '../pages/elementor-panel-tabs/style';

test.describe( 'Context menu', () => {
	test( 'Edit widget test', async ( { page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		const wpAdmin = new WpAdminPage( page, testInfo );
		const contextMenu = new ContextMenu( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.addWidget( 'heading' );
		await editor.openElementsPanel();
		await contextMenu.selectWidgetContextMenuItem( 'heading', 'Edit Heading' );
		await expect( page.getByPlaceholder( 'Enter your title' ) ).toBeVisible();
	} );

	test( 'Duplicate widget test', async ( { page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		const wpAdmin = new WpAdminPage( page, testInfo );
		const contextMenu = new ContextMenu( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.addWidget( 'heading' );
		await editor.openElementsPanel();
		await contextMenu.selectWidgetContextMenuItem( 'heading', 'Duplicate' );
		expect( await contextMenu.editor.getWidgetCount() ).toBe( 2 );
	} );

	test( 'Copy Paste widget test', async ( { page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		const wpAdmin = new WpAdminPage( page, testInfo );
		const contextMenu = new ContextMenu( page, testInfo );
		await wpAdmin.openNewPage();
		await editor.addWidget( 'heading' );
		await editor.openElementsPanel();
		await contextMenu.selectWidgetContextMenuItem( 'heading', 'Copy' );
		await contextMenu.selectWidgetContextMenuItem( 'heading', 'Paste' );
		expect( await contextMenu.editor.getWidgetCount() ).toBe( 2 );
	} );

	test( 'Reset widget style test', async ( { page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		const wpAdmin = new WpAdminPage( page, testInfo );
		const contextMenu = new ContextMenu( page, testInfo );
		const styleTab = new Style( page, testInfo );
		const headingSelector = '.elementor-heading-title';

		await wpAdmin.openNewPage();
		await editor.addWidget( 'heading' );
		await styleTab.setColorPicker( 'heading', '#E46E6E' );
		await expect( editor.getPreviewFrame().locator( headingSelector ) ).toHaveCSS( 'color', 'rgb(228, 110, 110)' );
		await contextMenu.selectWidgetContextMenuItem( 'heading', 'Reset style' );
		await expect( editor.getPreviewFrame().locator( headingSelector ) ).toHaveCSS( 'color', 'rgb(110, 193, 228)' );
	} );

	test( 'Open Navigator test', async ( { page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		const wpAdmin = new WpAdminPage( page, testInfo );
		const contextMenu = new ContextMenu( page, testInfo );

		await wpAdmin.openNewPage();
		await editor.addWidget( 'heading' );
		await editor.openElementsPanel();
		await contextMenu.selectWidgetContextMenuItem( 'heading', 'Navigator' );
		await expect( page.locator( '#elementor-navigator' ) ).toBeVisible();
	} );

	test( 'Delete widget test', async ( { page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		const wpAdmin = new WpAdminPage( page, testInfo );
		const contextMenu = new ContextMenu( page, testInfo );

		await wpAdmin.openNewPage();
		await editor.addWidget( 'heading' );
		await editor.openElementsPanel();
		await contextMenu.selectWidgetContextMenuItem( 'heading', 'Delete' );
		expect( await contextMenu.editor.getWidgetCount() ).toBe( 0 );
	} );

	test( 'Style test', async ( { page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		const wpAdmin = new WpAdminPage( page, testInfo );
		const contextMenu = new ContextMenu( page, testInfo );

		await wpAdmin.openNewPage();
		await editor.addWidget( 'heading' );
		await editor.openElementsPanel();
		await contextMenu.openContextMenu( 'heading' );
		await expect( page.locator( '.dialog-message.dialog-simple-message' ) ).toHaveScreenshot();
	} );
} );
