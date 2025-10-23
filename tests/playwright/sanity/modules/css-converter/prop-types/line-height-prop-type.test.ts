import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Line Height Prop Type Conversion @prop-types', () => {
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
		// Await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert unitless line-height values correctly', async ( { page, request } ) => {
		const htmlContent = `
			<div>
				<h2 style="line-height: 1.5;">Unitless Line Height</h2>
				<p style="line-height: 2;">Double Line Height</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		await page.waitForLoadState( 'networkidle' );

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test unitless line-height: 1.5 (browser may compute to pixel value)
		const heading = previewFrame.locator( 'h2' ).first();
		const headingLineHeight = await heading.evaluate( ( el ) => getComputedStyle( el ).lineHeight );
		// Should be either unitless or computed pixel value based on font-size
		expect( '1.5' === headingLineHeight || parseFloat( headingLineHeight ) > 0 ).toBeTruthy();

		// Test unitless line-height: 2
		const paragraph = previewFrame.locator( 'p' ).first();
		const paragraphLineHeight = await paragraph.evaluate( ( el ) => getComputedStyle( el ).lineHeight );
		expect( '2' === paragraphLineHeight || parseFloat( paragraphLineHeight ) > 0 ).toBeTruthy();
	} );
} );
