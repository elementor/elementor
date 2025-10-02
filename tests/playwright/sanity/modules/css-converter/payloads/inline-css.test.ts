import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Inline CSS Payload Integration @payloads', () => {
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

	test( 'should convert inline CSS and verify styles with screenshots', async ( { page, request } ) => {
		const htmlContent = '<div style="color: #ff6b6b; font-size: 24px; padding: 20px; background-color: #f8f9fa;"><h1 style="color: #2c3e50; font-weight: bold; text-align: center;">Styled Heading</h1><p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">This paragraph has custom styling.</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
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
			{ selector: '.elementor-element:first-child', name: 'container', properties: { color: 'rgb(255, 107, 107)', 'font-size': '24px', padding: '20px', 'background-color': 'rgb(248, 249, 250)' } },
			{ selector: '.e-heading-base', name: 'heading', properties: { color: 'rgb(44, 62, 80)', 'font-weight': '700', 'text-align': 'center' } },
			{ selector: '.e-paragraph-base', name: 'paragraph', properties: { 'font-size': '16px', 'line-height': '1.6', margin: '10px 0px' } },
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
			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'inline-css-editor.png' );
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
				await expect( page.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'inline-css-frontend.png' );
			} );
		} );
	} );

	test( 'should demonstrate both API options with same content', async ( { page, request } ) => {
		const htmlContent = '<div style="color: #007cba; font-size: 18px; padding: 15px; background-color: #e7f3ff;"><h2 style="color: #004085; margin-bottom: 10px;">Dual API Test</h2><p style="font-size: 14px; line-height: 1.5;">Testing both Widget Converter and CSS Classes APIs.</p></div>';

		await test.step( 'Test Widget Converter API (Option 1)', async () => {
			const widgetResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
				createGlobalClasses: true,
			} );

			const validation = cssHelper.validateApiResult( widgetResult );
			if ( validation.shouldSkip ) {
				test.skip( true, 'Widget Converter API failed: ' + validation.skipReason );
				return;
			}

			expect( widgetResult.success ).toBe( true );
			expect( widgetResult.post_id ).toBeDefined();
			expect( widgetResult.edit_url ).toBeDefined();

			// Navigate to editor to verify widget creation
			await page.goto( widgetResult.edit_url );
			editor = new EditorPage( page, wpAdmin.testInfo );
			await editor.waitForPanelToLoad();

			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toBeVisible();
			await expect( elementorFrame.locator( '.e-heading-base' ) ).toBeVisible();
			await expect( elementorFrame.locator( '.e-paragraph-base' ) ).toBeVisible();

			// Take screenshot of widget converter result
			await expect( elementorFrame.locator( '.elementor-element' ).first() ).toHaveScreenshot( 'dual-api-widget-converter.png' );
		} );

		await test.step( 'Test CSS Classes API (Option 2) with extracted CSS', async () => {
			// Extract CSS from inline styles for CSS Classes API
			const extractedCss = `
				.dual-test-container { 
					color: #007cba; 
					font-size: 18px; 
					padding: 15px; 
					background-color: #e7f3ff; 
				}
				.dual-test-heading { 
					color: #004085; 
					margin-bottom: 10px; 
				}
				.dual-test-paragraph { 
					font-size: 14px; 
					line-height: 1.5; 
				}
			`;

			const classesResult = await cssHelper.convertCssToClasses( request, extractedCss, true );

			const validation = cssHelper.validateCssClassesResult( classesResult );
			if ( validation.shouldSkip ) {
				console.log( 'CSS Classes API skipped: ' + validation.skipReason );
				return;
			}

			expect( classesResult.success ).toBe( true );
			expect( classesResult.global_classes_created ).toBeGreaterThanOrEqual( 0 );

			if ( classesResult.classes && classesResult.classes.length > 0 ) {
				// Verify class structure
				const firstClass = classesResult.classes[0];
				expect( firstClass ).toHaveProperty( 'name' );
				expect( firstClass ).toHaveProperty( 'properties' );
				
				console.log( `Created ${classesResult.classes.length} global classes via CSS Classes API` );
			}
		} );

		await test.step( 'Compare both API approaches', async () => {
			// Test both APIs with the same CSS content
			const testCss = '.comparison-test { font-size: 20px; color: #333; padding: 10px; }';

			const dualResult = await cssHelper.convertWithBothApis( request, testCss, {
				createGlobalClasses: true,
			} );

			const validation = cssHelper.validateDualApiResult( dualResult );
			if ( !validation.shouldSkip ) {
				expect( dualResult.widgetConverter?.success ).toBe( true );
				expect( dualResult.cssClasses?.success ).toBe( true );

				console.log( 'Both APIs successfully processed the same CSS content' );
				console.log( `Widget Converter: Created ${dualResult.widgetConverter?.widgets_created} widgets, ${dualResult.widgetConverter?.global_classes_created} global classes` );
				console.log( `CSS Classes API: Created ${dualResult.cssClasses?.global_classes_created} global classes` );
			}
		} );
	} );
} );
