import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Font Size Prop Type Integration @prop-types', () => {
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

	test( 'should convert font-size properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'font-size', value: '12px', selector: '[data-test="font-size-12px"]', expected: '12px' },
			{ property: 'font-size', value: '16px', selector: '[data-test="font-size-16px"]', expected: '16px' },
			{ property: 'font-size', value: '24px', selector: '[data-test="font-size-24px"]', expected: '24px' },
			{ property: 'font-size', value: '1.5em', selector: '[data-test="font-size-em"]', expected: '1.5em' },
			{ property: 'font-size', value: '1.2rem', selector: '[data-test="font-size-rem"]', expected: '1.2rem' },
			{ property: 'font-size', value: '120%', selector: '[data-test="font-size-percent"]', expected: '120%' },
		];

		const combinedCssContent = `
			<div>
				<p style="font-size: 12px;" data-test="font-size-12px">Small font size 12px</p>
				<p style="font-size: 16px;" data-test="font-size-16px">Normal font size 16px</p>
				<p style="font-size: 24px;" data-test="font-size-24px">Large font size 24px</p>
				<p style="font-size: 1.5em;" data-test="font-size-em">Font size in em units</p>
				<p style="font-size: 1.2rem;" data-test="font-size-rem">Font size in rem units</p>
				<p style="font-size: 120%;" data-test="font-size-percent">Font size in percentage</p>
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
			await expect( element ).toHaveCSS( 'font-size', testCase.expected );
		}

		// Save and navigate to frontend
		await editor.saveAndReloadPage();
		await page.goto( editor.getPreviewUrl() );

		// Verify on frontend
		for ( const testCase of testCases ) {
			const element = page.locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'font-size', testCase.expected );
		}
	} );

	test( 'should handle font-size viewport and named values', async ( { page, request } ) => {
		const fontSizeVariationsCssContent = `
			<div>
				<p style="font-size: 4vw;" data-test="font-size-vw">Font size in viewport width</p>
				<p style="font-size: 3vh;" data-test="font-size-vh">Font size in viewport height</p>
				<p style="font-size: large;" data-test="font-size-large">Large named font size</p>
				<p style="font-size: small;" data-test="font-size-small">Small named font size</p>
				<p style="font-size: x-large;" data-test="font-size-x-large">Extra large named font size</p>
			</div>
		`;

		// Convert and test font size variations
		const apiResult = await cssHelper.convertHtmlWithCss( request, fontSizeVariationsCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify font size variations in editor
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="font-size-vw"]' ) ).toHaveCSS( 'font-size', '4vw' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="font-size-vh"]' ) ).toHaveCSS( 'font-size', '3vh' );
		
		// Named font sizes may be computed differently by browsers, so we check they're applied
		const largeElement = editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="font-size-large"]' );
		const smallElement = editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="font-size-small"]' );
		const xLargeElement = editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="font-size-x-large"]' );
		
		await expect( largeElement ).toBeVisible();
		await expect( smallElement ).toBeVisible();
		await expect( xLargeElement ).toBeVisible();
	} );

	test( 'should handle font-size decimal and edge values', async ( { page, request } ) => {
		const edgeCaseCssContent = `
			<div>
				<p style="font-size: 14.5px;" data-test="font-size-decimal">Decimal font size</p>
				<p style="font-size: 0.8em;" data-test="font-size-small-em">Small em font size</p>
				<p style="font-size: 2.5rem;" data-test="font-size-large-rem">Large rem font size</p>
			</div>
		`;

		// Convert and test edge cases
		const apiResult = await cssHelper.convertHtmlWithCss( request, edgeCaseCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify edge cases in editor
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="font-size-decimal"]' ) ).toHaveCSS( 'font-size', '14.5px' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="font-size-small-em"]' ) ).toHaveCSS( 'font-size', '0.8em' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="font-size-large-rem"]' ) ).toHaveCSS( 'font-size', '2.5rem' );
	} );
} );
