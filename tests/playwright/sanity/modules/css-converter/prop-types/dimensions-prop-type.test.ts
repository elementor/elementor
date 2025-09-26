import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Dimensions Prop Type Integration @prop-types', () => {
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

	test( 'should convert all padding variations and verify styling in editor and frontend', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="padding: 20px;" data-test="single-value">Single value padding</p>
				<p style="padding: 20px 40px;" data-test="two-values">Two values padding</p>
				<p style="padding: 20px 30px 0px 10px;" data-test="four-values">Four values padding</p>
				<p style="padding-top: 20px;" data-test="padding-top">Padding top</p>
				<p style="padding-block-start: 30px;" data-test="padding-block-start">Padding block start</p>
				<p style="padding-left: 30px;" data-test="padding-left">Padding left</p>
				<p style="padding-inline-start: 40px;" data-test="padding-inline-start">Padding inline start</p>
				<p style="padding-block: 20px;" data-test="padding-block-single">Padding block single</p>
				<p style="padding-block: 20px 30px;" data-test="padding-block-two">Padding block two values</p>
				<p style="padding-inline: 20px;" data-test="padding-inline-single">Padding inline single</p>
				<p style="padding-inline: 20px 30px;" data-test="padding-inline-two">Padding inline two values</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent );
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Define test cases for both editor and frontend verification
		const testCases = [
			{ index: 0, name: 'padding: 20px', expected: { top: '20px', right: '20px', bottom: '20px', left: '20px' } },
			{ index: 1, name: 'padding: 20px 40px', expected: { top: '20px', right: '40px', bottom: '20px', left: '40px' } },
			{ index: 2, name: 'padding: 20px 30px 0px 10px', expected: { top: '20px', right: '30px', bottom: '0px', left: '10px' } },
			{ index: 3, name: 'padding-top: 20px', expected: { top: '20px', right: '0px', bottom: '0px', left: '0px' } },
			{ index: 4, name: 'padding-block-start: 30px', expected: { top: '30px', right: '0px', bottom: '0px', left: '0px' } },
			{ index: 5, name: 'padding-left: 30px', expected: { top: '0px', right: '0px', bottom: '0px', left: '30px' } },
			{ index: 6, name: 'padding-inline-start: 40px', expected: { top: '0px', right: '0px', bottom: '0px', left: '40px' } },
			{ index: 7, name: 'padding-block: 20px', expected: { top: '20px', right: '0px', bottom: '20px', left: '0px' } },
			{ index: 8, name: 'padding-block: 20px 30px', expected: { top: '20px', right: '0px', bottom: '30px', left: '0px' } },
			{ index: 9, name: 'padding-inline: 20px', expected: { top: '0px', right: '20px', bottom: '0px', left: '20px' } },
			{ index: 10, name: 'padding-inline: 20px 30px', expected: { top: '0px', right: '30px', bottom: '0px', left: '20px' } },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();
				
				const element = elementorFrame.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await expect( element ).toHaveCSS( 'padding-top', testCase.expected.top );
				await expect( element ).toHaveCSS( 'padding-right', testCase.expected.right );
				await expect( element ).toHaveCSS( 'padding-bottom', testCase.expected.bottom );
				await expect( element ).toHaveCSS( 'padding-left', testCase.expected.left );
			} );
		}

		await test.step( 'Publish page and verify all padding styles on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();
			
			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification using same test cases array
			for ( const testCase of testCases ) {
				await test.step( `Verify ${testCase.name} on frontend`, async () => {
					const frontendElement = page.locator( '.e-paragraph-base' ).nth( testCase.index );

					await expect( frontendElement ).toHaveCSS( 'padding-top', testCase.expected.top );
					await expect( frontendElement ).toHaveCSS( 'padding-right', testCase.expected.right );
					await expect( frontendElement ).toHaveCSS( 'padding-bottom', testCase.expected.bottom );
					await expect( frontendElement ).toHaveCSS( 'padding-left', testCase.expected.left );
				} );
			}
		} );
	} );
} );
