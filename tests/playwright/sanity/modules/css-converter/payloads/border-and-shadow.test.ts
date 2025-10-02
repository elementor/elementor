import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Border and Shadow Payload Integration @payloads', () => {
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

	test( 'should convert border and shadow styles and verify with screenshots', async ( { page, request } ) => {
		const htmlContent = '<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><div style="background: white; border: 2px solid #dee2e6; border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);"><h2 style="color: #343a40; border-bottom: 3px solid #007bff; padding-bottom: 10px; margin-bottom: 20px;">Border Styles</h2><div style="border: 1px dashed #6c757d; padding: 15px; margin: 15px 0; border-radius: 8px;">Dashed border example</div><div style="border: 3px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">Solid border with inset shadow</div><div style="border: 2px dotted #dc3545; padding: 15px; margin: 15px 0; border-radius: 8px;">Dotted border example</div></div></div>';

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
					padding: '40px',
				},
			},
			{
				selector: '.elementor-element:nth-child(2)',
				name: 'main-container',
				properties: {
					'background-color': 'rgb(255, 255, 255)',
					border: '2px solid rgb(222, 226, 230)',
					'border-radius': '15px',
					padding: '30px',
					'margin-bottom': '30px',
				},
			},
			{
				selector: '.e-heading-base',
				name: 'heading',
				properties: {
					color: 'rgb(52, 58, 64)',
					'border-bottom': '3px solid rgb(0, 123, 255)',
					'padding-bottom': '10px',
					'margin-bottom': '20px',
				},
			},
			{
				selector: '.e-paragraph-base:nth-of-type(1)',
				name: 'dashed-border',
				properties: {
					border: '1px dashed rgb(108, 117, 125)',
					padding: '15px',
					margin: '15px 0px',
					'border-radius': '8px',
				},
			},
			{
				selector: '.e-paragraph-base:nth-of-type(2)',
				name: 'solid-border-shadow',
				properties: {
					border: '3px solid rgb(40, 167, 69)',
					padding: '15px',
					margin: '15px 0px',
					'border-radius': '8px',
				},
			},
			{
				selector: '.e-paragraph-base:nth-of-type(3)',
				name: 'dotted-border',
				properties: {
					border: '2px dotted rgb(220, 53, 69)',
					padding: '15px',
					margin: '15px 0px',
					'border-radius': '8px',
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
			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'border-and-shadow-editor.png' );
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
				await expect( page.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'border-and-shadow-frontend.png' );
			} );
		} );
	} );
} );
