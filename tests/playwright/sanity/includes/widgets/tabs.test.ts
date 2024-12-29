import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import TabsWidget from '../../../pages/widgets/tabs';

test.describe( 'Tabs widget tests', () => {
	test( 'Ensure the old tabs widget is telling deprecation warning message', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: 'active',
			'nested-elements': 'active',
		} );
		const editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'tabs' );

		// Assert.
		await expect( editor.page.locator( '.elementor-control-alert.elementor-panel-alert.elementor-panel-alert-info' ) )
			.toContainText( 'You are currently editing a Tabs Widget in its old version.' );

		await wpAdmin.setExperiments( {
			container: 'inactive',
			'nested-elements': 'inactive',
		} );
	} );

	test( 'Tabs widget sanity test', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		const tabsWidget = new TabsWidget( page, testInfo );
		const tabText = 'Super tab content test';
		const newTabTitle = 'Super test tab';
		const defaultText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.';

		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.addWidget( 'tabs' );
		await tabsWidget.createNewTab( newTabTitle, tabText );

		await editor.getPreviewFrame().getByRole( 'tab', { name: 'Tab #1' } ).click();
		await editor.getPreviewFrame().getByRole( 'tab', { name: 'Tab #1' } ).click();
		await expect( editor.getPreviewFrame().getByText( defaultText ).first() ).toBeVisible();
		await editor.getPreviewFrame().getByRole( 'tab', { name: newTabTitle } ).click();
		await expect( editor.getPreviewFrame().getByText( 'Super tab content test' ) ).toBeVisible();
		await editor.publishAndViewPage();
		await page.getByRole( 'tab', { name: 'Tab #1' } ).click();
		await expect( page.getByText( defaultText ).first() ).toBeVisible();
		await page.getByRole( 'tab', { name: newTabTitle } ).click();
		await expect( page.getByText( 'Super tab content test' ) ).toBeVisible();
	} );
} );
