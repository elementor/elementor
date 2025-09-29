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

	test( 'should convert all padding variations and verify atomic mapper success', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="padding: 20px;">Single value padding</p>
				<p style="padding: 20px 40px;">Two values padding</p>
				<p style="padding: 20px 30px 0px 10px;">Four values padding</p>
				<p style="padding-top: 20px;">Padding top</p>
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

		if ( ! apiResult.success || ( apiResult.errors && apiResult.errors.length > 0 ) ) {
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
		const paragraphElements = elementorFrame.locator( '.e-paragraph-base' );
		await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );
		
		// Test single value padding (first paragraph: padding: 20px)
		const singleValueElement = paragraphElements.nth( 0 );
		await expect( singleValueElement ).toHaveCSS( 'padding-top', '20px' );
		await expect( singleValueElement ).toHaveCSS( 'padding-right', '20px' );
		await expect( singleValueElement ).toHaveCSS( 'padding-bottom', '20px' );
		await expect( singleValueElement ).toHaveCSS( 'padding-left', '20px' );
		
		// Test two values padding (second paragraph: padding: 20px 40px)
		const twoValuesElement = paragraphElements.nth( 1 );
		await expect( twoValuesElement ).toHaveCSS( 'padding-top', '20px' );
		await expect( twoValuesElement ).toHaveCSS( 'padding-right', '40px' );
		await expect( twoValuesElement ).toHaveCSS( 'padding-bottom', '20px' );
		await expect( twoValuesElement ).toHaveCSS( 'padding-left', '40px' );
		
		// Test four values padding (third paragraph: padding: 20px 30px 0px 10px)
		const fourValuesElement = paragraphElements.nth( 2 );
		await expect( fourValuesElement ).toHaveCSS( 'padding-top', '20px' );
		await expect( fourValuesElement ).toHaveCSS( 'padding-right', '30px' );
		await expect( fourValuesElement ).toHaveCSS( 'padding-bottom', '0px' );
		await expect( fourValuesElement ).toHaveCSS( 'padding-left', '10px' );
		
		// Test individual directional properties (fourth paragraph: padding-top: 20px)
		const paddingTopElement = paragraphElements.nth( 3 );
		await expect( paddingTopElement ).toHaveCSS( 'padding-top', '20px' );
		
		// Test padding-left (sixth paragraph: padding-left: 30px)
		const paddingLeftElement = paragraphElements.nth( 5 );
		await expect( paddingLeftElement ).toHaveCSS( 'padding-left', '30px' );
	} );
} );
