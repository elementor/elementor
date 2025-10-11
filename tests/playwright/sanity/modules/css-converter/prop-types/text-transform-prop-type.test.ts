import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Text Transform Prop Type Integration @prop-types', () => {
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
		// await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test.skip( 'should convert text-transform properties and verify styles', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<h1 style="text-transform: uppercase;" data-test="text-transform-uppercase">Uppercase Text</h1>
				<h2 style="text-transform: lowercase;" data-test="text-transform-lowercase">Lowercase Text</h2>
				<p style="text-transform: capitalize;" data-test="text-transform-capitalize">capitalize text</p>
				<p style="text-transform: none;" data-test="text-transform-none">None Transform</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const testCases = [
			{
				index: 0,
				name: 'text-transform: uppercase on h1',
				property: 'text-transform',
				expected: 'uppercase',
				selector: 'h1, h2',
				filter: /Uppercase Text/,
			},
			{
				index: 1,
				name: 'text-transform: lowercase on h2',
				property: 'text-transform',
				expected: 'lowercase',
				selector: 'h1, h2',
				filter: /Lowercase Text/,
			},
			{
				index: 0,
				name: 'text-transform: capitalize on p',
				property: 'text-transform',
				expected: 'capitalize',
				selector: 'p',
				filter: /capitalize text/,
			},
			{
				index: 1,
				name: 'text-transform: none on p',
				property: 'text-transform',
				expected: 'none',
				selector: 'p',
				filter: /None Transform/,
			},
		];

		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( testCase.selector ).filter( { hasText: testCase.filter } ).first();
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
				} );
			} );
		}

		await test.step( 'Publish page and verify text-transform styles on frontend', async () => {
			await editor.saveAndReloadPage();

			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					const frontendElements = page.locator( testCase.selector );
					const frontendElement = frontendElements.nth( testCase.index );

					await test.step( 'Verify CSS property', async () => {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
					} );
				} );
			}
		} );
	} );
} );
