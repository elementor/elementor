import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { setup, setTabItemColor, setTabBorderColor } from './helper';
import _path from 'path';

test.describe( 'Nested Tabs tests @nested-tabs', () => {
	const templatePath = _path.resolve( __dirname, '../../../templates/nested-tabs-with-icons.json' );

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

	test( 'Verify the correct working of the title alignment', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.loadTemplate( templatePath );

		await editor.closeNavigatorIfOpen();

		const thirdItemTitle = editor.getPreviewFrame().locator( '[data-tab-index="3"].e-n-tab-title > .e-n-tab-title-text' );
		await thirdItemTitle.click();

		if ( 0 === await editor.getPreviewFrame().locator( '[data-tab-index="3"].e-n-tab-title[aria-selected="true"]' ).count() ) {
			await thirdItemTitle.click();
		}
		const activeTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' );

		// Act.
		// Tabs styling scenario 1: Direction: Top, Align Title: Left, Icon Position: Right.
		// Set align title to 'start'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-left' );
		// Set icon position to 'right'.
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'icon_section_style' );
		await editor.setChooseControlValue( 'icon_position', 'eicon-h-align-right' );

		await editor.togglePreviewMode();

		// Assert
		expect.soft( await activeTab.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'tabs-direction-top-icon-position-right-align-left.jpeg' );

		await editor.togglePreviewMode();

		// Tabs styling scenario 2: Direction: Left, Align Title: Right, Icon Position: Top.
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).hover();
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .elementor-editor-element-edit' ).first().click();
		// Set Direction: Left.
		await editor.openPanelTab( 'content' );
		await editor.setChooseControlValue( 'tabs_direction', 'eicon-h-align-left' );
		// Set align title to 'right'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-right' );
		// Set icon position to 'top'.
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'icon_section_style' );
		await editor.setChooseControlValue( 'icon_position', 'eicon-v-align-top' );

		// Tabs styling scenario 3: Direction: Top, Align Title: Default, Icon Position: Top, Justify: Stretch.
		// Unset Direction: Left.
		await editor.openPanelTab( 'content' );
		await editor.setChooseControlValue( 'tabs_direction', 'eicon-h-align-left' );
		// Justify: Stretch.
		await editor.setChooseControlValue( 'tabs_justify_horizontal', 'eicon-align-stretch-h' );
		// Unset align title to 'right'.
		await editor.setChooseControlValue( 'title_alignment', 'eicon-text-align-right' );

		await editor.togglePreviewMode();

		// Assert
		expect.soft( await activeTab.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'tabs-direction-top-icon-position-top-align-default.jpeg' );
	} );

	test( 'Verify that the tab width doesn\'t change when changing between normal and active state', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.loadTemplate( templatePath );

		// Act.
		const firstTab = editor.getPreviewFrame().locator( '.e-n-tab-title:first-child' );
		const lastTab = editor.getPreviewFrame().locator( '.e-n-tab-title:last-child' );

		// Set first tab to active tab.
		await firstTab.click();
		// Get last tab width.
		const lastTabWidth = ( await lastTab.boundingBox() ).width;
		// Set last tab to active tab.
		await lastTab.click();
		// Get last tab active width.
		const lastTabActiveWidth = ( await lastTab.boundingBox() ).width;

		// Assert.
		// Verify that the last tab is active.
		await expect.soft( lastTab ).toHaveAttribute( 'aria-selected', 'true' );
		// Check if the normal tab width is equal to the active tab width.
		expect.soft( lastTabWidth ).toEqual( lastTabActiveWidth );
	} );

	test( 'Verify that the custom hover color doesn\'t affect the active tab color', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );

		// Act.
		// Set tab hover color.
		await setTabItemColor( editor, 'tabs', 'tabs_title_hover', 'tabs_title_background_color_hover_color', '#ff0000' );
		// Set tab active color.
		await setTabItemColor( editor, 'tabs', 'tabs_title_active', 'tabs_title_background_color_active_color', '#00ffff' );

		await editor.publishAndViewPage();

		// Hover background style.
		const hoverTabBackgroundColor = 'rgb(255, 0, 0)',
			activeTabBackgroundColor = 'rgb(0, 255, 255)',
			activeTab = page.locator( '.e-n-tab-title[aria-selected="true"]' ),
			nonActiveTab = page.locator( '.e-n-tab-title[aria-selected="false"]:last-child' );

		// Assert.
		// Check that by default the hover color isn't applied.
		await expect.soft( activeTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );
		await expect.soft( activeTab ).toHaveCSS( 'background-color', activeTabBackgroundColor );
		await expect.soft( nonActiveTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );

		// Hover over tab.
		await activeTab.hover();
		// Check that active tab doesn't change background color on hover.
		await expect.soft( activeTab ).not.toHaveCSS( 'background-color', hoverTabBackgroundColor );
		await expect.soft( activeTab ).toHaveCSS( 'background-color', activeTabBackgroundColor );
		// Check that non-active tab receives the hover background color.
		await nonActiveTab.hover();
		await expect.soft( nonActiveTab ).toHaveCSS( 'background-color', hoverTabBackgroundColor );
	} );

	test( 'Check if the hover style changes the normal tab styling', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );

		await editor.openPanelTab( 'style' );
		await editor.setTabControlValue( 'tabs_title_style', 'tabs_title_hover' );
		await editor.setSelectControlValue( 'tabs_title_border_hover_border', 'solid' );
		await editor.setShadowControlValue( 'tabs_title_box_shadow_hover', 'box' );
		await editor.setDimensionsValue( 'tabs_title_border_radius', '15' );

		// Act.
		await editor.publishAndViewPage();

		// Hover background style.
		const borderStyle = 'solid',
			boxShadow = 'rgba(0, 0, 0, 0.5) 0px 0px 10px 0px',
			borderRadius = '15px',
			nonActiveTab = page.locator( '.e-n-tab-title[aria-selected="false"]:last-child' );

		// Assert.
		await nonActiveTab.hover();

		// Check that active tab receives the hover styling.
		await expect.soft( nonActiveTab ).toHaveCSS( 'border-style', borderStyle );
		await expect.soft( nonActiveTab ).toHaveCSS( 'box-shadow', boxShadow );
		await expect.soft( nonActiveTab ).toHaveCSS( 'border-radius', borderRadius );
	} );

	test( 'Verify the correct relationships between normal, hover and active styling', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.loadTemplate( templatePath );
		await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ).click();
		await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"]:last-child' ).click();

		// Hex colors.
		const colorGreen = '#95E46E',
			colorYellow = '#CFE46E',
			colorBlue = '#134FF2',
			colorBrown = '#967008',
			colorRed = '#961708',
			colorPink = '#E1086E',
			colorGreenRgb = 'rgb(149, 228, 110)',
			colorYellowRgb = 'rgb(207, 228, 110)',
			colorBlueRgb = 'rgb(19, 79, 242)',
			colorBrownRgb = 'rgb(150, 112, 8)',
			colorRedRgb = 'rgb(150, 23, 8)',
			colorPinkRgb = 'rgb(225, 8, 110)';

		// Normal tab styling: text color green, border color: green and icon color: yellow.
		await editor.openPanelTab( 'style' );
		// Set text color.
		await setTabItemColor( editor, 'section_title_style', 'title_normal', 'title_text_color', colorGreen );
		// Set border color.
		await setTabBorderColor( editor, 'normal', '', colorGreen, '5' );
		// Set icon color.
		await editor.openPanelTab( 'content' );
		await setTabItemColor( editor, 'icon_section_style', 'icon_section_normal', 'icon_color', colorYellow );
		await editor.openPanelTab( 'content' );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_tabs_style' );

		// Hover tab styling: text color: red, border color: red and icon color: pink.
		// Set text color.
		await setTabItemColor( editor, 'section_title_style', 'title_hover', 'title_text_color_hover', colorRed );
		// Set border color.
		await setTabBorderColor( editor, 'hover', '_hover', colorRed, '5' );
		// Set icon color.
		await editor.openPanelTab( 'content' );
		await setTabItemColor( editor, 'icon_section_style', 'icon_section_hover', 'icon_color_hover', colorPink );
		await editor.openPanelTab( 'content' );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_tabs_style' );

		// Active tab styling: text color: blue, border color: blue and icon color: brown.
		// Set text color.
		await setTabItemColor( editor, 'section_title_style', 'title_active', 'title_text_color_active', colorBlue );
		// Set border color.
		await setTabBorderColor( editor, 'active', '_active', colorBlue, '5' );
		// Set icon color.
		await editor.openPanelTab( 'content' );
		await setTabItemColor( editor, 'icon_section_style', 'icon_section_active', 'icon_color_active', colorBrown );
		await editor.openPanelTab( 'content' );

		// Act.
		await editor.getPreviewFrame().locator( '.e-n-tab-title:first-child' ).click();
		const tabNormal = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"]:last-child' ),
			tabActive = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' );

		// Assert.
		// Normal tab.
		await expect.soft( tabNormal ).toHaveCSS( 'color', colorGreenRgb );
		await expect.soft( tabNormal ).toHaveCSS( 'border-color', colorGreenRgb );
		await expect.soft( tabNormal.locator( 'i:first-child' ) ).toHaveCSS( 'color', colorYellowRgb );
		// Active tab.
		await expect.soft( tabActive ).toHaveCSS( 'color', colorBlueRgb );
		await expect.soft( tabActive ).toHaveCSS( 'border-color', colorBlueRgb );
		await expect.soft( tabActive.locator( 'i:last-child' ) ).toHaveCSS( 'color', colorBrownRgb );

		// Hover normal tab.
		await tabNormal.hover();
		// Normal tab.
		await expect.soft( tabNormal ).toHaveCSS( 'color', colorRedRgb );
		await expect.soft( tabNormal ).toHaveCSS( 'border-color', colorRedRgb );
		await expect.soft( tabNormal.locator( 'i:first-child' ) ).toHaveCSS( 'color', colorPinkRgb );

		// Hover active tab.
		await tabNormal.hover();
		// Active tab.
		await expect.soft( tabActive ).toHaveCSS( 'color', colorBlueRgb );
		await expect.soft( tabActive ).toHaveCSS( 'border-color', colorBlueRgb );
		await expect.soft( tabActive.locator( 'i:last-child' ) ).toHaveCSS( 'color', colorBrownRgb );
	} );
} );
