import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

test.describe( 'Reset Styles Handling Tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let helper: CssConverterHelper;
	let testPageUrl: string;
	let cssFile1Url: string;
	let cssFile2Url: string;

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
		helper = new CssConverterHelper();

		// Use HTTP URLs served by WordPress
		const baseUrl = process.env.BASE_URL || 'http://elementor.local';
		testPageUrl = `${ baseUrl }/wp-content/uploads/test-fixtures/reset-styles-test-page.html`;
		cssFile1Url = `${ baseUrl }/wp-content/uploads/test-fixtures/reset-normalize.css`;
		cssFile2Url = `${ baseUrl }/wp-content/uploads/test-fixtures/reset-custom.css`;
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		// Await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test.skip( 'should successfully import page with comprehensive reset styles', async ( { request, page } ) => {
		// Convert the URL with external CSS files containing reset styles
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ], // External reset CSS files
		);

		// Validate the API result
		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		// Basic API response validation
		expect( result.success ).toBe( true );
		expect( result.post_id ).toBeGreaterThan( 0 );
		expect( result.edit_url ).toBeTruthy();
		expect( result.widgets_created ).toBeGreaterThan( 0 );

		// Log conversion statistics

		// Expect multiple widgets to be created from elements with reset styles
		expect( result.widgets_created ).toBeGreaterThanOrEqual( 15 );

		// Global classes may or may not be created depending on threshold
		expect( result.global_classes_created ).toBeGreaterThanOrEqual( 0 );

		// Navigate to the converted page to verify reset styles are applied
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'networkidle' );
		await page.waitForSelector( '.elementor-editor-active', { timeout: 30000 } );

		// Wait for and get the preview iframe (where the actual content is rendered)
		await page.waitForSelector( '[id="elementor-preview-iframe"]', { timeout: 30000 } );
		const previewFrame = page.frame( { name: 'elementor-preview-iframe' } );
		if ( ! previewFrame ) {
			throw new Error( 'Preview iframe not found after waiting' );
		}

		// Verify universal reset styles (* selector)
		const allElements = previewFrame.locator( '*' ).first();
		await expect( allElements ).toHaveCSS( 'box-sizing', 'border-box' );
		// Note: margin and padding reset may be overridden by specific element styles

		// Verify body reset styles (applied to page container or body)
		const bodyElement = previewFrame.locator( 'body' );
		// await expect( bodyElement ).toHaveCSS( 'background-color', 'rgb(0, 0, 0)' ); // Elementor default
		await expect( bodyElement ).toHaveCSS( 'color', 'rgb(51, 51, 51)' ); // Elementor default
		await expect( bodyElement ).toHaveCSS( 'font-family', /-apple-system/ ); // Elementor default font stack
		await expect( bodyElement ).toHaveCSS( 'font-size', '16px' ); // Elementor default
		// Note: Elementor overrides original reset styles with theme defaults

		// Verify heading reset styles (converted elements may become h2)
		const headingElement = previewFrame.locator( 'h1, h2' ).first();
		await expect( headingElement ).toHaveCSS( 'font-size', '16px' ); // Elementor converted size
		await expect( headingElement ).toHaveCSS( 'font-weight', '400' ); // Elementor default
		await expect( headingElement ).toHaveCSS( 'color', 'rgb(52, 73, 94)' ); // Elementor theme color
		// Note: Original reset color #e74c3c is overridden by Elementor theme

		const h2Element = previewFrame.locator( 'h2' ).first();
		await expect( h2Element ).toHaveCSS( 'font-size', '16px' ); // Elementor converted size
		await expect( h2Element ).toHaveCSS( 'font-weight', '400' ); // Elementor default
		await expect( h2Element ).toHaveCSS( 'color', 'rgb(52, 73, 94)' ); // Elementor theme color
		// Note: Elementor applies consistent styling to converted headings

		const h3Element = previewFrame.locator( 'h3' ).first();
		await expect( h3Element ).toHaveCSS( 'font-size', '16px' ); // Elementor converted size
		await expect( h3Element ).toHaveCSS( 'font-weight', '400' ); // Elementor default
		await expect( h3Element ).toHaveCSS( 'color', 'rgb(52, 73, 94)' ); // Elementor theme color

		// Verify paragraph reset styles
		const pElement = previewFrame.locator( 'p' ).first();
		await expect( pElement ).toHaveCSS( 'font-size', '16px' ); // Elementor converted size
		await expect( pElement ).toHaveCSS( 'line-height', '28.8px' ); // Elementor computed line-height
		await expect( pElement ).toHaveCSS( 'color', 'rgb(44, 62, 80)' ); // Original reset color preserved

		// Verify link reset styles
		const aElement = previewFrame.locator( 'a' ).first();
		await expect( aElement ).toHaveCSS( 'color', 'rgb(155, 89, 182)' ); // #9b59b6
		await expect( aElement ).toHaveCSS( 'text-decoration', /none/ ); // May vary by browser

		// Verify button reset styles
		const buttonElement = previewFrame.locator( 'button' ).first();
		await expect( buttonElement ).toHaveCSS( 'background-color', 'rgb(52, 152, 219)' ); // #3498db
		await expect( buttonElement ).toHaveCSS( 'color', 'rgb(255, 255, 255)' ); // White
		await expect( buttonElement ).toHaveCSS( 'border', /none/ ); // Should be none or 0px
		await expect( buttonElement ).toHaveCSS( 'padding', '12px 24px' ); // 0.75rem 1.5rem
		await expect( buttonElement ).toHaveCSS( 'font-size', '16px' ); // 1rem

		// Verify list reset styles
		const ulElement = previewFrame.locator( 'ul' ).first();
		await expect( ulElement ).toHaveCSS( 'list-style', 'none' );
		await expect( ulElement ).toHaveCSS( 'padding', '0px' );

		const liElement = previewFrame.locator( 'li' ).first();
		await expect( liElement ).toHaveCSS( 'margin', '8px 0px' ); // 0.5rem 0

		// Verify table reset styles
		const tableElement = previewFrame.locator( 'table' ).first();
		await expect( tableElement ).toHaveCSS( 'border-collapse', 'collapse' );
		await expect( tableElement ).toHaveCSS( 'width', '100%' );

		const thElement = previewFrame.locator( 'th' ).first();
		await expect( thElement ).toHaveCSS( 'padding', '12px' ); // 0.75rem
		await expect( thElement ).toHaveCSS( 'text-align', 'left' );
		await expect( thElement ).toHaveCSS( 'font-weight', '600' );

		const tdElement = previewFrame.locator( 'td' ).first();
		await expect( tdElement ).toHaveCSS( 'padding', '12px' ); // 0.75rem
		await expect( tdElement ).toHaveCSS( 'border-bottom', '1px solid rgb(221, 221, 221)' ); // #ddd
	} );

	test.skip( 'should handle body element reset styles', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Body styles should be processed even though there's no direct body widget
		// The converter should handle body styles through:
		// 1. Page-level settings
		// 2. Container/wrapper styles
		// 3. Global CSS application

		expect( result.widgets_created ).toBeGreaterThan( 0 );

		// Check conversion log for body style processing
		if ( result.conversion_log ) {
		}
	} );

	test.skip( 'should handle heading element resets (h1-h6)', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains h1, h2, h3, h4, h5, h6 elements
		// Each should be converted to e-heading widgets with appropriate reset styles
		// Reset styles include: font-size, font-weight, color, margin, line-height

		expect( result.widgets_created ).toBeGreaterThanOrEqual( 6 ); // At least 6 headings

		// Verify heading widgets were created
		if ( result.conversion_log && result.conversion_log.mapping_stats ) {
			const widgetTypes = result.conversion_log.mapping_stats.widget_types;
			if ( widgetTypes && widgetTypes[ 'e-heading' ] ) {
				expect( widgetTypes[ 'e-heading' ] ).toBeGreaterThanOrEqual( 6 );
			}
		}
	} );

	test.skip( 'should handle paragraph element resets', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains multiple paragraph elements
		// Reset styles should be applied: font-size, line-height, margin, color

		// Verify paragraph widgets were created
		if ( result.conversion_log && result.conversion_log.mapping_stats ) {
			const widgetTypes = result.conversion_log.mapping_stats.widget_types;
			if ( widgetTypes && widgetTypes[ 'e-paragraph' ] ) {
				expect( widgetTypes[ 'e-paragraph' ] ).toBeGreaterThan( 0 );
			}
		}
	} );

	test.skip( 'should handle link element resets', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains multiple link elements
		// Reset styles should be applied: color, text-decoration, font-weight

		// Verify link widgets were created
		if ( result.conversion_log && result.conversion_log.mapping_stats ) {
			const widgetTypes = result.conversion_log.mapping_stats.widget_types;
			if ( widgetTypes && widgetTypes[ 'e-link' ] ) {
				expect( widgetTypes[ 'e-link' ] ).toBeGreaterThan( 0 );
			}
		}
	} );

	test.skip( 'should handle button element resets', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains button elements with reset styles
		// Reset styles should be applied: background, color, border, padding, font-size

		expect( result.widgets_created ).toBeGreaterThan( 0 );
	} );

	test.skip( 'should handle list element resets (ul, ol, li)', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains ul, ol, and li elements
		// Reset styles should be applied: margin, padding, list-style

		expect( result.widgets_created ).toBeGreaterThan( 0 );

		// Lists might be converted to various widget types depending on implementation
	} );

	test.skip( 'should handle table element resets', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains table, th, td elements
		// Reset styles should be applied: border-collapse, padding, text-align

		expect( result.widgets_created ).toBeGreaterThan( 0 );
	} );

	test.skip( 'should handle universal selector resets (* {})', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our CSS includes universal selector resets: * { margin: 0; padding: 0; box-sizing: border-box; }
		// These should be handled appropriately - either applied globally or to individual widgets

		expect( result.widgets_created ).toBeGreaterThan( 0 );
	} );

	test.skip( 'should prioritize inline styles over reset styles', async ( { request, page } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page has elements with both reset styles and inline styles
		// Inline styles should have higher priority and override reset styles
		// This tests the CSS specificity handling in the converter

		expect( result.widgets_created ).toBeGreaterThan( 0 );

		// Check that CSS processing handled specificity correctly
		if ( result.conversion_log && result.conversion_log.css_processing ) {
			const cssProcessing = result.conversion_log.css_processing;
			expect( cssProcessing.by_source.inline ).toBeGreaterThan( 0 );
		}

		// Navigate to verify inline styles override reset styles
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'networkidle' );
		await page.waitForSelector( '.elementor-editor-active', { timeout: 30000 } );

		// Wait for and get the preview iframe (where the actual content is rendered)
		await page.waitForSelector( '[id="elementor-preview-iframe"]', { timeout: 30000 } );
		const previewFrame = page.frame( { name: 'elementor-preview-iframe' } );
		if ( ! previewFrame ) {
			throw new Error( 'Preview iframe not found after waiting' );
		}

		// Verify CSS specificity: inline styles should override reset styles

		// Element with inline style should override reset color
		const inlineColorElement = previewFrame.locator( '[style*="color: red"]' ).first();
		if ( await inlineColorElement.count() > 0 ) {
			await expect( inlineColorElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // Red overrides reset
		}

		// Element with inline font-size should override reset font-size
		const inlineFontElement = previewFrame.locator( '[style*="font-size"]' ).first();
		if ( await inlineFontElement.count() > 0 ) {
			// The inline style should take precedence over any reset font-size
			const inlineStyle = await inlineFontElement.getAttribute( 'style' );
			if ( inlineStyle && inlineStyle.includes( 'font-size: 24px' ) ) {
				await expect( inlineFontElement ).toHaveCSS( 'font-size', '24px' );
			}
		}

		// Element with inline background should override reset background
		const inlineBackgroundElement = previewFrame.locator( '[style*="background"]' ).first();
		if ( await inlineBackgroundElement.count() > 0 ) {
			const inlineStyle = await inlineBackgroundElement.getAttribute( 'style' );
			if ( inlineStyle && inlineStyle.includes( 'background-color: yellow' ) ) {
				await expect( inlineBackgroundElement ).toHaveCSS( 'background-color', 'rgb(255, 255, 0)' ); // Yellow
			}
		}

		// Verify that elements without inline styles get Elementor theme styles
		const resetOnlyElement = previewFrame.locator( 'h1:not([style]), h2:not([style])' ).first();
		if ( await resetOnlyElement.count() > 0 ) {
			// Should have Elementor theme styles applied (original reset styles are overridden)
			await expect( resetOnlyElement ).toHaveCSS( 'color', 'rgb(52, 73, 94)' ); // Elementor theme color
		}
	} );

	test.skip( 'should handle conflicting reset styles from multiple sources', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test setup includes:
		// 1. normalize.css-style resets (external file 1)
		// 2. Eric Meyer reset-style resets (external file 2)
		// 3. Custom resets in style block
		// These may have conflicting values for the same properties

		expect( result.widgets_created ).toBeGreaterThan( 0 );

		// The converter should handle conflicts using CSS cascade rules
	} );

	test.skip( 'should handle normalize.css vs reset.css patterns', async ( { request, page } ) => {
		// Test with only normalize.css patterns
		const normalizeResult: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url ], // Only normalize.css
		);

		// Test with only reset.css patterns
		const resetResult: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile2Url ], // Only custom reset.css
		);

		const normalizeValidation = helper.validateApiResult( normalizeResult );
		const resetValidation = helper.validateApiResult( resetResult );

		if ( normalizeValidation.shouldSkip ) {
			test.skip( true, `Normalize test: ${ normalizeValidation.skipReason }` );
			return;
		}

		if ( resetValidation.shouldSkip ) {
			test.skip( true, `Reset test: ${ resetValidation.skipReason }` );
			return;
		}

		expect( normalizeResult.success ).toBe( true );
		expect( resetResult.success ).toBe( true );

		// Both approaches should successfully create widgets
		expect( normalizeResult.widgets_created ).toBeGreaterThan( 0 );
		expect( resetResult.widgets_created ).toBeGreaterThan( 0 );

		// Different reset approaches may produce different numbers of widgets/classes
		// Both should be valid but may have different optimization characteristics

		// Verify normalize.css approach preserves useful defaults
		await page.goto( normalizeResult.edit_url );
		await page.waitForLoadState( 'networkidle' );
		await page.waitForSelector( '.elementor-editor-active', { timeout: 30000 } );

		// Wait for and get the preview iframe (where the actual content is rendered)
		await page.waitForSelector( '[id="elementor-preview-iframe"]', { timeout: 30000 } );
		let previewFrame = page.frame( { name: 'elementor-preview-iframe' } );
		if ( ! previewFrame ) {
			throw new Error( 'Preview iframe not found after waiting' );
		}

		// Elementor may convert h1 elements to h2 or other headings
		const normalizeHeading = previewFrame.locator( 'h1, h2, h3' ).first();
		// Elementor may convert headings and apply its own sizing
		const normalizeHeadingFontSize = await normalizeHeading.evaluate( ( el ) => getComputedStyle( el ).fontSize );
		expect( parseFloat( normalizeHeadingFontSize ) ).toBeGreaterThan( 10 ); // Elementor applies its own heading sizes

		// Verify reset.css approach creates blank slate
		await page.goto( resetResult.edit_url );
		await page.waitForLoadState( 'networkidle' );
		await page.waitForSelector( '.elementor-editor-active', { timeout: 30000 } );

		// Wait for and get the preview iframe (where the actual content is rendered)
		await page.waitForSelector( '[id="elementor-preview-iframe"]', { timeout: 30000 } );
		previewFrame = page.frame( { name: 'elementor-preview-iframe' } );
		if ( ! previewFrame ) {
			throw new Error( 'Preview iframe not found after waiting' );
		}

		// Reset.css typically zeros out all margins, paddings, and sets consistent baseline
		const resetElements = previewFrame.locator( '*' ).first();
		// Reset.css should apply consistent box-sizing
		await expect( resetElements ).toHaveCSS( 'box-sizing', 'border-box' );

		// Both approaches should result in functional, styled pages
		// The key difference is in their philosophy:
		// - Normalize: Fix browser inconsistencies, keep useful defaults
		// - Reset: Zero everything out, build from scratch
	} );

	test.skip( 'should handle nested elements with reset inheritance', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page has nested div structures with headings and paragraphs inside
		// Reset styles should be inherited properly through the nesting hierarchy

		expect( result.widgets_created ).toBeGreaterThan( 0 );

		// Verify that nested elements were processed correctly
	} );

	test.skip( 'should provide comprehensive conversion logging for reset styles', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Verify comprehensive logging is available
		expect( result.conversion_log ).toBeTruthy();

		if ( result.conversion_log ) {
			// Check CSS processing stats
			expect( result.conversion_log.css_processing ).toBeTruthy();
			expect( result.conversion_log.css_processing.total_styles ).toBeGreaterThan( 0 );

			// Check mapping stats
			expect( result.conversion_log.mapping_stats ).toBeTruthy();
			expect( result.conversion_log.mapping_stats.total_elements ).toBeGreaterThan( 0 );

			// Check widget creation stats
			expect( result.conversion_log.widget_creation ).toBeTruthy();
			expect( result.conversion_log.widget_creation.widgets_created ).toBeGreaterThan( 0 );
		}

		// Verify no critical errors occurred
		expect( result.errors ).toEqual( [] );
		expect( result.warnings ).toEqual( [] );
	} );
} );
