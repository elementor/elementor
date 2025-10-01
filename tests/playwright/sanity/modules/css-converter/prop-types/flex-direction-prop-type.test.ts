import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Flex Direction Prop Type Integration @prop-types', () => {
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

	test( 'should convert flex-direction properties and verify styles', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<div style="display: flex; flex-direction: row;" data-test="flex-row">
					<p>Item 1</p><p>Item 2</p>
				</div>
				<div style="display: flex; flex-direction: column;" data-test="flex-column">
					<p>Item 1</p><p>Item 2</p>
				</div>
				<div style="display: flex; flex-direction: row-reverse;" data-test="flex-row-reverse">
					<p>Item 1</p><p>Item 2</p>
				</div>
				<div style="display: flex; flex-direction: column-reverse;" data-test="flex-column-reverse">
					<p>Item 1</p><p>Item 2</p>
				</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Define test cases for flex-direction verification
		const testCases = [
			{ index: 0, name: 'flex-direction: row', property: 'flex-direction', expected: 'row' },
			{ index: 1, name: 'flex-direction: column', property: 'flex-direction', expected: 'column' },
			{ index: 2, name: 'flex-direction: row-reverse', property: 'flex-direction', expected: 'row-reverse' },
			{ index: 3, name: 'flex-direction: column-reverse', property: 'flex-direction', expected: 'column-reverse' },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				// Target the div containers (not paragraphs) since they have the flex-direction
				const element = elementorFrame.locator( '.e-div-block' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
				} );

				// Also verify display: flex is applied
				await test.step( 'Verify display: flex', async () => {
					await expect( element ).toHaveCSS( 'display', 'flex' );
				} );
			} );
		}

		await test.step( 'Publish page and verify all flex-direction styles on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification using same test cases array
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					const frontendElement = page.locator( '.e-div-block' ).nth( testCase.index );

					await test.step( 'Verify CSS property', async () => {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
					} );

					// Also verify display: flex is applied on frontend
					await test.step( 'Verify display: flex on frontend', async () => {
						await expect( frontendElement ).toHaveCSS( 'display', 'flex' );
					} );
				} );
			}
		} );
	} );
} );
