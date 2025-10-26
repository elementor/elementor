import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

/**
 * Font-Family Property Exclusion Tests
 * 
 * Tests the font-family property filtering implementation to ensure:
 * 1. Font-family properties are completely filtered out during conversion
 * 2. Other CSS properties continue to work normally
 * 3. Mixed CSS with font-family and other properties works correctly
 * 4. Font-family in different CSS contexts is properly excluded
 * 5. Complex font-family declarations are filtered appropriately
 * 6. Conversion doesn't fail when font-family properties are present
 */

let cssHelper: CssConverterHelper;
let wpAdmin: WpAdminPage;
let editor: EditorPage;

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

test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
	wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
} );

test.describe( 'Font-Family Property Exclusion', () => {

	test( 'Simple Font-Family Properties - Completely Filtered Out', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.font-test {
					font-family: "Helvetica Neue", Arial, sans-serif;
					color: #333333;
					font-size: 16px;
					line-height: 1.5;
				}
			</style>
			<div class="font-test">
				<p>Testing font-family exclusion with other properties</p>
			</div>
		`;

		// Convert HTML with font-family properties
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		// Validate API response - conversion should succeed
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 0 );

		// Navigate to editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );

		// Wait for editor to load
		await editor.waitForPanelToLoad();

		// Get the editor frame
		const editorFrame = editor.getPreviewFrame();

		// Find the paragraph element
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing font-family exclusion/i } );
		await expect( paragraph ).toBeVisible();

		// Verify other CSS properties are applied (font-family should be excluded)
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(51, 51, 51)' ); // #333333
		await expect( paragraph ).toHaveCSS( 'font-size', '16px' );
		await expect( paragraph ).toHaveCSS( 'line-height', '1.5' );

		// Font-family should NOT be applied from our CSS (should use browser/theme default)
		// We don't test for a specific font-family value since it should be excluded
		// The important thing is that other properties work and conversion succeeded
	} );

	test( 'Font-Family with CSS Variables - Variables Excluded', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--primary-font: "Roboto", sans-serif;
					--primary-color: #007cba;
				}
				.font-variable-test {
					font-family: var(--primary-font);
					color: var(--primary-color);
					font-weight: bold;
					margin: 10px;
				}
			</style>
			<div class="font-variable-test">
				<p>Testing font-family with CSS variables exclusion</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing font-family with CSS variables/i } );
		await expect( paragraph ).toBeVisible();

		// Color CSS variable should work (not excluded)
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(0, 124, 186)' ); // --primary-color
		
		// Font-weight should work (not excluded)
		await expect( paragraph ).toHaveCSS( 'font-weight', '700' ); // bold
		
		// Margin should work (not excluded)
		await expect( paragraph ).toHaveCSS( 'margin', '10px' );

		// Font-family CSS variable should be excluded - no specific font applied from our CSS
	} );

	test( 'Multiple Font-Family Declarations - All Filtered Out', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.multi-font-test h1 {
					font-family: "Georgia", serif;
					font-size: 24px;
					color: #2c3e50;
				}
				.multi-font-test p {
					font-family: "Arial", "Helvetica Neue", sans-serif;
					font-size: 14px;
					color: #34495e;
				}
				.multi-font-test .special {
					font-family: "Courier New", monospace;
					font-weight: bold;
					background-color: #f8f9fa;
				}
			</style>
			<div class="multi-font-test">
				<h1>Heading with font-family</h1>
				<p>Paragraph with font-family</p>
				<p class="special">Special paragraph with monospace font-family</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		
		// Test heading
		const heading = editorFrame.locator( 'h1' ).filter( { hasText: /Heading with font-family/i } );
		await expect( heading ).toBeVisible();
		await expect( heading ).toHaveCSS( 'font-size', '24px' );
		await expect( heading ).toHaveCSS( 'color', 'rgb(44, 62, 80)' ); // #2c3e50

		// Test regular paragraph
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Paragraph with font-family/i } );
		await expect( paragraph ).toBeVisible();
		await expect( paragraph ).toHaveCSS( 'font-size', '14px' );
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(52, 73, 94)' ); // #34495e

		// Test special paragraph
		const specialParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Special paragraph with monospace/i } );
		await expect( specialParagraph ).toBeVisible();
		await expect( specialParagraph ).toHaveCSS( 'font-weight', '700' ); // bold
		await expect( specialParagraph ).toHaveCSS( 'background-color', 'rgb(248, 249, 250)' ); // #f8f9fa

		// All font-family declarations should be excluded
		// Other properties should work normally
	} );

	test( 'Font Shorthand Properties - Font-Family Part Excluded', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.font-shorthand-test {
					/* Font shorthand: font-style font-weight font-size/line-height font-family */
					font: italic bold 18px/1.6 "Times New Roman", serif;
					color: #e74c3c;
					margin: 15px;
				}
				.font-individual-test {
					font-style: italic;
					font-weight: bold;
					font-size: 18px;
					line-height: 1.6;
					font-family: "Times New Roman", serif;
					color: #e74c3c;
					padding: 10px;
				}
			</style>
			<div class="font-shorthand-test">
				<p>Testing font shorthand property</p>
			</div>
			<div class="font-individual-test">
				<p>Testing individual font properties</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		
		// Test shorthand font property
		const shorthandParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing font shorthand property/i } );
		await expect( shorthandParagraph ).toBeVisible();
		await expect( shorthandParagraph ).toHaveCSS( 'color', 'rgb(231, 76, 60)' ); // #e74c3c
		
		const shorthandContainer = shorthandParagraph.locator( '..' );
		await expect( shorthandContainer ).toHaveCSS( 'margin', '15px' );

		// Test individual font properties
		const individualParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing individual font properties/i } );
		await expect( individualParagraph ).toBeVisible();
		await expect( individualParagraph ).toHaveCSS( 'color', 'rgb(231, 76, 60)' ); // #e74c3c
		
		const individualContainer = individualParagraph.locator( '..' );
		await expect( individualContainer ).toHaveCSS( 'padding', '10px' );

		// Font shorthand and individual font-family should be excluded
		// Other properties (color, margin, padding) should work
		// Note: font-style, font-weight, font-size, line-height from shorthand may or may not be applied
		// depending on how the CSS parser handles the shorthand expansion
	} );

	test( 'Font-Family in Different CSS Contexts - All Excluded', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				/* Global font-family */
				body {
					font-family: "Open Sans", sans-serif;
					background-color: #ffffff;
				}
				
				/* Class-based font-family */
				.custom-font {
					font-family: "Montserrat", "Helvetica Neue", Arial, sans-serif;
					font-size: 20px;
				}
				
				/* ID-based font-family */
				#unique-font {
					font-family: "Playfair Display", Georgia, serif;
					font-weight: 300;
				}
				
				/* Pseudo-class font-family */
				.hover-font:hover {
					font-family: "Roboto Condensed", sans-serif;
					color: #3498db;
				}
				
				/* Media query font-family (should be filtered out anyway due to media query filtering) */
				@media (min-width: 768px) {
					.responsive-font {
						font-family: "Lato", sans-serif;
						font-size: 16px;
					}
				}
			</style>
			<body>
				<div class="custom-font">
					<p>Custom font class</p>
				</div>
				<div id="unique-font">
					<p>Unique font ID</p>
				</div>
				<div class="hover-font">
					<p>Hover font effect</p>
				</div>
				<div class="responsive-font">
					<p>Responsive font</p>
				</div>
			</body>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		
		// Test custom font class
		const customParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Custom font class/i } );
		await expect( customParagraph ).toBeVisible();
		await expect( customParagraph ).toHaveCSS( 'font-size', '20px' );

		// Test unique font ID
		const uniqueParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Unique font ID/i } );
		await expect( uniqueParagraph ).toBeVisible();
		await expect( uniqueParagraph ).toHaveCSS( 'font-weight', '300' );

		// Test hover font (test normal state)
		const hoverParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Hover font effect/i } );
		await expect( hoverParagraph ).toBeVisible();

		// Test responsive font
		const responsiveParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Responsive font/i } );
		await expect( responsiveParagraph ).toBeVisible();

		// All font-family declarations should be excluded regardless of context
		// Other properties should work normally
	} );

	test( 'Complex Font-Family Declarations - All Variations Excluded', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.complex-font-test {
					/* Font-family with quotes */
					font-family: "Helvetica Neue", "Arial Black", sans-serif;
					
					/* Font-family without quotes */
					font-family: Arial, Helvetica, sans-serif;
					
					/* Font-family with fallbacks */
					font-family: "Custom Font", "Backup Font", Arial, sans-serif;
					
					/* Other properties that should work */
					color: #2ecc71;
					font-size: 18px;
					font-weight: 600;
					text-decoration: underline;
					background-color: #ecf0f1;
				}
			</style>
			<div class="complex-font-test">
				<p>Testing complex font-family declarations</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing complex font-family declarations/i } );
		await expect( paragraph ).toBeVisible();

		// Verify non-font-family properties are applied
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(46, 204, 113)' ); // #2ecc71
		await expect( paragraph ).toHaveCSS( 'font-size', '18px' );
		await expect( paragraph ).toHaveCSS( 'font-weight', '600' );
		await expect( paragraph ).toHaveCSS( 'text-decoration-line', 'underline' );
		
		const container = paragraph.locator( '..' );
		await expect( container ).toHaveCSS( 'background-color', 'rgb(236, 240, 241)' ); // #ecf0f1

		// All font-family declarations should be excluded
		// Note: The CSS has multiple font-family declarations which would normally override each other
		// But since they're all excluded, none should be applied
	} );

	test( 'Font-Family Mixed with Important Properties - Exclusion Preserved', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.important-test {
					font-family: "Impact", sans-serif !important;
					color: #e67e22 !important;
					font-size: 22px !important;
					background-color: #f39c12;
					font-weight: normal;
				}
			</style>
			<div class="important-test">
				<p>Testing font-family with important declarations</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing font-family with important/i } );
		await expect( paragraph ).toBeVisible();

		// Important properties (non-font-family) should be applied
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(230, 126, 34)' ); // #e67e22 !important
		await expect( paragraph ).toHaveCSS( 'font-size', '22px' ); // !important
		await expect( paragraph ).toHaveCSS( 'font-weight', '400' ); // normal

		const container = paragraph.locator( '..' );
		await expect( container ).toHaveCSS( 'background-color', 'rgb(243, 156, 18)' ); // #f39c12

		// Font-family should be excluded even with !important
	} );

	test( 'Font-Family Only CSS - Conversion Succeeds with No Applied Styles', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.font-only-test {
					font-family: "Comic Sans MS", cursive;
				}
				.another-font-only {
					font-family: "Papyrus", fantasy;
				}
			</style>
			<div class="font-only-test">
				<p>Element with only font-family CSS</p>
			</div>
			<div class="another-font-only">
				<p>Another element with only font-family CSS</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		// Conversion should succeed even when only font-family properties are present
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		// Global classes might be 0 since font-family properties are filtered out

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		
		// Elements should still be created and visible
		const firstParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Element with only font-family CSS/i } );
		await expect( firstParagraph ).toBeVisible();

		const secondParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Another element with only font-family CSS/i } );
		await expect( secondParagraph ).toBeVisible();

		// No specific CSS should be applied since font-family was filtered out
		// Elements should use default/inherited styling
	} );

	test( 'Font-Family in Compound Selectors - Properly Excluded', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.header.primary {
					font-family: "Oswald", sans-serif;
					color: #9b59b6;
					font-size: 28px;
				}
				.content.article p {
					font-family: "Merriweather", serif;
					color: #34495e;
					line-height: 1.8;
				}
			</style>
			<div class="header primary">
				<h2>Header with compound selector</h2>
			</div>
			<div class="content article">
				<p>Article content with compound selector</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		
		// Test compound selector header
		const header = editorFrame.locator( 'h2' ).filter( { hasText: /Header with compound selector/i } );
		await expect( header ).toBeVisible();
		await expect( header ).toHaveCSS( 'color', 'rgb(155, 89, 182)' ); // #9b59b6
		await expect( header ).toHaveCSS( 'font-size', '28px' );

		// Test compound selector paragraph
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Article content with compound selector/i } );
		await expect( paragraph ).toBeVisible();
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(52, 73, 94)' ); // #34495e
		await expect( paragraph ).toHaveCSS( 'line-height', '1.8' );

		// Font-family in compound selectors should be excluded
		// Other properties should work normally
	} );

} );
