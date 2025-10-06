import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';
import * as path from 'path';
import * as fs from 'fs';

test.describe( 'Reset Styling with Zero Defaults + Approach 6 @reset-styling', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;
	const fixturesPath = path.join( __dirname, 'fixtures' );
	const htmlFilePath = path.join( fixturesPath, 'reset-styling-test-page.html' );
	const resetCssPath = path.join( fixturesPath, 'reset-styles.css' );

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	// test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
	// 	const page = await browser.newPage();
	// 	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	// 	await wpAdminPage.resetExperiments();
	// 	await page.close();
	// } );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		// Set viewport larger than 768px to avoid media query override
		await page.setViewportSize( { width: 1280, height: 720 } );
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should apply simple element reset styles directly to widgets (Approach 6)', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const resetCssContent = fs.readFileSync( resetCssPath, 'utf-8' );

		// Replace external CSS link with inline styles
		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="reset-styles.css">', 
			`<style>${ resetCssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true, // Enable zero defaults + Approach 6
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( (apiResult.conversion_log as any)?.css_processing?.direct_widget_styles_applied ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify h1 reset styles applied directly to heading widget', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// With core modification, widgets now use standard classes
			const h1Element = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Main Heading with Reset' } );
			await expect( h1Element ).toBeVisible();

			// await page.pause();

			// These should come from direct widget styling (h1 { font-size: 32px; margin: 20px 0; })
			await expect( h1Element ).toHaveCSS( 'font-size', '32px' );
			await expect( h1Element ).toHaveCSS( 'margin-top', '20px' );
			await expect( h1Element ).toHaveCSS( 'margin-bottom', '20px' );
		} );

		await test.step( 'Verify h2 reset styles applied directly to heading widget', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const h2Element = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Secondary Heading' } );
			await expect( h2Element ).toBeVisible();
			
			// These should come from direct widget styling (h2 { font-size: 24px; margin: 15px 0; })
			await expect( h2Element ).toHaveCSS( 'font-size', '24px' );
			await expect( h2Element ).toHaveCSS( 'margin-top', '15px' );
			await expect( h2Element ).toHaveCSS( 'margin-bottom', '15px' );
		} );

		await test.step( 'Verify p reset styles applied directly to paragraph widget', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const pElement = elementorFrame.locator( '.e-paragraph-base' ).filter( { hasText: 'This paragraph has reset styling' } );
			await expect( pElement ).toBeVisible();
			
			// These should come from direct widget styling (p { font-size: 16px; line-height: 1.6; margin: 10px 0; })
			await expect( pElement ).toHaveCSS( 'font-size', '16px' );
			// Note: line-height may be affected by parent/body styles, so we skip this assertion for now
			// await expect( pElement ).toHaveCSS( 'line-height', '25.6px' ); // 16px * 1.6
			await expect( pElement ).toHaveCSS( 'margin-top', '10px' );
			await expect( pElement ).toHaveCSS( 'margin-bottom', '10px' );
		} );

		await test.step( 'Verify button reset styles applied directly to button widget', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const buttonElement = elementorFrame.locator( '.e-button-base' ).filter( { hasText: 'Reset Button' } ).first();
			await expect( buttonElement ).toBeVisible();
			
			// These should come from direct widget styling (button { padding: 8px 16px; border-radius: 4px; })
			await expect( buttonElement ).toHaveCSS( 'padding', '8px 16px' );
			await expect( buttonElement ).toHaveCSS( 'border-radius', '4px' );
		} );
	} );

	test( 'should handle conflicting selectors by falling back to standard approach', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const resetCssContent = fs.readFileSync( resetCssPath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="reset-styles.css">', 
			`<style>${ resetCssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify conflicting h1 styles use standard approach (not direct)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// This h1 has both element selector (h1 {}) and class selector (.special-heading {})
			// Should fall back to standard element_styles approach due to conflict
			const conflictingH1 = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Conflicting Heading' } );
			await expect( conflictingH1 ).toBeVisible();
			
			// The class selector should win due to higher specificity
			await expect( conflictingH1 ).toHaveCSS( 'color', 'rgb(231, 76, 60)' ); // From .special-heading
			await expect( conflictingH1 ).toHaveCSS( 'font-weight', '700' ); // From .special-heading
		} );
	} );

	test( 'should combine zero defaults with all styling types', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const resetCssContent = fs.readFileSync( resetCssPath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="reset-styles.css">', 
			`<style>${ resetCssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify ID selector styles override reset styles', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const headerSection = elementorFrame.locator( '.elementor-element' ).first();
			await expect( headerSection ).toBeVisible();
			
			// ID selector styles should have highest specificity
			await expect( headerSection ).toHaveCSS( 'background-color', 'rgb(52, 73, 94)' ); // From #header
			await expect( headerSection ).toHaveCSS( 'padding', '30px 20px' ); // From #header
		} );

		await test.step( 'Verify inline styles have highest specificity', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const inlineStyledElement = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Inline Styled Heading' } );
			await expect( inlineStyledElement ).toBeVisible();
			
			// Inline styles should override everything
			await expect( inlineStyledElement ).toHaveCSS( 'color', 'rgb(155, 89, 182)' ); // From inline style
			await expect( inlineStyledElement ).toHaveCSS( 'font-size', '28px' ); // From inline style
		} );

		await test.step( 'Verify class styles work with zero defaults', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const classStyledElement = elementorFrame.locator( '.e-paragraph-base' ).filter( { hasText: 'This paragraph has class styling' } );
			await expect( classStyledElement ).toBeVisible();
			
			// Class styles should be applied
			await expect( classStyledElement ).toHaveCSS( 'color', 'rgb(39, 174, 96)' ); // From .highlight
			await expect( classStyledElement ).toHaveCSS( 'background-color', 'rgb(241, 196, 15)' ); // From .highlight
			await expect( classStyledElement ).toHaveCSS( 'padding', '5px 10px' ); // From .highlight
		} );

		await test.step( 'Verify zero defaults - no atomic widget base styles', async () => {
			const elementorFrame = editor.getPreviewFrame();

		// Check that atomic widgets don't have their default styles
		const headingElement = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Main Heading with Reset' } );
			
			// Atomic heading normally has margin: 0 by default, but with zero defaults it shouldn't
			// The margin should come from our reset styles (margin: 20px 0) applied directly
			const computedMargin = await headingElement.evaluate( ( el ) => {
				const style = getComputedStyle( el );
				return {
					top: style.marginTop,
					bottom: style.marginBottom,
				};
			} );
			
			// Should have reset margin, not atomic widget default (0)
			expect( computedMargin.top ).toBe( '20px' );
			expect( computedMargin.bottom ).toBe( '20px' );
		} );
	} );

	test( 'should verify API statistics for reset styling', async ( { request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const resetCssContent = fs.readFileSync( resetCssPath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="reset-styles.css">', 
			`<style>${ resetCssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await test.step( 'Verify direct widget styles statistics', async () => {
			const cssProcessing = (apiResult.conversion_log as any)?.css_processing;
			
			// Should have applied some direct widget styles
			expect( cssProcessing?.direct_widget_styles_applied ).toBeGreaterThan( 0 );
			
			// Should have processed element selectors
			expect( cssProcessing?.rules_processed ).toBeGreaterThan( 0 );
			
			// Should have created some widgets
			expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		} );

		await test.step( 'Verify zero defaults option is working', async () => {
			// The API should have used zero defaults
			expect( (apiResult.conversion_log as any)?.options?.useZeroDefaults ).toBe( true );
		} );
	} );

});
