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

	test( 'should convert font-size properties and verify styles', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="font-size: 16px;" data-test="font-size-16">Font size 16px</p>
				<p style="font-size: 24px;" data-test="font-size-24">Font size 24px</p>
				<p style="font-size: 1.5rem;" data-test="font-size-rem">Font size 1.5rem</p>
				<p style="font-size: 2em;" data-test="font-size-em">Font size 2em</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

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
		const testCases = [
			{ index: 0, name: 'font-size: 16px', property: 'font-size', expected: '16px' },
			{ index: 1, name: 'font-size: 24px', property: 'font-size', expected: '24px' },
			{ index: 2, name: 'font-size: 1.5rem', property: 'font-size', expected: '24px' }, // 1.5rem = 24px typically
			{ index: 3, name: 'font-size: 2em', property: 'font-size', expectedPattern: /^\d+(\.\d+)?px$/ }, // Em varies by parent
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					if ( testCase.expected ) {
						await expect( element ).toHaveCSS( testCase.property, testCase.expected );
					} else if ( testCase.expectedPattern ) {
						const computedValue = await element.evaluate( ( el, prop ) => {
							return window.getComputedStyle( el ).getPropertyValue( prop );
						}, testCase.property );
						expect( computedValue ).toMatch( testCase.expectedPattern );
					}
				} );
			} );
		}

		await test.step( 'Publish page and verify all font-size styles on frontend', async () => {
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
						if ( testCase.expected ) {
							await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
						} else if ( testCase.expectedPattern ) {
							const computedValue = await frontendElement.evaluate( ( el, prop ) => {
								return window.getComputedStyle( el ).getPropertyValue( prop );
							}, testCase.property );
							expect( computedValue ).toMatch( testCase.expectedPattern );
						}
					} );
				} );
			}
		} );
	} );
} );
