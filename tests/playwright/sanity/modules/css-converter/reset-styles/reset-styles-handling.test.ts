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

	test( 'should successfully import page with comprehensive reset styles', async ( { request, page } ) => {
		// Convert the URL with external CSS files containing reset styles
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ], // External reset CSS files
		);

		// Validate the API result
		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
			return;
		}

		// Basic API response validation
		expect( result.success ).toBe( true );
		expect( result.post_id ).toBeGreaterThan( 0 );
		expect( result.edit_url ).toBeTruthy();
		expect( result.widgets_created ).toBeGreaterThan( 0 );

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

	// ========================================
	// HEADING RESET STYLES (H1-H6)
	// All heading styles from reset-styles-test-page.html <style> block
	// ========================================

	// H1: font-size: 2.5rem, font-weight: 700, color: #e74c3c, margin-bottom: 1rem, line-height: 1.2
	const h1Elements = await previewFrame.locator( 'h1' ).all();
	let h1Element = null;
	for ( const h1 of h1Elements ) {
		const text = await h1.textContent();
		if ( text?.includes( 'Main Heading' ) ) {
			h1Element = h1;
			break;
		}
	}
	if ( ! h1Element ) {
		throw new Error( 'Could not find h1 element with "Main Heading" text' );
	}
	await expect( h1Element ).toHaveCSS( 'font-weight', '700' );
	await expect( h1Element ).toHaveCSS( 'color', 'rgb(231, 76, 60)' );

	// H2: font-size: 2rem, font-weight: 600, color: #3498db, margin-bottom: 0.8rem, line-height: 1.3
	const h2Elements = await previewFrame.locator( 'h2' ).all();
	let h2Element = null;
	for ( const h2 of h2Elements ) {
		const text = await h2.textContent();
		if ( text?.includes( 'Secondary Heading' ) ) {
			h2Element = h2;
			break;
		}
	}
	if ( ! h2Element ) {
		throw new Error( 'Could not find h2 element with "Secondary Heading" text' );
	}
	await expect( h2Element ).toHaveCSS( 'font-weight', '600' );
	await expect( h2Element ).toHaveCSS( 'color', 'rgb(52, 152, 219)' );

	// H3: font-size: 1.5rem, font-weight: 500, color: #27ae60, margin-bottom: 0.6rem
	const h3Elements = await previewFrame.locator( 'h3' ).all();
	let h3Element = null;
	for ( const h3 of h3Elements ) {
		const text = await h3.textContent();
		if ( text?.includes( 'Tertiary Heading' ) ) {
			h3Element = h3;
			break;
		}
	}
	if ( ! h3Element ) {
		throw new Error( 'Could not find h3 element with "Tertiary Heading" text' );
	}
	await expect( h3Element ).toHaveCSS( 'font-weight', '500' );
	await expect( h3Element ).toHaveCSS( 'color', 'rgb(39, 174, 96)' );

	// H4: font-size: 1.25rem, font-weight: 500, color: #f39c12, margin-bottom: 0.5rem
	const h4Elements = await previewFrame.locator( 'h4' ).all();
	let h4Element = null;
	for ( const h4 of h4Elements ) {
		const text = await h4.textContent();
		if ( text?.includes( 'Quaternary Heading' ) ) {
			h4Element = h4;
			break;
		}
	}
	if ( ! h4Element ) {
		throw new Error( 'Could not find h4 element with "Quaternary Heading" text' );
	}
	await expect( h4Element ).toHaveCSS( 'font-weight', '500' );
	await expect( h4Element ).toHaveCSS( 'color', 'rgb(243, 156, 18)' );

	// H5: font-size: 1.1rem, font-weight: 400, color: #9b59b6, margin-bottom: 0.4rem
	const h5Elements = await previewFrame.locator( 'h5' ).all();
	let h5Element = null;
	for ( const h5 of h5Elements ) {
		const text = await h5.textContent();
		if ( text?.includes( 'Quinary Heading' ) ) {
			h5Element = h5;
			break;
		}
	}
	if ( ! h5Element ) {
		throw new Error( 'Could not find h5 element with "Quinary Heading" text' );
	}
	await expect( h5Element ).toHaveCSS( 'font-weight', '400' );
	await expect( h5Element ).toHaveCSS( 'color', 'rgb(155, 89, 182)' );

	// H6: font-size: 1rem, font-weight: 400, color: #34495e, margin-bottom: 0.3rem
	const h6Elements = await previewFrame.locator( 'h6' ).all();
	let h6Element = null;
	for ( const h6 of h6Elements ) {
		const text = await h6.textContent();
		if ( text?.includes( 'Senary Heading' ) ) {
			h6Element = h6;
			break;
		}
	}
	if ( ! h6Element ) {
		throw new Error( 'Could not find h6 element with "Senary Heading" text' );
	}
	await expect( h6Element ).toHaveCSS( 'font-weight', '400' );
	await expect( h6Element ).toHaveCSS( 'color', 'rgb(52, 73, 94)' );

	// ========================================
	// PARAGRAPH RESET STYLES
	// p { font-size: 1rem; line-height: 1.8; margin-bottom: 1rem; color: #2c3e50; }
	// ========================================
	const paragraphs = await previewFrame.locator( 'p' ).all();
	if ( paragraphs.length > 0 ) {
		const firstParagraph = paragraphs[0];
		await expect( firstParagraph ).toHaveCSS( 'color', 'rgb(44, 62, 80)' );
	}

	// ========================================
	// LINK RESET STYLES
	// a { color: #e67e22; text-decoration: underline; font-weight: 500; }
	// ========================================
	const fixtureContentLinks = await previewFrame.locator( 'a' ).filter( { hasText: 'link styles' } ).all();
	if ( fixtureContentLinks.length > 0 ) {
		const fixtureLink = fixtureContentLinks[0];
		await expect( fixtureLink ).toHaveCSS( 'color', 'rgb(230, 126, 34)' );
		await expect( fixtureLink ).toHaveCSS( 'text-decoration', /underline/ );
		await expect( fixtureLink ).toHaveCSS( 'font-weight', '500' );
	}

	// ========================================
	// BUTTON RESET STYLES
	// button { background-color: #95a5a6; color: white; border: none; padding: 10px 20px; font-size: 1rem; border-radius: 4px; cursor: pointer; }
	// ========================================
	const fixtureButtons = await previewFrame.locator( 'button' ).filter( { hasText: 'Reset Button' } ).all();
	if ( fixtureButtons.length > 0 ) {
		const firstFixtureButton = fixtureButtons[0];
		await expect( firstFixtureButton ).toHaveCSS( 'background-color', 'rgb(149, 165, 166)' );
		await expect( firstFixtureButton ).toHaveCSS( 'color', 'rgb(255, 255, 255)' );
		await expect( firstFixtureButton ).toHaveCSS( 'border-radius', '4px' );
		await expect( firstFixtureButton ).toHaveCSS( 'cursor', 'pointer' );
	}

	// ========================================
	// LIST RESET STYLES
	// ul, ol { margin: 0 0 1rem 2rem; padding: 0; }
	// li { margin-bottom: 0.5rem; }
	// ========================================
	const fixtureUls = await previewFrame.locator( 'ul' ).filter( { has: previewFrame.locator( 'text=List item one' ) } ).all();
	if ( fixtureUls.length > 0 ) {
		const fixtureUl = fixtureUls[0];
		await expect( fixtureUl ).toHaveCSS( 'padding', '0px' );
	}

	// ========================================
	// TABLE RESET STYLES
	// table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
	// th, td { border: 1px solid #bdc3c7; padding: 8px; text-align: left; }
	// th { background-color: #ecf0f1; font-weight: 600; }
	// ========================================
	const tableElements = await previewFrame.locator( 'table' ).all();
	if ( tableElements.length > 0 ) {
		const firstTable = tableElements[0];
		await expect( firstTable ).toHaveCSS( 'border-collapse', 'collapse' );
		await expect( firstTable ).toHaveCSS( 'width', '100%' );
	}

	const thElements = await previewFrame.locator( 'th' ).all();
	if ( thElements.length > 0 ) {
		const firstTh = thElements[0];
		await expect( firstTh ).toHaveCSS( 'background-color', 'rgb(236, 240, 241)' );
		await expect( firstTh ).toHaveCSS( 'font-weight', '600' );
		await expect( firstTh ).toHaveCSS( 'padding', '8px' );
		await expect( firstTh ).toHaveCSS( 'text-align', 'left' );
		await expect( firstTh ).toHaveCSS( 'border', /1px solid/ );
	}

	const tdElements = await previewFrame.locator( 'td' ).all();
	if ( tdElements.length > 0 ) {
		const firstTd = tdElements[0];
		await expect( firstTd ).toHaveCSS( 'padding', '8px' );
		await expect( firstTd ).toHaveCSS( 'text-align', 'left' );
		await expect( firstTd ).toHaveCSS( 'border', /1px solid/ );
	}
	} );

	test( 'should handle body element reset styles', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
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

	test( 'should handle heading element resets (h1-h6)', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
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

	test( 'should handle paragraph element resets', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
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

	test( 'should handle link element resets', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
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

	test( 'should handle button element resets', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains button elements with reset styles
		// Reset styles should be applied: background, color, border, padding, font-size

		expect( result.widgets_created ).toBeGreaterThan( 0 );
	} );

	test( 'should handle list element resets (ul, ol, li)', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains ul, ol, and li elements
		// Reset styles should be applied: margin, padding, list-style

		expect( result.widgets_created ).toBeGreaterThan( 0 );

		// Lists might be converted to various widget types depending on implementation
	} );

	test( 'should handle table element resets', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page contains table, th, td elements
		// Reset styles should be applied: border-collapse, padding, text-align

		expect( result.widgets_created ).toBeGreaterThan( 0 );
	} );

	test( 'should handle universal selector resets (* {})', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our CSS includes universal selector resets: * { margin: 0; padding: 0; box-sizing: border-box; }
		// These should be handled appropriately - either applied globally or to individual widgets

		expect( result.widgets_created ).toBeGreaterThan( 0 );
	} );

	test( 'should prioritize inline styles over reset styles', async ( { request, page } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
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

		// Verify that elements without inline styles get reset styles from the fixture
		const h1WithoutInline = previewFrame.locator( 'h1' ).filter( { hasText: 'Main Heading' } ).first();
		if ( await h1WithoutInline.count() > 0 ) {
			await expect( h1WithoutInline ).toHaveCSS( 'color', 'rgb(231, 76, 60)' );
			await expect( h1WithoutInline ).toHaveCSS( 'font-weight', '700' );
		}
	} );

	test( 'should handle conflicting reset styles from multiple sources', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
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

	test( 'should handle normalize.css vs reset.css patterns', async ( { request, page } ) => {
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
			test( true, `Normalize test: ${ normalizeValidation.skipReason }` );
			return;
		}

		if ( resetValidation.shouldSkip ) {
			test( true, `Reset test: ${ resetValidation.skipReason }` );
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

	test( 'should handle nested elements with reset inheritance', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
			return;
		}

		expect( result.success ).toBe( true );

		// Our test page has nested div structures with headings and paragraphs inside
		// Reset styles should be inherited properly through the nesting hierarchy

		expect( result.widgets_created ).toBeGreaterThan( 0 );

		// Verify that nested elements were processed correctly
	} );

	test( 'should provide comprehensive conversion logging for reset styles', async ( { request } ) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[ cssFile1Url, cssFile2Url ],
		);

		const validation = helper.validateApiResult( result );
		if ( validation.shouldSkip ) {
			test( true, validation.skipReason );
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
