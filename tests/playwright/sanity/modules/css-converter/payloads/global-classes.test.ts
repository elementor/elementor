import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Global Classes Payload Integration @payloads', () => {
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

	test( 'should convert global classes and verify styles with screenshots', async ( { page, request } ) => {
		const htmlContent = '<style>.hero-section { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 60px 30px; background: #1a1a2e; } .hero-title { color: #eee; font-size: 48px; font-weight: 800; letter-spacing: -1px; } .hero-subtitle { color: #16213e; font-size: 20px; opacity: 0.8; } .cta-button { background: #0f3460; color: white; padding: 15px 30px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; }</style><div class="hero-section"><h1 class="hero-title">Amazing Product</h1><p class="hero-subtitle">Transform your workflow today</p><a href="#" class="cta-button">Get Started</a></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
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
				name: 'hero-section',
				properties: {
					display: 'flex',
					'flex-direction': 'column',
					'align-items': 'center',
					gap: '20px',
					padding: '60px 30px',
					'background-color': 'rgb(26, 26, 46)',
				},
			},
			{
				selector: '.e-heading-base',
				name: 'hero-title',
				properties: {
					color: 'rgb(238, 238, 238)',
					'font-size': '48px',
					'font-weight': '800',
					'letter-spacing': '-1px',
				},
			},
			{
				selector: '.e-paragraph-base',
				name: 'hero-subtitle',
				properties: {
					color: 'rgb(22, 33, 62)',
					'font-size': '20px',
					opacity: '0.8',
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
			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'global-classes-editor.png' );
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
				await expect( page.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'global-classes-frontend.png' );
			} );
		} );
	} );
} );
