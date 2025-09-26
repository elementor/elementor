import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Position Prop Type Integration @prop-types', () => {
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

	test( 'should convert position properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'position', value: 'static', selector: '[data-test="position-static"]', expected: 'static' },
			{ property: 'position', value: 'relative', selector: '[data-test="position-relative"]', expected: 'relative' },
			{ property: 'position', value: 'absolute', selector: '[data-test="position-absolute"]', expected: 'absolute' },
			{ property: 'position', value: 'fixed', selector: '[data-test="position-fixed"]', expected: 'fixed' },
			{ property: 'position', value: 'sticky', selector: '[data-test="position-sticky"]', expected: 'sticky' },
		];

		const combinedCssContent = `
			<div style="position: relative; height: 400px;">
				<p style="position: static;" data-test="position-static">Position static</p>
				<p style="position: relative;" data-test="position-relative">Position relative</p>
				<p style="position: absolute; top: 50px; left: 10px;" data-test="position-absolute">Position absolute</p>
				<p style="position: fixed; top: 100px; left: 10px;" data-test="position-fixed">Position fixed</p>
				<p style="position: sticky; top: 0;" data-test="position-sticky">Position sticky</p>
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
			await expect( element ).toHaveCSS( 'position', testCase.expected );
		}

		// Save and navigate to frontend
		await editor.saveAndReloadPage();
		await page.goto( editor.getPreviewUrl() );

		// Verify on frontend
		for ( const testCase of testCases ) {
			const element = page.locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'position', testCase.expected );
		}
	} );

	test( 'should handle position with positioning properties', async ( { page, request } ) => {
		const positioningCssContent = `
			<div style="position: relative; height: 300px;">
				<p style="position: absolute; top: 20px; left: 30px;" data-test="positioned-absolute">Positioned absolute</p>
				<p style="position: relative; top: 10px; left: 15px;" data-test="positioned-relative">Positioned relative</p>
			</div>
		`;

		// Convert and test positioning
		const apiResult = await cssHelper.convertHtmlWithCss( request, positioningCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify positioning in editor
		const absoluteElement = editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="positioned-absolute"]' );
		const relativeElement = editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="positioned-relative"]' );
		
		await expect( absoluteElement ).toHaveCSS( 'position', 'absolute' );
		await expect( relativeElement ).toHaveCSS( 'position', 'relative' );
	} );
} );
