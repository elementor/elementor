import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Unitless Zero Support @prop-types', () => {
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		cssHelper = new CssConverterHelper();
	} );

	test( 'should support unitless zero for all size properties', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<div>
				<p style="margin: 0; padding: 0; gap: 0; border: 0; display: flex;">Test with unitless zero</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend errors' );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;

		if ( ! postId || ! editUrl ) {
			test.skip( true, 'Missing postId or editUrl' );
			return;
		}

		await page.goto( editUrl );
		editor = new EditorPage( page, testInfo );

		await test.step( 'Wait for editor to load', async () => {
			await editor.waitForPanelToLoad();
		} );

		const elementorFrame = editor.getPreviewFrame();
		await test.step( 'Verify all unitless zero values are converted correctly', async () => {
			const element = elementorFrame.locator( '.e-paragraph-base' ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			// Margin
			await expect( element ).toHaveCSS( 'margin-top', '0px' );
			await expect( element ).toHaveCSS( 'margin-right', '0px' );
			await expect( element ).toHaveCSS( 'margin-bottom', '0px' );
			await expect( element ).toHaveCSS( 'margin-left', '0px' );

			// Padding
			await expect( element ).toHaveCSS( 'padding-top', '0px' );
			await expect( element ).toHaveCSS( 'padding-right', '0px' );
			await expect( element ).toHaveCSS( 'padding-bottom', '0px' );
			await expect( element ).toHaveCSS( 'padding-left', '0px' );

			// Gap
			await expect( element ).toHaveCSS( 'gap', '0px' );

			// Border
			await expect( element ).toHaveCSS( 'border-width', '0px' );

			// Display
			await expect( element ).toHaveCSS( 'display', 'flex' );
		} );
	} );

	test( 'should support individual unitless zero properties', async ( { page, request }, testInfo ) => {
		const testCases = [
			{ property: 'width', value: '0', expected: 'width', expectedValue: '0px' },
			{ property: 'height', value: '0', expected: 'height', expectedValue: '0px' },
			{ property: 'min-width', value: '0', expected: 'min-width', expectedValue: '0px' },
			{ property: 'max-width', value: '0', expected: 'max-width', expectedValue: '0px' },
			{ property: 'margin-top', value: '0', expected: 'margin-top', expectedValue: '0px' },
			{ property: 'padding-left', value: '0', expected: 'padding-left', expectedValue: '0px' },
			{ property: 'font-size', value: '0', expected: 'font-size', expectedValue: '0px' },
		];

		for ( const testCase of testCases ) {
			const htmlContent = `<div><p style="${ testCase.property }: ${ testCase.value };">Test</p></div>`;

			const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

			const validation = cssHelper.validateApiResult( apiResult );
			if ( validation.shouldSkip ) {
				continue;
			}

			const postId = apiResult.post_id;
			const editUrl = apiResult.edit_url;

			if ( ! postId || ! editUrl ) {
				continue;
			}

			await page.goto( editUrl );
			editor = new EditorPage( page, testInfo );
			await editor.waitForPanelToLoad();

			const elementorFrame = editor.getPreviewFrame();
			const element = elementorFrame.locator( '.e-paragraph-base' ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( element ).toHaveCSS( testCase.expected, testCase.expectedValue );
		}
	} );
} );

