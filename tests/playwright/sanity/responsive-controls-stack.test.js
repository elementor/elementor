const { test, expect } = require( '@playwright/test' );
const { viewportSize } = require( '../enums/viewport-sizes' );
const { createPage, deletePage } = require( '../utilities/rest-api' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const EditorPage = require( '../pages/editor-page' );

test.describe( 'Responsive Controls Stack', () => {
	let testPageId;
	let wpAdmin;

	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			editor_v2: false,
			additional_custom_breakpoints: true,
		} );
	} );

	test.beforeEach( async () => {
		testPageId = await createPage();
	} );

	test.afterEach( async () => {
		await deletePage( testPageId );
	} );

	test( 'Template widget responsive controls', async ( { context, page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );

		const template = {
			name: 'responsive-controls-stack-widget-template',
			path: '../page-templates/responsive-controls-stack-widget-template.json',
		};

		await editor.importJsonTemplate( template.path );

		await editor.gotoPostId( testPageId );

		waitForNewPage( page, wpAdmin );

		await editor.addWidget( 'template' );

		await editor.setSelect2ControlValue( 'template_id', template.name, false );

		await editor.publishAndViewPage();

		// Remove transition to avoid flakiness
		await page.addStyleTag( {
			content: '.elementor-element .elementor-widget-container { transition: none !important; }',
		} );

		await page.setViewportSize( viewportSize.mobile );

		// Common CSS
		const borderCSS = await page.$eval( '.elementor-widget-heading .elementor-widget-container', ( el ) => {
			return window.getComputedStyle( el ).getPropertyValue( 'border' );
		} );
		expect( borderCSS ).toBe( '23px dotted rgb(51, 51, 51)' );

		// Typography CSS
		const typographyCSS = await page.$eval( 'h2.elementor-heading-title', ( el ) => {
			return window.getComputedStyle( el ).getPropertyValue( 'font-size' );
		} );
		expect( typographyCSS ).toBe( '65px' );
	},
	);

	test( 'Loop Item widget responsive controls', async ( { context, page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );

		const template = {
			name: 'responsive-controls-stack-loop-item-widget',
			path: '../page-templates/responsive-controls-stack-loop-item-widget.json',
		};

		await editor.importJsonTemplate( template.path );

		await editor.gotoPostId( testPageId );

		waitForNewPage( page, wpAdmin );

		await editor.addWidget( 'loop-grid' );

		await editor.setSelect2ControlValue( 'template_id', template.name, false );

		await editor.publishAndViewPage();

		// Remove transition to avoid flakiness
		await page.addStyleTag( {
			content: '.elementor-element .elementor-widget-container { transition: none !important; }',
		} );

		await page.setViewportSize( viewportSize.mobile );

		// Common CSS
		const borderCSS = await page.$eval( '.elementor-loop-container [data-widget_type="theme-post-title.default"] .elementor-widget-container', ( el ) => {
			return window.getComputedStyle( el ).getPropertyValue( 'border' );
		} );
		expect( borderCSS ).toBe( '15px dashed rgb(0, 0, 0)' );

		// Typography CSS
		const typographyCSS = await page.$eval( 'h4.elementor-heading-title', ( el ) => {
			return window.getComputedStyle( el ).getPropertyValue( 'font-size' );
		} );
		expect( typographyCSS ).toBe( '65px' );
	},
	);

	test( 'ShortCode widget responsive controls', async ( { context, page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );
		const shortCodeSelector = 'tr.type-elementor_library [data-colname="Shortcode"] input';

		const template = {
			name: 'responsive-controls-stack-widget-template',
			path: '../page-templates/responsive-controls-stack-widget-template.json',
		};

		await editor.importJsonTemplate( template.path );

		await page.goto( `/wp-admin/edit.php?s=${ template.name }&post_status=all&post_type=elementor_library` );

		await page.waitForSelector( shortCodeSelector );
		const shortCodeValue = await page.locator( shortCodeSelector ).first().inputValue();

		await editor.gotoPostId( testPageId );

		waitForNewPage( page, wpAdmin );

		await editor.addWidget( 'shortcode' );

		await page.waitForSelector( '[data-setting="shortcode"]' );

		await page.locator( '[data-setting="shortcode"]' ).fill( shortCodeValue );

		await editor.publishAndViewPage();

		// Remove transition to avoid flakiness
		await page.addStyleTag( {
			content: '.elementor-element .elementor-widget-container { transition: none !important; }',
		} );

		await page.setViewportSize( viewportSize.mobile );

		// Common CSS
		const borderCSS = await page.$eval( '.elementor-widget-heading .elementor-widget-container', ( el ) => {
			return window.getComputedStyle( el ).getPropertyValue( 'border' );
		} );
		expect( borderCSS ).toBe( '23px dotted rgb(51, 51, 51)' );

		// Typography CSS
		const typographyCSS = await page.$eval( 'h2.elementor-heading-title', ( el ) => {
			return window.getComputedStyle( el ).getPropertyValue( 'font-size' );
		} );
		expect( typographyCSS ).toBe( '65px' );
	},
	);
} );

const waitForNewPage = async ( page, wpAdmin ) => {
	await page.waitForLoadState( 'load', { timeout: 20000 } );
	await wpAdmin.waitForPanel();
	await wpAdmin.closeAnnouncementsIfVisible();
};
