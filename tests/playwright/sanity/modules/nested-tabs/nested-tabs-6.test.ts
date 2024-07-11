import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { viewportSize } from '../../../enums/viewport-sizes';
import { clickTab, setup } from './helper';

test.describe( 'Nested Tabs tests (e_font_icon_svg: active) @nested-tabs', () => {
	const templatePath = `../templates/nested-tabs-with-icons.json`;

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

	test( 'Check that Nested Tabs css file is loaded from `elementor/assets/css` when `Improved CSS Loading` experiment is active and SCRIPT_DEBUG is false', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( { e_optimized_css_loading: 'active' } );

		const editorPage = await wpAdminPage.openNewPage(),
			container = await editorPage.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editorPage.addWidget( 'nested-tabs', container );
		await editorPage.getPreviewFrame().locator( '.elementor-widget-n-tabs' ).waitFor();

		// Act
		await editorPage.publishAndViewPage();

		// When the `Improved CSS Loading` experiment is active, the Nested Tabs css file is loaded from `elementor/assets/css`.
		const proFilePath = await page.evaluate( () => document.querySelector( '.elementor-widget-n-tabs > .elementor-widget-container > link' ).getAttribute( 'href' ) ),
			isProFilePath = proFilePath.includes( 'elementor/assets/css/widget' ),
			proFileArray = proFilePath.split( '?ver=' ),
			proFileTimestamp = proFileArray[1];

		// Assert
		expect.soft( isProFilePath ).toBeTruthy();
		expect.soft( proFileTimestamp ).toBeDefined();

		await wpAdminPage.setExperiments( { e_optimized_css_loading: 'inactive' } );
	} );
} );
