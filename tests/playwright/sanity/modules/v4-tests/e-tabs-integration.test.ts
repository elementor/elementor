import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';
import { DriverFactory } from '../../../drivers/driver-factory';
import type { EditorDriver } from '../../../drivers/editor-driver';
import { AtomicTabsHelper } from '../../../pages/widgets/atomic-tabs';
import { AtomicTabsSelectors } from '../../../selectors/atomic-tabs-selectors';
import { AtomicWidgetsSelectors } from '../../../selectors/atomic-widgets-selectors';

test.describe( 'E-Tabs Integration Tests @v4-tests', () => {
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

	test( 'TC-007: Add atomic widgets inside tab content panels', async () => {
		// Arrange
		await driver.createNewPage( true );
		const tabsId = await AtomicTabsHelper.addTabsWidget( driver.editor );
		const tabs = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsId );

		// Act - Get Tab 1 content area and add e-heading widget
		const tab1ContentId = await tabs.getTabContentId( 0 );
		const headingId = await driver.editor.addWidget( { widgetType: 'e-heading', container: tab1ContentId } );

		// Assert - Heading is visible in Tab 1
		const headingWidget = driver.editor.getPreviewFrame().locator( driver.editor.getWidgetSelector( headingId ) );
		await expect( headingWidget ).toBeVisible();

		// Act - Add e-button widget to Tab 1 content
		const buttonId = await driver.editor.addWidget( { widgetType: 'e-button', container: tab1ContentId } );
		const buttonWidget = driver.editor.getPreviewFrame().locator( driver.editor.getWidgetSelector( buttonId ) );
		await expect( buttonWidget ).toBeVisible();

		// Act - Publish and view frontend
		await driver.editor.publishAndViewPage();
		const frontendTabs = AtomicTabsHelper.createFrontendWidget( driver.page );

		// Assert - Tab 1 is active and shows widgets
		await frontendTabs.expectTabActive( 0 );
		await expect( driver.page.locator( AtomicWidgetsSelectors.heading.base ).first() ).toBeVisible();
		await expect( driver.page.locator( AtomicWidgetsSelectors.button.base ).first() ).toBeVisible();
	} );

	test( 'TC-008: E-tabs with e-button inside tab content', async () => {
		// Arrange
		await driver.createNewPage( true );
		const tabsId = await AtomicTabsHelper.addTabsWidget( driver.editor );
		const tabs = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsId );

		// Act - Get Tab 1 content and add e-button
		const tab1ContentId = await tabs.getTabContentId( 0 );
		await driver.editor.addWidget( { widgetType: 'e-button', container: tab1ContentId } );

		// Act - Publish and view frontend
		await driver.editor.publishAndViewPage();
		const frontendTabs = AtomicTabsHelper.createFrontendWidget( driver.page );

		// Assert - Button visible in Tab 1
		await frontendTabs.expectTabActive( 0 );
		const frontendButton = driver.page.locator( AtomicWidgetsSelectors.button.base ).first();
		await expect( frontendButton ).toBeVisible();

		// Act - Switch to Tab 2
		await frontendTabs.clickTab( 1 );
		await frontendTabs.expectTabActive( 1 );

		// Act - Switch back to Tab 1
		await frontendTabs.clickTab( 0 );

		// Assert - Button still visible after tab switching
		await expect( frontendButton ).toBeVisible();
	} );

	test( 'TC-009: Multiple e-tabs widgets on same page', async () => {
		// Arrange
		await driver.createNewPage( true );

		// Act - Add first e-tabs widget
		const tabsAId = await AtomicTabsHelper.addTabsWidget( driver.editor );
		const tabsA = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsAId );

		// Act - Add second e-tabs widget
		const tabsBId = await AtomicTabsHelper.addTabsWidget( driver.editor );
		const tabsB = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsBId );

		// Assert - Both tabs widgets exist
		await tabsA.expectVisible();
		await tabsB.expectVisible();

		// Act - Publish and view frontend
		await driver.editor.publishAndViewPage();

		// Assert - Both tabs widgets rendered
		const allTabsContainers = driver.page.locator( AtomicTabsSelectors.container );
		await expect( allTabsContainers ).toHaveCount( 2 );

		// Arrange - Get tab elements for both widgets
		const frontendTabsA = AtomicTabsHelper.createFrontendWidget( driver.page, tabsAId );
		const frontendTabsB = AtomicTabsHelper.createFrontendWidget( driver.page, tabsBId );

		// Assert - Tab 1 is active in both widgets initially
		await frontendTabsA.expectTabActive( 0 );
		await frontendTabsB.expectTabActive( 0 );

		// Act - Click Tab 2 in Tabs A
		await frontendTabsA.clickTab( 1 );

		// Assert - Only Tabs A switches, Tabs B unchanged
		await frontendTabsA.expectTabActive( 1 );
		await frontendTabsA.expectTabInactive( 0 );
		await frontendTabsB.expectTabActive( 0 );

		// Act - Click Tab 3 in Tabs B
		await frontendTabsB.clickTab( 2 );

		// Assert - Only Tabs B switches, Tabs A remains on Tab 2
		await frontendTabsB.expectTabActive( 2 );
		await frontendTabsB.expectTabInactive( 0 );
		await frontendTabsA.expectTabActive( 1 );
	} );

	test( 'TC-010: E-tabs nested inside container with sibling widgets', async () => {
		// Arrange
		await driver.createNewPage( true );

		// Act - Add container
		const containerId = await driver.editor.addElement( { elType: 'container' }, 'document' );

		// Act - Add e-heading widget to container
		await driver.editor.addWidget( { widgetType: 'e-heading', container: containerId } );

		// Act - Add e-tabs widget to container (below heading)
		const tabsId = await AtomicTabsHelper.addTabsWidget( driver.editor, containerId );
		const tabs = AtomicTabsHelper.createEditorWidget( driver.editor.getPreviewFrame(), tabsId );

		// Act - Add e-paragraph widget to container (below tabs)
		await driver.editor.addWidget( { widgetType: 'e-paragraph', container: containerId } );

		// Assert - Tabs visible in editor
		await tabs.expectVisible();

		// Act - Publish and view frontend
		await driver.editor.publishAndViewPage();

		// Assert - Heading visible
		const frontendHeading = driver.page.locator( AtomicWidgetsSelectors.heading.base ).first();
		await expect( frontendHeading ).toBeVisible();

		// Assert - Paragraph visible
		const frontendParagraph = driver.page.locator( AtomicWidgetsSelectors.paragraph.base ).first();
		await expect( frontendParagraph ).toBeVisible();

		// Assert - Tabs work correctly
		const frontendTabs = AtomicTabsHelper.createFrontendWidget( driver.page );
		await frontendTabs.expectTabActive( 0 );

		// Act - Switch to Tab 2
		await frontendTabs.clickTab( 1 );

		// Assert - Tab switching works
		await frontendTabs.expectTabActive( 1 );

		// Assert - Heading and paragraph still visible after tab switch
		await expect( frontendHeading ).toBeVisible();
		await expect( frontendParagraph ).toBeVisible();
	} );
} );
