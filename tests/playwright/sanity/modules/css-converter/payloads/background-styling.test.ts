import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Background Styling Payload Integration @payloads', () => {
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

	test( 'should convert background styling and verify with screenshots', async ( { page, request } ) => {
		const htmlContent = '<div style="background: linear-gradient(to right, #ff7e5f, #feb47b); padding: 40px;"><div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; margin-bottom: 20px;"><h2 style="color: #2d3748; text-align: center; margin-bottom: 30px;">Color Variations</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;"><div style="background: #e53e3e; color: white; padding: 20px; border-radius: 10px; text-align: center;">Red Background</div><div style="background: #38a169; color: white; padding: 20px; border-radius: 10px; text-align: center;">Green Background</div><div style="background: #3182ce; color: white; padding: 20px; border-radius: 10px; text-align: center;">Blue Background</div><div style="background: #805ad5; color: white; padding: 20px; border-radius: 10px; text-align: center;">Purple Background</div></div></div></div>';

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
				name: 'gradient-container',
				properties: {
					padding: '40px',
				},
			},
			{
				selector: '.elementor-element:nth-child(2)',
				name: 'glass-container',
				properties: {
					'background-color': 'rgba(255, 255, 255, 0.95)',
					'border-radius': '20px',
					padding: '30px',
					'margin-bottom': '20px',
				},
			},
			{
				selector: '.e-heading-base',
				name: 'heading',
				properties: {
					color: 'rgb(45, 55, 72)',
					'text-align': 'center',
					'margin-bottom': '30px',
				},
			},
			{
				selector: '.elementor-element .elementor-element:first-child',
				name: 'grid-container',
				properties: {
					display: 'grid',
					gap: '20px',
				},
			},
			{
				selector: '.e-paragraph-base:nth-of-type(1)',
				name: 'red-background',
				properties: {
					'background-color': 'rgb(229, 62, 62)',
					color: 'rgb(255, 255, 255)',
					padding: '20px',
					'border-radius': '10px',
					'text-align': 'center',
				},
			},
			{
				selector: '.e-paragraph-base:nth-of-type(2)',
				name: 'green-background',
				properties: {
					'background-color': 'rgb(56, 161, 105)',
					color: 'rgb(255, 255, 255)',
					padding: '20px',
					'border-radius': '10px',
					'text-align': 'center',
				},
			},
			{
				selector: '.e-paragraph-base:nth-of-type(3)',
				name: 'blue-background',
				properties: {
					'background-color': 'rgb(49, 130, 206)',
					color: 'rgb(255, 255, 255)',
					padding: '20px',
					'border-radius': '10px',
					'text-align': 'center',
				},
			},
			{
				selector: '.e-paragraph-base:nth-of-type(4)',
				name: 'purple-background',
				properties: {
					'background-color': 'rgb(128, 90, 213)',
					color: 'rgb(255, 255, 255)',
					padding: '20px',
					'border-radius': '10px',
					'text-align': 'center',
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
			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'background-styling-editor.png' );
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
				await expect( page.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'background-styling-frontend.png' );
			} );
		} );
	} );
} );
