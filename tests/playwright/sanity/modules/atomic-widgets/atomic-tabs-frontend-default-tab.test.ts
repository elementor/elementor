import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Atomic Tabs Frontend Default Tab @atomic-widgets', () => {
	const DEFAULT_TAB_COUNT = 3;
	const SECOND_TAB_INDEX = 2;

	let editor: EditorPage;

	test.beforeEach( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// Arrange - Enable atomic elements and nested elements experiments
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

	test( 'Default first tab panel is visible in frontend without display:none', async () => {
		// Arrange - Add atomic tabs widget
		const tabsId = await editor.addElement( { elType: 'e-tabs' }, 'document' );

		// Act - Publish and view the page in frontend
		await editor.publishAndViewPage();

		const tabsSelector = `[data-id="${ tabsId }"]`;
		const tabsElement = editor.page.locator( tabsSelector );

		// Assert - Check that the atomic tabs element exists and is visible
		await expect( tabsElement ).toBeVisible();

		// Assert - Check that the first tab panel is visible and does not have display:none
		const firstTabPanel = tabsElement.locator( '[data-element_type="e-tab-panel"]' ).first();
		await expect( firstTabPanel ).toBeVisible();

		// Assert - Verify the first tab panel does not have display:none style
		const firstTabPanelStyle = await firstTabPanel.getAttribute( 'style' );
		expect( firstTabPanelStyle ).not.toContain( 'display: none' );

		// Assert - Verify the first tab panel does not have hidden attribute
		const firstTabPanelHidden = await firstTabPanel.getAttribute( 'hidden' );
		expect( firstTabPanelHidden ).toBeNull();
	} );

	test( 'Non-default tab panels are hidden with display:none in frontend', async () => {
		// Arrange - Add atomic tabs widget
		const tabsId = await editor.addElement( { elType: 'e-tabs' }, 'document' );

		// Act - Publish and view the page in frontend
		await editor.publishAndViewPage();

		const tabsSelector = `[data-id="${ tabsId }"]`;
		const tabsElement = editor.page.locator( tabsSelector );

		// Assert - Check that non-first tab panels are hidden
		const allTabPanels = tabsElement.locator( '[data-element_type="e-tab-panel"]' );
		const tabPanelCount = await allTabPanels.count();

		expect( tabPanelCount ).toBe( DEFAULT_TAB_COUNT );

		// Assert - Check that second and third tab panels have display:none
		for ( let i = SECOND_TAB_INDEX; i <= DEFAULT_TAB_COUNT; i++ ) {
			const tabPanel = allTabPanels.nth( i - 1 );
			const tabPanelStyle = await tabPanel.getAttribute( 'style' );
			const tabPanelHidden = await tabPanel.getAttribute( 'hidden' );

			expect( tabPanelStyle ).toContain( 'display: none' );
			expect( tabPanelHidden ).toBe( 'true' );
		}
	} );

	test( 'Clicking tabs switches visible panel in frontend', async () => {
		// Arrange - Add atomic tabs widget
		const tabsId = await editor.addElement( { elType: 'e-tabs' }, 'document' );

		// Act - Publish and view the page in frontend
		await editor.publishAndViewPage();

		const tabsSelector = `[data-id="${ tabsId }"]`;
		const tabsElement = editor.page.locator( tabsSelector );

		const allTabs = tabsElement.locator( '[data-element_type="e-tab"]' );
		const allTabPanels = tabsElement.locator( '[data-element_type="e-tab-panel"]' );

		// Assert - Initially first tab panel is visible
		await expect( allTabPanels.first() ).toBeVisible();
		let firstTabPanelStyle = await allTabPanels.first().getAttribute( 'style' );
		expect( firstTabPanelStyle ).not.toContain( 'display: none' );

		// Act - Click on the second tab
		await allTabs.nth( SECOND_TAB_INDEX - 1 ).click();

		// Assert - Second tab panel becomes visible, first becomes hidden
		const secondTabPanelStyle = await allTabPanels.nth( SECOND_TAB_INDEX - 1 ).getAttribute( 'style' );
		expect( secondTabPanelStyle ).not.toContain( 'display: none' );

		firstTabPanelStyle = await allTabPanels.first().getAttribute( 'style' );
		expect( firstTabPanelStyle ).toContain( 'display: none' );

		// Act - Click on the third tab
		const thirdTabIndex = 3;
		await allTabs.nth( thirdTabIndex - 1 ).click();

		// Assert - Third tab panel becomes visible, second becomes hidden
		const thirdTabPanelStyle = await allTabPanels.nth( thirdTabIndex - 1 ).getAttribute( 'style' );
		expect( thirdTabPanelStyle ).not.toContain( 'display: none' );

		const secondTabPanelStyleAfter = await allTabPanels.nth( SECOND_TAB_INDEX - 1 ).getAttribute( 'style' );
		expect( secondTabPanelStyleAfter ).toContain( 'display: none' );
	} );
} );
