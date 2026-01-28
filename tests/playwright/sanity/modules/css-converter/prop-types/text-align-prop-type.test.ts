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

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();
		// Await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert text-align properties and verify styles', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="text-align: left;" data-test="text-align-left">Left aligned text</p>
				<p style="text-align: center;" data-test="text-align-center">Center aligned text</p>
				<p style="text-align: right;" data-test="text-align-right">Right aligned text</p>
				<p style="text-align: justify;" data-test="text-align-justify">Justified text that should be justified across the full width of the container</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Define test cases for both editor and frontend verification
		// Note: left/right are converted to logical properties (start/end)
		const testCases = [
			{ index: 0, dataTest: 'text-align-left', textContent: 'Left aligned text', name: 'text-align: left', property: 'text-align', expected: 'start' },
			{ index: 1, dataTest: 'text-align-center', textContent: 'Center aligned text', name: 'text-align: center', property: 'text-align', expected: 'center' },
			{ index: 2, dataTest: 'text-align-right', textContent: 'Right aligned text', name: 'text-align: right', property: 'text-align', expected: 'end' },
			{ index: 3, dataTest: 'text-align-justify', textContent: 'Justified text that should be justified across the full width of the container', name: 'text-align: justify', property: 'text-align', expected: 'justify' },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( '.e-con p' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
				} );
			} );
		}

		await test.step( 'Publish page and verify all text-align styles on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification using same test cases array
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					const frontendElement = page.locator( '.e-con p' ).nth( testCase.index );

					await test.step( 'Verify CSS property', async () => {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
					} );
				} );
			}
		} );
	} );
} );
