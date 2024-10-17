import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { setup } from './helper';
import _path from 'path';

test.describe( 'Nested Tabs tests @nested-tabs', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await setup( wpAdmin );

		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();

		await page.close();
	} );

	test( 'Accessibility inside the Editor', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await editor.addWidget( 'button' );

		// Load template.
		const filePath = _path.resolve( __dirname, `./templates/tabs-accessibility.json` );
		await editor.loadTemplate( filePath, false );
		await frame.waitForSelector( '.e-n-tabs' );

		await test.step( 'Keyboard handling inside the Editor', async () => {
			const tabTitleOne = frame.locator( '.e-n-tab-title >> nth=0' ),
				tabTitleTwo = frame.locator( '.e-n-tab-title >> nth=1' ),
				tabTitleThree = frame.locator( '.e-n-tab-title >> nth=2' ),
				button1 = frame.locator( '.elementor-button >> nth=0' ),
				button2 = frame.locator( '.elementor-button >> nth=1' ),
				buttonBelow = frame.locator( '.elementor-button >> nth=3' );

			// Assert.
			await tabTitleOne.focus();
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Shift+Tab' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Tab' );
			await expect( buttonBelow ).toBeFocused();
			await page.keyboard.press( 'Shift+Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Escape' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleThree ).toBeFocused();
			await expect( tabTitleThree ).toHaveAttribute( 'aria-selected', 'false' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleTwo ).toBeFocused();
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'false' );
			await page.keyboard.press( 'Enter' );
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button2 ).toBeFocused();
			await page.keyboard.press( 'Tab' );
			await expect( buttonBelow ).toBeFocused();
		} );
	} );

	test( 'Accessibility on the Front End', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await editor.addWidget( 'button' );

		// Load template.
		const filePath = _path.resolve( __dirname, `./templates/tabs-accessibility.json` );
		await editor.loadTemplate( filePath, false );
		await frame.waitForSelector( '.e-n-tabs' );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		await test.step( 'Keyboard handling on the Front End', async () => {
			const tabTitleOne = page.locator( '.e-n-tab-title >> nth=0' ),
				tabTitleTwo = page.locator( '.e-n-tab-title >> nth=1' ),
				tabTitleThree = page.locator( '.e-n-tab-title >> nth=2' ),
				button1 = page.locator( '.elementor-button >> nth=0' ),
				button2 = page.locator( '.elementor-button >> nth=1' ),
				buttonBelow = page.locator( '.elementor-button >> nth=3' );

			// Assert.
			await page.locator( '.page-header' ).click();

			await page.keyboard.press( 'Tab' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Shift+Tab' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Tab' );
			await expect( buttonBelow ).toBeFocused();
			await page.keyboard.press( 'Shift+Tab' );
			await expect( button1 ).toBeFocused();
			await page.keyboard.press( 'Escape' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleThree ).toBeFocused();
			await expect( tabTitleThree ).toHaveAttribute( 'aria-selected', 'false' );
			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleTwo ).toBeFocused();
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'false' );
			await page.keyboard.press( 'Enter' );
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'true' );
			await page.keyboard.press( 'Tab' );
			await expect( button2 ).toBeFocused();
			await page.keyboard.press( 'Tab' );
			await expect( buttonBelow ).toBeFocused();
		} );

		await test.step( '@axe-core/playwright', async () => {
			await editor.axeCoreAccessibilityTest( page, '.elementor-widget-n-tabs' );
		} );
	} );

	test( 'Title alignment setting', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Act.
		// Set tabs direction to 'stretch'.
		await editor.setChooseControlValue( 'tabs_justify_horizontal', 'eicon-align-stretch-h' );
		// Set align title to 'start'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-left' );

		// Assert.
		// Check if title's are aligned on the left.
		await expect.soft( editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' ) ).toHaveCSS( 'justify-content', 'flex-start' );
	} );

	test( 'Verify the separation of the parent and child nested tabs styling', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			parentWidgetId = await editor.addWidget( 'nested-tabs', container ),
			tabsContainer = editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .e-con.e-active` ),
			tabsContainerId = await tabsContainer.getAttribute( 'data-id' );

		await editor.addWidget( 'nested-tabs', tabsContainerId );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-n-tabs-content .e-con.e-active' );

		await editor.closeNavigatorIfOpen();

		// Act.
		// Set tabs direction to 'stretch' for parent widget.
		await editor.selectElement( parentWidgetId );
		await editor.setChooseControlValue( 'tabs_justify_horizontal', 'eicon-align-stretch-h' );
		// Set align title to 'start'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-left' );
		await editor.openPanelTab( 'style' );
		await editor.setChooseControlValue( 'tabs_title_background_color_background', 'eicon-paint-brush' );
		await editor.setColorControlValue( 'tabs_title_background_color_color', '#ff0000' );

		// Assert.
		// Check if title's are aligned on the left for the parent widget.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"]` ) ).toHaveCSS( 'justify-content', 'flex-start' );
		// Check if title's are aligned on the center for the child widget.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .elementor-element > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"]` ) ).toHaveCSS( 'justify-content', 'center' );
		// Check if parent widget has red tabs.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"] + .e-n-tab-title` ) ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
		// Check if child widget doesn't have red tabs.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .elementor-element > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"] + .e-n-tab-title` ) ).not.toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
	} );
} );
