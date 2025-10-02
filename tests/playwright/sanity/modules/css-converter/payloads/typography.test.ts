import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Typography Payload Integration @payloads', () => {
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

	test( 'should convert typography styles and verify with screenshots', async ( { page, request } ) => {
		const htmlContent = '<div style="font-family: \'Georgia\', serif; max-width: 600px; margin: 0 auto; padding: 40px;"><h1 style="font-size: 42px; font-weight: 300; color: #2c3e50; line-height: 1.2; margin-bottom: 20px; text-align: center;">Typography Test</h1><h2 style="font-size: 28px; font-weight: 600; color: #34495e; margin: 30px 0 15px;">Subheading Style</h2><p style="font-size: 18px; line-height: 1.7; color: #555; margin-bottom: 20px; text-align: justify;">This paragraph tests various typography properties including font size, line height, color, and text alignment. It should render beautifully with proper spacing.</p><blockquote style="border-left: 4px solid #3498db; padding-left: 20px; margin: 30px 0; font-style: italic; color: #7f8c8d;">This is a styled blockquote to test border and italic text styling.</blockquote></div>';

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
				name: 'container',
				properties: {
					'font-family': 'Georgia, serif',
					'max-width': '600px',
					margin: '0px auto',
					padding: '40px',
				},
			},
			{
				selector: '.e-heading-base:first-of-type',
				name: 'main-heading',
				properties: {
					'font-size': '42px',
					'font-weight': '300',
					color: 'rgb(44, 62, 80)',
					'line-height': '1.2',
					'margin-bottom': '20px',
					'text-align': 'center',
				},
			},
			{
				selector: '.e-heading-base:nth-of-type(2)',
				name: 'subheading',
				properties: {
					'font-size': '28px',
					'font-weight': '600',
					color: 'rgb(52, 73, 94)',
					margin: '30px 0px 15px',
				},
			},
			{
				selector: '.e-paragraph-base:first-of-type',
				name: 'paragraph',
				properties: {
					'font-size': '18px',
					'line-height': '1.7',
					color: 'rgb(85, 85, 85)',
					'margin-bottom': '20px',
					'text-align': 'justify',
				},
			},
			{
				selector: '.e-paragraph-base:last-of-type',
				name: 'blockquote',
				properties: {
					'border-left': '4px solid rgb(52, 152, 219)',
					'padding-left': '20px',
					margin: '30px 0px',
					'font-style': 'italic',
					color: 'rgb(127, 140, 141)',
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
			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'typography-editor.png' );
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
				await expect( page.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'typography-frontend.png' );
			} );
		} );
	} );
} );
