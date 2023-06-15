import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page.js';
const EditorPage = require( '../../../pages/editor-page.js' );
import Content from '../../../pages/elementor-panel-tabs/content.js';

test( 'Ensure the old tabs widget is telling deprecation warning message', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.setExperiments( {
		container: 'active',
		'nested-elements': 'active',
	} );
	const editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addWidget( 'tabs' );

	// Assert.
	await expect( editor.page.locator( '.elementor-control-raw-html.elementor-panel-alert.elementor-panel-alert-info' ) )
		.toContainText( 'You are currently editing a Tabs Widget in its old version.' );

	await wpAdmin.setExperiments( {
		container: 'inactive',
		'nested-elements': 'inactive',
	} );
} );

test( 'Tabs widget sanity test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = new EditorPage( page, testInfo );
	const contentTab = new Content( page, testInfo );
	const tabText = 'Super tab content test';
	const tabTitle = 'Super test tab';

	await wpAdmin.openNewPage();
	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'tabs' );
	await contentTab.addNewTab( tabTitle, tabText );
	await editor.getPreviewFrame().getByRole( 'tab', { name: 'Tab #1' } ).click();
	await editor.getPreviewFrame().getByRole( 'tab', { name: 'Tab #1' } ).click();
	await editor.getPreviewFrame().getByRole( 'tab', { name: tabTitle } ).click();
	await expect( editor.getPreviewFrame().getByText( 'Super tab content test' ) ).toBeVisible();
} );
