import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Box Shadow Prop Type Integration @prop-types', () => {
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

	test( 'should convert box-shadow properties and verify styles', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);" data-test="box-shadow-basic">Basic box shadow</p>
				<p style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);" data-test="box-shadow-drop">Drop shadow</p>
				<p style="box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.1);" data-test="box-shadow-inset">Inset shadow</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Define test cases for both editor and frontend verification
		// Note: box-shadow values may be normalized by browsers
		const testCases = [
			{ 
				index: 0, 
				name: 'box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3)', 
				// Browser normalizes to: rgba(0, 0, 0, 0.3) 2px 2px 4px 0px
				expectedPattern: /rgba?\(0,\s*0,\s*0,\s*0\.3\)\s+2px\s+2px\s+4px/
			},
			{ 
				index: 1, 
				name: 'box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2)', 
				// Browser normalizes to: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px
				expectedPattern: /rgba?\(0,\s*0,\s*0,\s*0\.2\)\s+0px\s+4px\s+8px/
			},
			{ 
				index: 2, 
				name: 'box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.1)', 
				// Browser normalizes to: rgba(0, 0, 0, 0.1) 2px 2px 4px 0px inset
				expectedPattern: /rgba?\(0,\s*0,\s*0,\s*0\.1\)\s+2px\s+2px\s+4px.*inset/
			},
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					// Use toHaveCSS with regex pattern for box-shadow verification
					await expect( element ).toHaveCSS( 'box-shadow', testCase.expectedPattern );
				} );
			} );
		}

		await test.step( 'Publish page and verify all box-shadow styles on frontend', async () => {
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
						// Use toHaveCSS with regex pattern for box-shadow verification
						await expect( frontendElement ).toHaveCSS( 'box-shadow', testCase.expectedPattern );
					} );
				} );
			}
		} );
	} );
} );
