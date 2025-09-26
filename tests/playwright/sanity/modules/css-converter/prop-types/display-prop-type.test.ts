import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Display Prop Type Integration @prop-types', () => {
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

	test( 'should convert display properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'display', value: 'block', selector: '[data-test="display-block"]', expected: 'block' },
			{ property: 'display', value: 'inline', selector: '[data-test="display-inline"]', expected: 'inline' },
			{ property: 'display', value: 'inline-block', selector: '[data-test="display-inline-block"]', expected: 'inline-block' },
			{ property: 'display', value: 'flex', selector: '[data-test="display-flex"]', expected: 'flex' },
			{ property: 'display', value: 'inline-flex', selector: '[data-test="display-inline-flex"]', expected: 'inline-flex' },
			{ property: 'display', value: 'grid', selector: '[data-test="display-grid"]', expected: 'grid' },
			{ property: 'display', value: 'inline-grid', selector: '[data-test="display-inline-grid"]', expected: 'inline-grid' },
			{ property: 'display', value: 'none', selector: '[data-test="display-none"]', expected: 'none' },
		];

		const combinedCssContent = `
			<div>
				<p style="display: block;" data-test="display-block">Display block</p>
				<p style="display: inline;" data-test="display-inline">Display inline</p>
				<p style="display: inline-block;" data-test="display-inline-block">Display inline-block</p>
				<p style="display: flex;" data-test="display-flex">Display flex</p>
				<p style="display: inline-flex;" data-test="display-inline-flex">Display inline-flex</p>
				<p style="display: grid;" data-test="display-grid">Display grid</p>
				<p style="display: inline-grid;" data-test="display-inline-grid">Display inline-grid</p>
				<p style="display: none;" data-test="display-none">Display none</p>
			</div>
		`;

		// Convert HTML with CSS to Elementor widgets
		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to editor
		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify in editor (skip display: none as it won't be visible)
		for ( const testCase of testCases ) {
			if ( testCase.value === 'none' ) continue;
			
			const element = editor.getPreviewFrame().locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'display', testCase.expected );
		}

		// Save and navigate to frontend
		await editor.saveAndReloadPage();
		await page.goto( editor.getPreviewUrl() );

		// Verify on frontend (skip display: none as it won't be visible)
		for ( const testCase of testCases ) {
			if ( testCase.value === 'none' ) continue;
			
			const element = page.locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'display', testCase.expected );
		}
	} );

	test( 'should handle display special values', async ( { page, request } ) => {
		const specialValuesCssContent = `
			<div>
				<p style="display: flow-root;" data-test="display-flow-root">Display flow-root</p>
				<p style="display: contents;" data-test="display-contents">Display contents</p>
			</div>
		`;

		// Convert and test special values
		const apiResult = await cssHelper.convertHtmlWithCss( request, specialValuesCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		await editor.loadTemplate( apiResult.post_id );

		// Verify special values in editor
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="display-flow-root"]' ) ).toHaveCSS( 'display', 'flow-root' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="display-contents"]' ) ).toHaveCSS( 'display', 'contents' );
	} );
} );
