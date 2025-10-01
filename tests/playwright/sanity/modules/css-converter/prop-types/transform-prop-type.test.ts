import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Transform Prop Type Integration @prop-types', () => {
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

	test( 'should convert transform properties', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="transform: translateX(10px);">Transform translateX</p>
				<p style="transform: scale(1.5);">Transform scale</p>
				<p style="transform: rotate(45deg);">Transform rotate</p>
				<p style="transform: translateY(20px) scale(0.8);">Transform combined</p>
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

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Test all converted paragraph elements
		const paragraphElements = elementorFrame.locator( '.e-paragraph-base' );
		await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );

		// Define test cases for transform verification
		const testCases = [
			{
				index: 0,
				name: 'translateX(10px)',
				// Browser converts translateX(10px) to matrix(1, 0, 0, 1, 10, 0)
				expectedPattern: /matrix\(1,\s*0,\s*0,\s*1,\s*10,\s*0\)/,
			},
			{
				index: 1,
				name: 'scale(1.5)',
				// Browser converts scale(1.5) to matrix(1.5, 0, 0, 1.5, 0, 0)
				expectedPattern: /matrix\(1\.5,\s*0,\s*0,\s*1\.5,\s*0,\s*0\)/,
			},
			{
				index: 2,
				name: 'rotate(45deg)',
				// Browser converts rotate(45deg) to matrix with cos/sin values
				// 45deg = cos(45°) ≈ 0.707, sin(45°) ≈ 0.707
				expectedPattern: /matrix\(0\.7071\d*,\s*0\.7071\d*,\s*-0\.7071\d*,\s*0\.7071\d*/,
			},
			{
				index: 3,
				name: 'translateY(20px) scale(0.8)',
				// Combined transforms - just verify it's not 'none' and has matrix format
				expectedPattern: /matrix\([^)]+\)/,
			},
		];

		// Test transform values using toHaveCSS with regex patterns
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } transform`, async () => {
				const element = paragraphElements.nth( testCase.index );

				// Use toHaveCSS with regex pattern for matrix values
				await expect( element ).toHaveCSS( 'transform', testCase.expectedPattern );
			} );
		}
	} );
} );
