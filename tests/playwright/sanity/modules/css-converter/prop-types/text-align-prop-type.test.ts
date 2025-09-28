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

	test( 'should convert text-align properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ index: 0, property: 'text-align', value: 'left', expected: 'start' },
			{ index: 1, property: 'text-align', value: 'center', expected: 'center' },
			{ index: 2, property: 'text-align', value: 'right', expected: 'end' },
			{ index: 3, property: 'text-align', value: 'justify', expected: 'justify' },
			{ index: 4, property: 'text-align', value: 'start', expected: 'start' },
			{ index: 5, property: 'text-align', value: 'end', expected: 'end' },
		];

		const combinedCssContent = `
			<div>
				<p style="text-align: left; width: 300px; border: 1px solid #ccc;">Left aligned text content that should align to the left side of the container.</p>
				<p style="text-align: center; width: 300px; border: 1px solid #ccc;">Center aligned text content that should be centered in the container.</p>
				<p style="text-align: right; width: 300px; border: 1px solid #ccc;">Right aligned text content that should align to the right side of the container.</p>
				<p style="text-align: justify; width: 300px; border: 1px solid #ccc;">Justified text content that should be evenly distributed across the full width of the container with equal spacing.</p>
				<p style="text-align: start; width: 300px; border: 1px solid #ccc;">Start aligned text content using logical property.</p>
				<p style="text-align: end; width: 300px; border: 1px solid #ccc;">End aligned text content using logical property.</p>
			</div>
		`;

		// Convert HTML with CSS to Elementor widgets
		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify in editor
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.value } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await expect( element ).toHaveCSS( 'text-align', testCase.expected );
			} );
		}

		// Save and navigate to frontend
		await test.step( 'Publish page and verify all text-align styles on frontend', async () => {
			await editor.saveAndReloadPage();

			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Verify on frontend
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.value } on frontend`, async () => {
					const frontendElement = page.locator( '.e-paragraph-base' ).nth( testCase.index );

					await expect( frontendElement ).toHaveCSS( 'text-align', testCase.expected );
				} );
			}
		} );
	} );

	test( 'should handle text-align with different content lengths', async ( { page, request } ) => {
		const contentVariationsCssContent = `
			<div>
				<p style="text-align: center; width: 400px; border: 1px solid #ccc;">Short</p>
				<p style="text-align: justify; width: 400px; border: 1px solid #ccc;">This is a very long paragraph that should demonstrate the justify text alignment behavior when there is enough content to wrap across multiple lines and show the justification effect properly.</p>
				<p style="text-align: right; width: 400px; border: 1px solid #ccc;">Medium length content for right alignment.</p>
			</div>
		`;

		// Convert and test content variations
		const apiResult = await cssHelper.convertHtmlWithCss( request, contentVariationsCssContent, '' );
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify content variations in editor
		await test.step( 'Verify content variations in editor', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			await expect( elementorFrame.locator( '.e-paragraph-base' ).nth( 0 ) ).toHaveCSS( 'text-align', 'center' );
			await expect( elementorFrame.locator( '.e-paragraph-base' ).nth( 1 ) ).toHaveCSS( 'text-align', 'justify' );
			await expect( elementorFrame.locator( '.e-paragraph-base' ).nth( 2 ) ).toHaveCSS( 'text-align', 'end' );
		} );
	} );
} );

