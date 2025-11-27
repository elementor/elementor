import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import _path from 'path';

test.describe( 'Nested Tabs tests @nested-tabs', () => {
	test( 'Accessibility inside the Editor', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		await editor.addWidget( { widgetType: 'button' } );

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

		await editor.addWidget( { widgetType: 'button' } );

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
		await editor.addWidget( { widgetType: 'nested-tabs', container } );
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
			parentWidgetId = await editor.addWidget( { widgetType: 'nested-tabs', container } ),
			tabsContainer = editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .e-con.e-active` ),
			tabsContainerId = await tabsContainer.getAttribute( 'data-id' );

		await editor.addWidget( { widgetType: 'nested-tabs', container: tabsContainerId } );
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
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"]` ) ).toHaveCSS( 'justify-content', 'flex-start' );
		// Check if title's are aligned on the center for the child widget.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .elementor-element > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"]` ) ).toHaveCSS( 'justify-content', 'center' );
		// Check if parent widget has red tabs.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"] + .e-n-tab-title` ) ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
		// Check if child widget doesn't have red tabs.
		await expect.soft( editor.getPreviewFrame().locator( `.elementor-element-${ parentWidgetId } .e-n-tabs-content .elementor-element > .e-n-tabs > .e-n-tabs-heading .e-n-tab-title[aria-selected="true"] + .e-n-tab-title` ) ).not.toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
	} );

	test( 'Keyboard navigation with arrow keys after changing tab CSS ID', async ( { page, apiRequests }, testInfo ) => {
		// Arrange
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			frame = editor.getPreviewFrame();

		const filePath = _path.resolve( __dirname, `./templates/tabs-accessibility.json` );
		await editor.loadTemplate( filePath, false );
		await frame.waitForSelector( '.e-n-tabs' );

		const customCssId = 'custom-tab-id';

		// Act
		await test.step( 'Change CSS ID of second tab in content tab', async () => {
			// Selecting by tabs widget id as it is in the template
			await editor.selectElement( '72570cbd' );
			await editor.waitForPanelToLoad();
			await editor.openPanelTab( 'content' );
			await editor.openSection( 'section_tabs' );

			await page.locator( '.elementor-control-tabs .elementor-repeater-fields' ).nth( 1 ).waitFor( { state: 'visible' } );
			await page.locator( '.elementor-control-tabs .elementor-repeater-fields' ).nth( 1 ).click();

			const elementIdInput = page.locator( '.elementor-control-tabs .elementor-repeater-fields' ).nth( 1 ).locator( '.elementor-control-element_id input' );
			await elementIdInput.waitFor( { state: 'visible', timeout: 10000 } );
			await elementIdInput.click();
			await elementIdInput.fill( customCssId );

			// Assert
			await expect( elementIdInput ).toHaveValue( customCssId );
		} );

		await test.step( 'Verify keyboard navigation still works after CSS ID change', async () => {
			const tabTitleOne = frame.locator( '.e-n-tab-title >> nth=0' ),
				tabTitleTwo = frame.locator( '.e-n-tab-title >> nth=1' ),
				tabTitleThree = frame.locator( '.e-n-tab-title >> nth=2' );

			// Assert
			await tabTitleOne.click();
			await tabTitleOne.focus();
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );

			await page.keyboard.press( 'ArrowRight' );
			await expect( tabTitleTwo ).toBeFocused();
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'false' );

			await page.keyboard.press( 'ArrowRight' );
			await expect( tabTitleThree ).toBeFocused();
			await expect( tabTitleThree ).toHaveAttribute( 'aria-selected', 'false' );

			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleTwo ).toBeFocused();
			await expect( tabTitleTwo ).toHaveAttribute( 'aria-selected', 'false' );

			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleOne ).toBeFocused();
			await expect( tabTitleOne ).toHaveAttribute( 'aria-selected', 'true' );

			await page.keyboard.press( 'ArrowLeft' );
			await expect( tabTitleThree ).toBeFocused();
			await expect( tabTitleThree ).toHaveAttribute( 'aria-selected', 'false' );
		} );
	} );
} );
