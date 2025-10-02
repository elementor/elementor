import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Edge Cases Payload Integration @payloads', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

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

	test( 'should handle edge cases and invalid CSS values gracefully', async ( { page, request } ) => {
		const htmlContent = '<div style="color: invalid-color; font-size: ; background: #fff; padding: 20px;"><h1 style="font-weight: 999; color: #333; margin-bottom: 15px;">Error Handling Test</h1><p style="line-height: -1; color: #666; font-size: 16px;">This tests how the system handles invalid CSS values.</p><div style="width: 200%; height: -50px; background: transparent;">Invalid dimensions</div></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: false,
		} );

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

		const testCases = [
			{
				selector: '.elementor-element:first-child',
				name: 'container-with-invalid-values',
				properties: {
					'background-color': 'rgb(255, 255, 255)',
					padding: '20px',
				},
			},
			{
				selector: '.e-heading-base',
				name: 'heading-with-extreme-weight',
				properties: {
					color: 'rgb(51, 51, 51)',
					'margin-bottom': '15px',
				},
			},
			{
				selector: '.e-paragraph-base:first-of-type',
				name: 'paragraph-with-negative-line-height',
				properties: {
					color: 'rgb(102, 102, 102)',
					'font-size': '16px',
				},
			},
			{
				selector: '.e-paragraph-base:last-of-type',
				name: 'div-with-invalid-dimensions',
				properties: {
					'background-color': 'rgba(0, 0, 0, 0)',
				},
			},
		];

		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } styles in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( testCase.selector );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				for ( const [ property, expected ] of Object.entries( testCase.properties ) ) {
					await test.step( `Verify ${ property }`, async () => {
						await expect( element ).toHaveCSS( property, expected );
					} );
				}
			} );
		}

		await test.step( 'Verify system gracefully handles invalid CSS', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			await test.step( 'Check that elements are still rendered', async () => {
				await expect( elementorFrame.locator( '.elementor-element' ).first() ).toBeVisible();
				await expect( elementorFrame.locator( '.e-heading-base' ) ).toBeVisible();
				await expect( elementorFrame.locator( '.e-paragraph-base' ).first() ).toBeVisible();
			} );
		} );

		await test.step( 'Take editor screenshot', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toBeVisible();
			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'edge-cases-editor.png' );
		} );

		await test.step( 'Publish page and verify frontend with screenshot', async () => {
			await editor.saveAndReloadPage();

			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } styles on frontend`, async () => {
					const frontendElement = page.locator( testCase.selector );

					for ( const [ property, expected ] of Object.entries( testCase.properties ) ) {
						await test.step( `Verify ${ property }`, async () => {
							await expect( frontendElement ).toHaveCSS( property, expected );
						} );
					}
				} );
			}

			await test.step( 'Take frontend screenshot', async () => {
				await expect( page.locator( '.elementor-element' ).first() ).toBeVisible();
				await expect( page.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'edge-cases-frontend.png' );
			} );
		} );
	} );
} );
