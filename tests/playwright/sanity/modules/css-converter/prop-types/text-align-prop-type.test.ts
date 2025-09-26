import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Text Align Prop Type Integration @prop-types', () => {
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

	test( 'should convert text-align properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'text-align', value: 'left', selector: '[data-test="text-align-left"]', expected: 'start' },
			{ property: 'text-align', value: 'center', selector: '[data-test="text-align-center"]', expected: 'center' },
			{ property: 'text-align', value: 'right', selector: '[data-test="text-align-right"]', expected: 'end' },
			{ property: 'text-align', value: 'justify', selector: '[data-test="text-align-justify"]', expected: 'justify' },
			{ property: 'text-align', value: 'start', selector: '[data-test="text-align-start"]', expected: 'start' },
			{ property: 'text-align', value: 'end', selector: '[data-test="text-align-end"]', expected: 'end' },
		];

		const combinedCssContent = `
			<div>
				<p style="text-align: left; width: 300px; border: 1px solid #ccc;" data-test="text-align-left">Left aligned text content that should align to the left side of the container.</p>
				<p style="text-align: center; width: 300px; border: 1px solid #ccc;" data-test="text-align-center">Center aligned text content that should be centered in the container.</p>
				<p style="text-align: right; width: 300px; border: 1px solid #ccc;" data-test="text-align-right">Right aligned text content that should align to the right side of the container.</p>
				<p style="text-align: justify; width: 300px; border: 1px solid #ccc;" data-test="text-align-justify">Justified text content that should be evenly distributed across the full width of the container with equal spacing.</p>
				<p style="text-align: start; width: 300px; border: 1px solid #ccc;" data-test="text-align-start">Start aligned text content using logical property.</p>
				<p style="text-align: end; width: 300px; border: 1px solid #ccc;" data-test="text-align-end">End aligned text content using logical property.</p>
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
			await expect( element ).toHaveCSS( 'text-align', testCase.expected );
		}

		// Save and navigate to frontend
		await editor.saveAndReloadPage();
		await page.goto( editor.getPreviewUrl() );

		// Verify on frontend
		for ( const testCase of testCases ) {
			const element = page.locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'text-align', testCase.expected );
		}
	} );

	test( 'should handle text-align with different content lengths', async ( { page, request } ) => {
		const contentVariationsCssContent = `
			<div>
				<p style="text-align: center; width: 400px; border: 1px solid #ccc;" data-test="short-center">Short</p>
				<p style="text-align: justify; width: 400px; border: 1px solid #ccc;" data-test="long-justify">This is a very long paragraph that should demonstrate the justify text alignment behavior when there is enough content to wrap across multiple lines and show the justification effect properly.</p>
				<p style="text-align: right; width: 400px; border: 1px solid #ccc;" data-test="medium-right">Medium length content for right alignment.</p>
			</div>
		`;

		// Convert and test content variations
		const apiResult = await cssHelper.convertHtmlWithCss( request, contentVariationsCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify content variations in editor
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="short-center"]' ) ).toHaveCSS( 'text-align', 'center' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="long-justify"]' ) ).toHaveCSS( 'text-align', 'justify' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="medium-right"]' ) ).toHaveCSS( 'text-align', 'end' );
	} );
} );
