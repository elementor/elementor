import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Height Prop Type Integration @prop-types', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic widgets experiments to match manual testing environment
		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdminPage.setExperiments( {
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert height properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'height', value: '200px', selector: '[data-test="height-px"]', expected: '200px' },
			{ property: 'min-height', value: '100px', selector: '[data-test="min-height-px"]', expected: '100px' },
			{ property: 'max-height', value: '300px', selector: '[data-test="max-height-px"]', expected: '300px' },
			{ property: 'height', value: '50vh', selector: '[data-test="height-vh"]', expected: '50vh' },
			{ property: 'height', value: '10em', selector: '[data-test="height-em"]', expected: '10em' },
			{ property: 'height', value: 'auto', selector: '[data-test="height-auto"]', expected: 'auto' },
		];

		const combinedCssContent = `
			<div style="display: flex; flex-direction: column;">
				<p style="height: 200px;">Height 200px</p>
				<p style="min-height: 100px;">Min height 100px</p>
				<p style="max-height: 300px;">Max height 300px</p>
				<p style="height: 50vh;">Height 50vh</p>
				<p style="height: 10em;">Height 10em</p>
				<p style="height: auto;">Height auto</p>
			</div>
		`;

		// Convert HTML with CSS to Elementor widgets
		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to editor
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify in editor
		for ( const testCase of testCases ) {
			const element = editor.getPreviewFrame().locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();

			if ( 'height' === testCase.property && testCase.value !== 'auto' ) {
				await expect( element ).toHaveCSS( 'height', testCase.expected );
			} else if ( 'min-height' === testCase.property ) {
				await expect( element ).toHaveCSS( 'min-height', testCase.expected );
			} else if ( 'max-height' === testCase.property ) {
				await expect( element ).toHaveCSS( 'max-height', testCase.expected );
			}
		}

		// Save and navigate to frontend
		await editor.saveAndReloadPage();
		await page.goto( editor.getPreviewUrl() );

		// Verify on frontend
		for ( const testCase of testCases ) {
			const element = page.locator( '.e-paragraph-base' ).locator( testCase.selector );
			await expect( element ).toBeVisible();

			if ( 'height' === testCase.property && testCase.value !== 'auto' ) {
				await expect( element ).toHaveCSS( 'height', testCase.expected );
			} else if ( 'min-height' === testCase.property ) {
				await expect( element ).toHaveCSS( 'min-height', testCase.expected );
			} else if ( 'max-height' === testCase.property ) {
				await expect( element ).toHaveCSS( 'max-height', testCase.expected );
			}
		}
	} );

	test( 'should handle height edge cases and special values', async ( { page, request } ) => {
		const edgeCaseCssContent = `
			<div style="display: flex; flex-direction: column;">
				<p style="height: 0px;">Height zero</p>
				<p style="height: 1.5rem;">Height decimal</p>
				<p style="min-height: 0;">Min height zero</p>
				<p style="max-height: 100%;">Max height percentage</p>
			</div>
		`;

		// Convert and test edge cases
		const apiResult = await cssHelper.convertHtmlWithCss( request, edgeCaseCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify edge cases in editor
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="height-zero"]' ) ).toHaveCSS( 'height', '0px' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="height-decimal"]' ) ).toHaveCSS( 'height', '1.5rem' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="min-height-zero"]' ) ).toHaveCSS( 'min-height', '0px' );
		await expect( editor.getPreviewFrame().locator( '.e-paragraph-base[data-test="max-height-percent"]' ) ).toHaveCSS( 'max-height', '100%' );
	} );
} );

