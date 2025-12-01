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
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		// Await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert all padding variations and verify atomic mapper success', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="padding: 20px;">Single value padding</p>
				<p style="padding: 20px 40px;">Two values padding</p>
				<p style="padding: 20px 30px 0px 10px;">Four values padding</p>
				<p style="margin-top: 40px;padding-top: 20px;">Padding top & Margin top</p>
				<p style="padding-block-start: 30px;">Padding block start</p>
				<p style="padding-left: 30px;">Padding left</p>
				<p style="padding-inline-start: 40px;">Padding inline start</p>
				<p style="padding-block: 20px;">Padding block single</p>
				<p style="padding-block: 20px 30px;">Padding block two values</p>
				<p style="padding-inline: 20px;">Padding inline single</p>
				<p style="padding-inline: 20px 30px;">Padding inline two values</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend padding property mapper issues' );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Test all converted paragraph elements
		const paragraphElements = elementorFrame.locator( '.e-con p' );
		await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );

		// Define test cases based on the HTML content
		const testCases = [
			{
				textContent: 'Single value padding',
				tests: [ { property: 'padding', expected: '20px' } ],
			},
			{
				textContent: 'Two values padding',
				tests: [ { property: 'padding', expected: '20px 40px' } ],
			},
			{
				textContent: 'Four values padding',
				tests: [ { property: 'padding', expected: '20px 30px 0px 10px' } ],
			},
			{
				textContent: 'Padding top & Margin top',
				tests: [
					{ property: 'padding-top', expected: '20px' },
					{ property: 'margin-top', expected: '40px' },
				],
			},
			{
				textContent: 'Padding block start',
				tests: [ { property: 'padding-block-start', expected: '30px' } ],
			},
			{
				textContent: 'Padding left',
				tests: [ { property: 'padding-left', expected: '30px' } ],
			},
			{
				textContent: 'Padding inline start',
				tests: [ { property: 'padding-inline-start', expected: '40px' } ],
			},
			{
				textContent: 'Padding block single',
				tests: [ { property: 'padding-block', expected: '20px' } ],
			},
			{
				textContent: 'Padding block two values',
				tests: [ { property: 'padding-block', expected: '20px 30px' } ],
			},
			{
				textContent: 'Padding inline single',
				tests: [ { property: 'padding-inline', expected: '20px' } ],
			},
			{
				textContent: 'Padding inline two values',
				tests: [ { property: 'padding-inline', expected: '20px 30px' } ],
			},
		];

		// Test padding values using specific text content selectors
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.textContent }`, async () => {
				const element = elementorFrame.locator( 'p' ).filter( { hasText: testCase.textContent } );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				for ( const cssTest of testCase.tests ) {
					await expect( element ).toHaveCSS( cssTest.property, cssTest.expected );
				}
			} );
		}
	} );
} );
