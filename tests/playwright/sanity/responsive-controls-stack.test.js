const { test, expect } = require( '@playwright/test' );
const { viewportSize } = require( '../enums/viewport-sizes' );
const { createPage, deletePage } = require( '../utilities/rest-api' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );
const EditorPage = require( '../pages/editor-page' );

test.describe( 'Responsive Controls Stack', () => {
	const template = {
		name: 'responsive-controls-stack',
		path: '../page-templates/responsive-controls-stack.json',
	};
	let testPageId;

	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
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

	/**
	  This test is checking that the CSS is updated when changing the template responsive controls.
	  In case of Additional breakpoints enabled, while using the template widget.
	 */
	test( 'Template widget responsive controls', async ( { context, page }, testInfo ) => {
		const editor = new EditorPage( page, testInfo );

		await editor.importJsonTemplate( template, editor );

		await editor.gotoPostId( testPageId );

		await editor.addWidget( 'template' );

		await editor.setSelect2ControlValue( 'template_id', template.name, false );

		await editor.publishAndViewPage();

		await page.setViewportSize( viewportSize.mobile );

		// Remove transition to avoid flakiness
		await page.addStyleTag( {
			content: '.elementor-element .elementor-widget-container { transition: none !important; }',
		} );

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

