import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Class-based Properties Test @prop-types', () => {
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
		<h2 class="banner-title text-bold" style="color: #2c3e50;">Ready to Get Started?</h2>
			
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
		} );

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

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const heading = elementorFrame.locator( 'h2' ).filter( { hasText: /Ready to Get Started/i } );
		await heading.waitFor( { state: 'visible', timeout: 10000 } );

		// MAXIMUM DEBUG: Get ALL possible information
		const maxDebugInfo = await heading.evaluate( ( el ) => {
			const styles = window.getComputedStyle( el );

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

			return {
				// Basic element info
				tagName: el.tagName,
				className: el.className,
				textContent: el.textContent?.trim(),
				inlineStyle: el.getAttribute( 'style' ),
				id: el.id,

				// All attributes
				attributes: Array.from( el.attributes ).reduce( ( acc, attr ) => {
					acc[ attr.name ] = attr.value;
					return acc;
				}, {} ),

				// Computed styles (all relevant properties)
				computedStyles: {
					letterSpacing: styles.letterSpacing,
					textTransform: styles.textTransform,
					fontSize: styles.fontSize,
					fontWeight: styles.fontWeight,
					color: styles.color,
					marginBottom: styles.marginBottom,
					textShadow: styles.textShadow,
					display: styles.display,
					fontFamily: styles.fontFamily,
				},

				// Applied CSS rules
				appliedRules,

				// Parent element info
				parentElement: el.parentElement ? {
					tagName: el.parentElement.tagName,
					className: el.parentElement.className,
					id: el.parentElement.id,
				} : null,

				// Document head styles
				headStyles: Array.from( document.head.querySelectorAll( 'style' ) ).map( ( style ) => ( {
					content: style.textContent?.substring( 0, 500 ) + '...',
					length: style.textContent?.length || 0,
				} ) ),
			};
		} );

		await expect( heading ).toHaveCSS( 'letter-spacing', '1px' );
		await expect( heading ).toHaveCSS( 'text-transform', 'uppercase' );
		await expect( heading ).toHaveCSS( 'font-size', '36px' );
		await expect( heading ).toHaveCSS( 'font-weight', '700' );
		await expect( heading ).toHaveCSS( 'color', 'rgb(44, 62, 80)' );
	} );
} );
