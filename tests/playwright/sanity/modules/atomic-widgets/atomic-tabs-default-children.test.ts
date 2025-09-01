import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Atomic Tabs Default Children @atomic-widgets', () => {
	let editor: EditorPage;

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic elements and nested elements experiments
		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdmin.setExperiments( {
			e_nested_elements: 'active',
		} );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterEach( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();

		await page.close();
	} );

	test( 'Atomic tabs creates default children hierarchy when dropped on canvas', async () => {
		// Act - Add atomic tabs widget
		const tabsId = await editor.addElement( { elType: 'e-tabs' }, 'document' );

		const tabsSelector = editor.getWidgetSelector( tabsId );
		const tabsElement = editor.getPreviewFrame().locator( tabsSelector );

		// Assert - Check that the atomic tabs element exists and is visible
		await expect( tabsElement ).toBeVisible();

		// Assert - Check that it has the correct atomic element classes
		await expect( tabsElement ).toHaveClass( /e-con/ );
		await expect( tabsElement ).toHaveClass( /e-atomic-element/ );

		// Assert - Check that it has a tab list child with correct attributes
		const tabList = tabsElement.locator( '.e-con[data-element_type="e-tabs-list"]' );
		await expect( tabList ).toBeVisible();
		await expect( tabList ).toHaveClass( /e-atomic-element/ );
	} );
} );
