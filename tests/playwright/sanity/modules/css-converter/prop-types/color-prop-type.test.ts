import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Color Prop Type Integration @prop-types', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic widgets experiments to match manual testing environment
		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdmin.setExperiments( {
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert color properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'color', value: '#ff0000', selector: '[data-test="color-hex-red"]', expected: 'rgb(255, 0, 0)' },
			{ property: 'color', value: '#00ff00', selector: '[data-test="color-hex-green"]', expected: 'rgb(0, 255, 0)' },
			{ property: 'color', value: '#0000ff', selector: '[data-test="color-hex-blue"]', expected: 'rgb(0, 0, 255)' },
			{ property: 'color', value: 'rgb(255, 128, 0)', selector: '[data-test="color-rgb-orange"]', expected: 'rgb(255, 128, 0)' },
			{ property: 'color', value: 'rgba(255, 0, 255, 0.8)', selector: '[data-test="color-rgba-magenta"]', expected: 'rgba(255, 0, 255, 0.8)' },
			{ property: 'color', value: 'red', selector: '[data-test="color-named-red"]', expected: 'rgb(255, 0, 0)' },
		];

		const combinedCssContent = `
			<div>
				<p style="color: #ff0000;" data-test="color-hex-red">Red hex color text</p>
				<p style="color: #00ff00;" data-test="color-hex-green">Green hex color text</p>
				<p style="color: #0000ff;" data-test="color-hex-blue">Blue hex color text</p>
				<p style="color: rgb(255, 128, 0);" data-test="color-rgb-orange">Orange RGB color text</p>
				<p style="color: rgba(255, 0, 255, 0.8);" data-test="color-rgba-magenta">Magenta RGBA color text</p>
				<p style="color: red;" data-test="color-named-red">Named red color text</p>
			</div>
		`;

		// Convert HTML with CSS to Elementor widgets
		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to editor
		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify in editor
		for ( const testCase of testCases ) {
			const element = editor.getPreviewFrame().locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'color', testCase.expected );
		}

		// Save and navigate to frontend
		await editor.saveAndReloadPage();
		await page.goto( editor.getPreviewUrl() );

		// Verify on frontend
		for ( const testCase of testCases ) {
			const element = page.locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'color', testCase.expected );
		}
	} );

	test( 'should handle color short hex and named colors', async ( { page, request } ) => {
		const colorVariationsCssContent = `
			<div>
				<p style="color: #fff;" data-test="color-short-hex-white">Short hex white</p>
				<p style="color: #000;" data-test="color-short-hex-black">Short hex black</p>
				<p style="color: blue;" data-test="color-named-blue">Named blue</p>
				<p style="color: green;" data-test="color-named-green">Named green</p>
				<p style="color: transparent;" data-test="color-transparent">Transparent color</p>
			</div>
		`;

		// Convert and test color variations
		const apiResult = await cssHelper.convertHtmlWithCss( request, colorVariationsCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify color variations in editor
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="color-short-hex-white"]' ) ).toHaveCSS( 'color', 'rgb(255, 255, 255)' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="color-short-hex-black"]' ) ).toHaveCSS( 'color', 'rgb(0, 0, 0)' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="color-named-blue"]' ) ).toHaveCSS( 'color', 'rgb(0, 0, 255)' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="color-named-green"]' ) ).toHaveCSS( 'color', 'rgb(0, 128, 0)' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="color-transparent"]' ) ).toHaveCSS( 'color', 'rgba(0, 0, 0, 0)' );
	} );

	test( 'should handle background-color properties', async ( { page, request } ) => {
		const backgroundColorCssContent = `
			<div>
				<p style="background-color: #ffff00; padding: 10px;" data-test="bg-color-yellow">Yellow background</p>
				<p style="background-color: rgba(0, 255, 255, 0.5); padding: 10px;" data-test="bg-color-cyan">Cyan background with opacity</p>
				<p style="background-color: lightgray; padding: 10px;" data-test="bg-color-lightgray">Light gray background</p>
			</div>
		`;

		// Convert and test background colors
		const apiResult = await cssHelper.convertHtmlWithCss( request, backgroundColorCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify background colors in editor
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="bg-color-yellow"]' ) ).toHaveCSS( 'background-color', 'rgb(255, 255, 0)' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="bg-color-cyan"]' ) ).toHaveCSS( 'background-color', 'rgba(0, 255, 255, 0.5)' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="bg-color-lightgray"]' ) ).toHaveCSS( 'background-color', 'rgb(211, 211, 211)' );
	} );
} );
