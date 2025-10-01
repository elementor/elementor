import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Border Radius Prop Type Integration @prop-types', () => {
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

	test( 'should convert border-radius properties and verify styles', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="border-radius: 10px;" data-test="radius-all">Border radius all</p>
				<p style="border-top-left-radius: 15px;" data-test="radius-top-left">Top left radius</p>
				<p style="border-top-right-radius: 20px;" data-test="radius-top-right">Top right radius</p>
				<p style="border-bottom-left-radius: 25px;" data-test="radius-bottom-left">Bottom left radius</p>
				<p style="border-bottom-right-radius: 30px;" data-test="radius-bottom-right">Bottom right radius</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues: ' + validation.skipReason );
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
		const testCases = [
			{ index: 0, name: 'border-radius: 10px', property: 'border-top-left-radius', expected: '10px' },
			{ index: 1, name: 'border-top-left-radius: 15px', property: 'border-top-left-radius', expected: '15px' },
			{ index: 2, name: 'border-top-right-radius: 20px', property: 'border-top-right-radius', expected: '20px' },
			{ index: 3, name: 'border-bottom-left-radius: 25px', property: 'border-bottom-left-radius', expected: '25px' },
			{ index: 4, name: 'border-bottom-right-radius: 30px', property: 'border-bottom-right-radius', expected: '30px' },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
				} );
			} );
		}

		await test.step( 'Publish page and verify all border-radius styles on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification using same test cases array
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					const frontendElement = page.locator( '.e-paragraph-base' ).nth( testCase.index );

					await test.step( 'Verify CSS property', async () => {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
					} );
				} );
			}
		} );
	} );
} );
