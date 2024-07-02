import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { viewportSize } from '../../../enums/viewport-sizes';
import { testTabIsVisibleInAccordionView } from './tests/accordion';
import { testIconCount } from './tests/icons';
import { testCarouselIsVisibleWhenUsingDirectionRightOrLeft } from './tests/carousel';
import { testTitlesWithHTML } from './tests/titles-with-html';
import { clickTab, setup, setTabItemColor } from './helper';
import ImageCarousel from '../../../pages/widgets/image-carousel';

test.describe( 'Nested Tabs tests @nested-tabs', () => {
	const templatePath = `../templates/nested-tabs-with-icons.json`;

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

	test.describe( 'e_font_icon_svg: active', () => {
		test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
			const page = await browser.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.resetExperiments();
			await setup( wpAdmin, { e_font_icon_svg: 'active' } );

			await page.close();
		} );

		test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
			const context = await browser.newContext();
			const page = await context.newPage();
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			await wpAdmin.resetExperiments();
			await setup( wpAdmin );

			await page.close();
		} );

		test( `Check visibility of icon svg file when font icons experiment is active`, async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			await editor.loadTemplate( templatePath );
			await editor.publishAndViewPage();
			await page.waitForSelector( '.elementor-widget-n-tabs' );

			// Set published page variables
			const icon = page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:first-child' ).first(),
				activeTabIcon = page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:last-child' ).first(),
				currentContext = page;

			// Assert
			await expect.soft( activeTabIcon ).toBeVisible();
			await clickTab( currentContext, 1 );
			await expect.soft( icon ).toBeVisible();
			await clickTab( currentContext, 0 );
		} );

		test( `Check the icon size on frontend`, async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();
			await editor.loadTemplate( templatePath );

			await editor.closeNavigatorIfOpen();

			// Set icon size.
			await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).hover();
			await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .elementor-editor-element-edit' ).first().click();
			await editor.openPanelTab( 'style' );
			await editor.openSection( 'icon_section_style' );
			await editor.setSliderControlValue( 'icon_size', '50' );
			await editor.publishAndViewPage();

			// Set published page variables
			const icon = page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:first-child' ).first(),
				activeTabIcon = page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg:last-child' ).first(),
				currentContext = page;

			// Assert
			await expect.soft( activeTabIcon ).toBeVisible();
			await expect.soft( activeTabIcon ).toHaveCSS( 'width', '50px' );
			await clickTab( currentContext, 1 );
			await expect.soft( icon ).toBeVisible();
			await expect.soft( icon ).toHaveCSS( 'width', '50px' );
			await clickTab( currentContext, 0 );
		} );

		test( 'Check if the svg icons are visible on mobile display on the front end', async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = await wpAdmin.openNewPage();

			await editor.loadTemplate( templatePath );

			// Act.
			// Open front end.
			await editor.publishAndViewPage();
			await page.waitForSelector( '.elementor-widget-n-tabs' );

			// Assert
			await page.setViewportSize( viewportSize.mobile );
			await expect.soft( page.locator( '.e-n-tab-title[aria-selected="true"] .e-n-tab-icon' ) ).toBeVisible();
			await page.setViewportSize( viewportSize.desktop );
		} );
	} );

	test( 'General test', async ( { page, apiRequests }, testInfo ) => {
		const imageCarousel = new ImageCarousel( page, testInfo );
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Tests.
		await testIconCount( editor );
		await testTitlesWithHTML( page, editor );
		await testCarouselIsVisibleWhenUsingDirectionRightOrLeft( page, editor, imageCarousel );
		await testTabIsVisibleInAccordionView( page, editor );
	} );

	test( 'Responsive breakpoints for Nested Tabs', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]' );

		// Act.
		await editor.openSection( 'section_tabs_responsive' );
		await editor.setSelectControlValue( 'breakpoint_selector', 'mobile' );

		const desktopTabWrapper = editor.getPreviewFrame().locator( '.e-n-tabs-heading' );

		// Assert.
		// Check if the correct tabs are displayed on tablet view.
		await editor.changeResponsiveView( 'tablet' );
		await expect.soft( desktopTabWrapper ).toHaveCSS( 'display', 'flex' );

		// Check if the correct tabs are displayed on mobile view.
		await editor.changeResponsiveView( 'mobile' );
		await expect.soft( desktopTabWrapper ).toHaveCSS( 'display', 'contents' );
	} );

	test( 'Verify that the icons don\'t disappear when the tab title is updated', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.loadTemplate( templatePath );

		await editor.closeNavigatorIfOpen();

		// Act.
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).hover();
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .elementor-editor-element-edit' ).first().click();
		const activeTabSpanCount = await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"] span' ).count();

		// Update active tab title.
		await page.locator( '.elementor-repeater-fields:nth-child( 3 )' ).click();
		await page.locator( '.elementor-repeater-fields:nth-child( 3 ) .elementor-control-tab_title input' ).fill( 'Title change' );
		const activeTabUpdatedSpanCount = await editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"] span' ).count();

		// Assert.
		expect.soft( activeTabSpanCount ).toBe( 2 );
		expect.soft( activeTabUpdatedSpanCount ).toBe( 2 );
	} );

	test( 'Check if the icons are visible on mobile display on the front end', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.loadTemplate( templatePath );

		// Act.
		// Open front end.
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Assert
		await page.setViewportSize( viewportSize.mobile );
		await expect.soft( page.locator( '.e-n-tab-title[aria-selected="true"] .e-n-tab-icon' ) ).toBeVisible();
		await page.setViewportSize( viewportSize.desktop );
	} );

	test( 'Check Gap between tabs and Space between tabs controls in mobile view', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );

		// Act.
		await editor.openSection( 'section_tabs_responsive' );
		await editor.setSelectControlValue( 'breakpoint_selector', 'mobile' );
		await editor.openPanelTab( 'style' );

		// Change responsive view to mobile
		await editor.changeResponsiveView( 'mobile' );

		// Set controls values.
		await editor.setSliderControlValue( 'tabs_title_spacing_mobile', '50' );
		await editor.setSliderControlValue( 'tabs_title_space_between_mobile', '25' );

		const activeTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ),
			lastTab = editor.getPreviewFrame().locator( '.e-n-tab-title' ).last();

		// Assert.
		await expect.soft( activeTab ).toHaveCSS( 'margin-bottom', '50px' );
		await expect.soft( lastTab ).toHaveCSS( 'margin-top', '25px' );
	} );

	test( 'Check that the hover affects non-active tab only', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"]' );

		// Act.
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_title_style' );
		await editor.setTabControlValue( 'title_style', 'title_hover' );
		await editor.setColorControlValue( 'title_text_color_hover', '#ff0000' );

		const rgbColor = 'rgb(255, 0, 0)';
		const activeTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' ).first(),
			notActiveTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"]' ).first();

		// Verify that the activate tab doesn't take on the hover color.
		await activeTab.hover();
		await expect.soft( activeTab ).not.toHaveCSS( 'color', rgbColor );
		// Verify that the non active tab does take on the hover color.
		await notActiveTab.hover();
		await expect.soft( notActiveTab ).toHaveCSS( 'color', rgbColor );
	} );

	test( 'Check that icon color does not affect the tab text color', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.loadTemplate( templatePath );

		await editor.closeNavigatorIfOpen();

		// Act.
		// Set icon hover color.
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).hover();
		await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .elementor-editor-element-edit' ).first().click();
		await setTabItemColor( editor, 'icon_section_style', 'icon_section_hover', 'icon_color_hover', '#ff0000' );

		const redColor = 'rgb(255, 0, 0)',
			whiteColor = 'rgb(255, 255, 255)',
			nonActiveTabIcon = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"] > .e-n-tab-icon i:first-child' ).first(),
			nonActiveTabTitle = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="false"] > .e-n-tab-title-text' ).first();

		// Assert.
		// Check color differences in non active tab.
		await editor.getPreviewFrame().waitForSelector( '.e-n-tab-title[aria-selected="true"] > .e-n-tab-icon' );
		await nonActiveTabIcon.hover();
		await expect.soft( nonActiveTabIcon ).toHaveCSS( 'color', redColor );
		await expect.soft( nonActiveTabTitle ).toHaveCSS( 'color', whiteColor );
	} );
} );
