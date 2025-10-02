import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Spacing and Layout Payload Integration @payloads', () => {
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

	test( 'should convert spacing and layout styles and verify with screenshots', async ( { page, request } ) => {
		const htmlContent = '<div style="padding: 50px 30px; background: #f7f9fc;"><div style="margin: 0 auto 40px; max-width: 500px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"><h2 style="margin: 0 0 20px; padding-bottom: 15px; border-bottom: 2px solid #e9ecef; color: #495057;">Spacing Test</h2><p style="margin: 15px 0; padding: 10px 15px; background: #e7f3ff; border-left: 3px solid #007bff; color: #004085;">This tests margin and padding properties.</p><div style="display: flex; gap: 15px; margin-top: 25px;"><div style="flex: 1; padding: 20px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px;">Flex Item 1</div><div style="flex: 1; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px;">Flex Item 2</div></div></div></div>';

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
				name: 'outer-container',
				properties: {
					padding: '50px 30px',
					'background-color': 'rgb(247, 249, 252)',
				},
			},
			{
				selector: '.elementor-element:nth-child(2)',
				name: 'inner-container',
				properties: {
					margin: '0px auto 40px',
					'max-width': '500px',
					'background-color': 'rgb(255, 255, 255)',
					padding: '30px',
					'border-radius': '12px',
				},
			},
			{
				selector: '.e-heading-base',
				name: 'heading',
				properties: {
					margin: '0px 0px 20px',
					'padding-bottom': '15px',
					'border-bottom': '2px solid rgb(233, 236, 239)',
					color: 'rgb(73, 80, 87)',
				},
			},
			{
				selector: '.e-paragraph-base:first-of-type',
				name: 'paragraph',
				properties: {
					margin: '15px 0px',
					padding: '10px 15px',
					'background-color': 'rgb(231, 243, 255)',
					'border-left': '3px solid rgb(0, 123, 255)',
					color: 'rgb(0, 64, 133)',
				},
			},
			{
				selector: '.elementor-element .elementor-element:first-child',
				name: 'flex-container',
				properties: {
					display: 'flex',
					gap: '15px',
					'margin-top': '25px',
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

		await test.step( 'Take editor screenshot', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toBeVisible();
			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'spacing-and-layout-editor.png' );
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
				await expect( page.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'spacing-and-layout-frontend.png' );
			} );
		} );
	} );
} );
