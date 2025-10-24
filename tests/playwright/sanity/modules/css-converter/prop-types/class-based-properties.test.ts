import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Class-base-convertedd Properties Test @prop-types', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert CSS classes to atomic widget properties', async ( { page, request } ) => {
		const htmlContent = `
		<style>
				.text-bold {
					font-weight: 700;
					letter-spacing: 1px;
				}
				.banner-title {
					font-size: 36px;
					margin-bottom: 30px;
					text-transform: uppercase;
					text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
				}
			</style>	
		<div><h2 class="banner-title text-bold" style="color: #2c3e50;">Ready to Get Started?</h2></div>
			
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );


		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();
		expect( apiResult.edit_url ).toBeDefined();

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// await page.pause();
		
		await test.step( 'Test class-base-convertedd letter-spacing and text-transform', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const heading = elementorFrame.locator( '.e-con h2' ).filter( { hasText: 'Ready to Get Started?' } );
			await heading.waitFor( { state: 'visible', timeout: 10000 } );

			// Get all applied CSS rules
			const appliedRules = [];
			try {
				const sheets = Array.from( document.styleSheets );
				for ( const sheet of sheets ) {
					try {
						const rules = Array.from( sheet.cssRules || sheet.rules || [] );
						for ( const rule of rules ) {
							if ( rule.selectorText && el.matches && el.matches( rule.selectorText ) ) {
								appliedRules.push( {
									selector: rule.selectorText,
									cssText: rule.cssText,
								} );
							}
						}
					} catch ( e ) {
						// Cross-origin or other access issues
					}
				}
			} catch ( e ) {
				// Fallback
			}

			

			// These are the assertions that were failing in the original test
			await expect( heading ).toHaveCSS( 'letter-spacing', '1px' );
			await expect( heading ).toHaveCSS( 'text-transform', 'uppercase' );

			// Also test other properties to ensure they're working
			await expect( heading ).toHaveCSS( 'font-size', '36px' );
			await expect( heading ).toHaveCSS( 'font-weight', '700' );
			await expect( heading ).toHaveCSS( 'color', 'rgb(44, 62, 80)' );
		} );

		await test.step( 'Test on frontend as well', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			const heading = page.locator( '.e-con h2' ).filter( { hasText: 'Ready to Get Started?' } );
			await heading.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( heading ).toHaveCSS( 'letter-spacing', '1px' );
			await expect( heading ).toHaveCSS( 'text-transform', 'uppercase' );
			await expect( heading ).toHaveCSS( 'font-size', '36px' );
			await expect( heading ).toHaveCSS( 'font-weight', '700' );
			await expect( heading ).toHaveCSS( 'color', 'rgb(44, 62, 80)' );
		} );
	} );
} );
