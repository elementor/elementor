import { parallelTest as test } from '../../../parallelTest';
import { DriverFactory } from '../../../drivers/driver-factory';
import type { EditorDriver } from '../../../drivers/editor-driver';
import { AtomicTabsHelper } from '../../../pages/widgets/atomic-tabs';
import { AtomicTabsSelectors } from '../../../selectors/atomic-tabs-selectors';

test.describe( 'E-Tabs Core Functionality @v4-tests', () => {
	let driver: EditorDriver;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		driver = await DriverFactory.createEditorDriver( browser, testInfo, apiRequests, {
			experiments: [ 'e_atomic_elements' ],
		} );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		await DriverFactory.resetExperiments( browser, testInfo, apiRequests );
		await driver.close();
	} );

	test( 'TC-002: Tab switching works via click in editor preview', async () => {
		// Arrange
		await driver.createNewPage();
		const tabsId = await AtomicTabsHelper.addTabsWidget( driver.editor );
		const tabs = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsId );

		// Act & Assert - Verify Tab 1 is active by default
		await tabs.expectTabActive( 0 );

		// Act - Click on Tab 2
		await tabs.clickTab( 1 );

		// Assert - Tab 2 becomes active, Tab 1 inactive
		await tabs.expectTabActive( 1 );
		await tabs.expectTabInactive( 0 );

		// Act - Click on Tab 3
		await tabs.clickTab( 2 );

		// Assert - Tab 3 becomes active, Tab 2 inactive
		await tabs.expectTabActive( 2 );
		await tabs.expectTabInactive( 1 );
	} );

	test( 'TC-003: Tab switching works on published frontend', async () => {
		// Arrange
		await driver.createNewPage();
		await AtomicTabsHelper.addTabsWidget( driver.editor );
		await driver.editor.publishAndViewPage();
		const tabs = AtomicTabsHelper.createFrontendWidget( driver.page );

		// Assert - Tab 1 is active by default on frontend
		await tabs.expectTabActive( 0 );

		// Act - Click on Tab 2
		await tabs.clickTab( 1 );

		// Assert - Tab 2 becomes active
		await tabs.expectTabActive( 1 );
		await tabs.expectTabInactive( 0 );

		// Act - Click on Tab 3
		await tabs.clickTab( 2 );

		// Assert - Tab 3 becomes active
		await tabs.expectTabActive( 2 );
		await tabs.expectTabInactive( 1 );

		// Act - Click on Tab 1 again
		await tabs.clickTab( 0 );

		// Assert - Tab 1 becomes active again
		await tabs.expectTabActive( 0 );
		await tabs.expectTabInactive( 2 );
	} );

	test( 'TC-004: Keyboard navigation between tabs', async () => {
		// Arrange
		await driver.createNewPage();
		await AtomicTabsHelper.addTabsWidget( driver.editor );
		await driver.editor.publishAndViewPage();
		const tabs = AtomicTabsHelper.createFrontendWidget( driver.page );

		// Act - Focus on Tab 1
		await tabs.focusTab( 0 );

		// Assert - Tab 1 is focused
		await tabs.expectTabFocused( 0 );

		// Act - Press ArrowRight
		await tabs.pressKey( 'ArrowRight' );

		// Assert - Tab 2 receives focus
		await tabs.expectTabFocused( 1 );

		// Act - Press ArrowRight again
		await tabs.pressKey( 'ArrowRight' );

		// Assert - Tab 3 receives focus
		await tabs.expectTabFocused( 2 );

		// Act - Press ArrowLeft
		await tabs.pressKey( 'ArrowLeft' );

		// Assert - Tab 2 receives focus again
		await tabs.expectTabFocused( 1 );
	} );

	test( 'TC-005: Add and remove tabs', async () => {
		// Arrange
		await driver.createNewPage();
		const tabsId = await AtomicTabsHelper.addTabsWidget( driver.editor );
		const tabs = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsId );

		// Assert - Initially 3 tabs exist
		await tabs.expectTabCount( 3 );

		// Act - Click on tabs element to select it
		await tabs.container.click();

		// Act - Add new tab via panel
		await driver.page.locator( AtomicTabsSelectors.addItemButton ).click();

		// Assert - 4 tabs now exist
		await tabs.expectTabCount( 4 );

		// Act - Publish and view frontend
		await driver.editor.publishAndViewPage();
		const frontendTabs = AtomicTabsHelper.createFrontendWidget( driver.page );

		// Assert - 4 tabs visible on frontend
		await frontendTabs.expectTabCount( 4 );

		// Assert - New tab is functional (can be clicked)
		await frontendTabs.clickTab( 3 );
		await frontendTabs.expectTabActive( 3 );
	} );

	test( 'TC-006: Tab widget persists after save and reload', async () => {
		// Arrange
		await driver.createNewPage();
		const tabsId = await AtomicTabsHelper.addTabsWidget( driver.editor );
		const tabs = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsId );

		// Act - Verify tabs exist before save
		await tabs.expectTabCount( 3 );

		// Act - Publish the page
		await driver.editor.publishPage();

		// Act - Reload the editor page
		await driver.page.reload();
		await driver.page.waitForLoadState( 'networkidle' );

		// Assert - Tab structure is preserved after reload
		const tabsAfterReload = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsId );
		await tabsAfterReload.expectVisible();
		await tabsAfterReload.expectTabCount( 3 );
		await tabsAfterReload.expectMenuVisible();

		// Act - View frontend
		await driver.editor.viewPage();
		const frontendTabs = AtomicTabsHelper.createFrontendWidget( driver.page );

		// Assert - Tabs work correctly on frontend after reload
		await frontendTabs.expectTabActive( 0 );
		await frontendTabs.clickTab( 1 );
		await frontendTabs.expectTabActive( 1 );
	} );
} );
