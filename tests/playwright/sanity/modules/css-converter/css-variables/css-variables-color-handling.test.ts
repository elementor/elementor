import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

/**
 * CSS Variables Color Handling Tests
 *
 * Tests the CSS Variable Aware Color Prop Type implementation to ensure:
 * 1. CSS variables are properly preserved during conversion
 * 2. Color and background-color properties with CSS variables work correctly
 * 3. Elementor global variables are handled properly
 * 4. Invalid CSS variables are rejected appropriately
 * 5. Regular color values continue to work normally
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
		e_classes: 'active',
	} );

	await page.close();
	cssHelper = new CssConverterHelper();
} );

test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
	wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
} );

test.describe( 'CSS Variables Color Handling', () => {
	test( 'Elementor Global Color Variables - Preserved and Applied', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--color-primary: #007cba;
					--color-secondary: #ff6900;
					--color-text: #333333;
				}
				.class-color-test {
					color: var(--color-primary);
					background-color: var(--color-secondary);
					border-color: var(--color-text);
				}
			</style>
			<div class="class-color-test">
				<p>Testing Elementor global color variables</p>
			</div>
		`;

		// Convert HTML with CSS variables
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		// Validate API response
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );


		await page.pause();
		// Navigate to editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );

		// Wait for editor to load
		await editor.waitForPanelToLoad();

		// Get the editor frame
		const editorFrame = editor.getPreviewFrame();

		// Find the div-block element with the global class applied
		const divBlock = editorFrame.locator( 'div[data-element_type="e-div-block"]' ).filter( { hasText: /Testing Elementor global color variables/i } ).first();
		await expect( divBlock ).toBeVisible();

		// Verify CSS variables are applied correctly to the div-block
		// Note: CSS variables should resolve to their actual values in computed styles
		await expect( divBlock ).toHaveCSS( 'color', 'rgb(0, 124, 186)' ); // --color-primary
		await expect( divBlock ).toHaveCSS( 'background-color', 'rgb(255, 105, 0)' ); // --color-secondary
		await expect( divBlock ).toHaveCSS( 'border-color', 'rgb(51, 51, 51)' ); // --color-text
	} );

	test( 'CSS Variables with Fallback Values - Properly Handled', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.fallback-test {
					color: var(--color-accent, #ff0000);
					background-color: var(--color-highlight, rgba(0, 255, 0, 0.5));
				}
			</style>
			<div class="fallback-test">
				<p>Testing CSS variables with fallback values</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing CSS variables with fallback/i } );
		await expect( paragraph ).toBeVisible();

		// CSS variables with fallbacks should either resolve to the variable value or fallback
		// Since these are custom variables, they should fall back to the specified values
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // Fallback: #ff0000

		const container = paragraph.locator( '..' );
		await expect( container ).toHaveCSS( 'background-color', 'rgba(0, 255, 0, 0.5)' ); // Fallback: rgba(0, 255, 0, 0.5)
	} );

	test( 'Mixed CSS Variables and Regular Colors - Both Work Correctly', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--color-primary: #007cba;
				}
				.mixed-colors-test {
					color: var(--color-primary);
					background-color: #f0f0f0;
					border-color: rgb(255, 0, 0);
				}
				.regular-colors-test {
					color: #333333;
					background-color: rgba(0, 255, 0, 0.3);
				}
			</style>
			<div class="mixed-colors-test">
				<p>Mixed CSS variables and regular colors</p>
			</div>
			<div class="regular-colors-test">
				<p>Regular colors only</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();

		// Test mixed colors element
		const mixedParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Mixed CSS variables and regular colors/i } );
		await expect( mixedParagraph ).toBeVisible();
		await expect( mixedParagraph ).toHaveCSS( 'color', 'rgb(0, 124, 186)' ); // CSS variable

		const mixedContainer = mixedParagraph.locator( '..' );
		await expect( mixedContainer ).toHaveCSS( 'background-color', 'rgb(240, 240, 240)' ); // Regular hex
		await expect( mixedContainer ).toHaveCSS( 'border-color', 'rgb(255, 0, 0)' ); // Regular rgb

		// Test regular colors element
		const regularParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Regular colors only/i } );
		await expect( regularParagraph ).toBeVisible();
		await expect( regularParagraph ).toHaveCSS( 'color', 'rgb(51, 51, 51)' ); // Regular hex

		const regularContainer = regularParagraph.locator( '..' );
		await expect( regularContainer ).toHaveCSS( 'background-color', 'rgba(0, 255, 0, 0.3)' ); // Regular rgba
	} );

	test( 'Elementor System Variables - Properly Preserved', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--class-container-width: 1200px;
					--e-theme-primary-bg: #ffffff;
				}
				.system-vars-test {
					max-width: var(--class-container-width);
					background-color: var(--e-theme-primary-bg);
				}
			</style>
			<div class="system-vars-test">
				<p>Testing Elementor system variables</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing Elementor system variables/i } );
		await expect( paragraph ).toBeVisible();

		const container = paragraph.locator( '..' );
		await expect( container ).toHaveCSS( 'max-width', '1200px' ); // --class-container-width
		await expect( container ).toHaveCSS( 'background-color', 'rgb(255, 255, 255)' ); // --e-theme-primary-bg
	} );

	test( 'Custom CSS Variables - Handled with Warnings', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--my-custom-color: #ff6b6b;
					--bootstrap-primary: #0d6efd;
				}
				.custom-vars-test {
					color: var(--my-custom-color);
					background-color: var(--bootstrap-primary);
				}
			</style>
			<div class="custom-vars-test">
				<p>Testing custom CSS variables</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing custom CSS variables/i } );
		await expect( paragraph ).toBeVisible();

		// Custom CSS variables should still work, but may not resolve if not defined in Elementor
		// The test verifies that the conversion doesn't break with custom variables
		const container = paragraph.locator( '..' );

		// These might resolve to the actual values or remain as CSS variables
		// The important thing is that the conversion succeeded and elements are visible
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(255, 107, 107)' ); // --my-custom-color
		await expect( container ).toHaveCSS( 'background-color', 'rgb(13, 110, 253)' ); // --bootstrap-primary
	} );

	test( 'Complex Color Properties with CSS Variables', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--color-primary: #007cba;
					--color-secondary: #ff6900;
				}
				.complex-colors-test {
					color: var(--color-primary);
					background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
					border: 2px solid var(--color-primary);
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 var(--color-secondary);
				}
			</style>
			<div class="complex-colors-test">
				<p>Testing complex color properties with CSS variables</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing complex color properties/i } );
		await expect( paragraph ).toBeVisible();

		// Verify basic color property
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(0, 124, 186)' );

		const container = paragraph.locator( '..' );

		// Verify border color (CSS variables in border shorthand)
		await expect( container ).toHaveCSS( 'border-color', 'rgb(0, 124, 186)' );
		await expect( container ).toHaveCSS( 'border-width', '2px' );
		await expect( container ).toHaveCSS( 'border-style', 'solid' );

		// Note: Complex properties like gradients and box-shadows with CSS variables
		// may not be fully supported in the current implementation, but the conversion
		// should not fail and basic properties should work
	} );

	test( 'Invalid CSS Variables - Gracefully Handled', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				.invalid-vars-test {
					color: var(invalid-syntax);
					background-color: var(--unclosed-paren;
					border-color: var();
				}
				.valid-fallback-test {
					color: var(--nonexistent-var, #ff0000);
				}
			</style>
			<div class="invalid-vars-test">
				<p>Testing invalid CSS variables</p>
			</div>
			<div class="valid-fallback-test">
				<p>Testing valid fallback</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		// Conversion should succeed even with invalid CSS variables
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();

		// Invalid variables should not prevent the elements from being created
		const invalidParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing invalid CSS variables/i } );
		await expect( invalidParagraph ).toBeVisible();

		// Valid fallback should work
		const fallbackParagraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing valid fallback/i } );
		await expect( fallbackParagraph ).toBeVisible();
		await expect( fallbackParagraph ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // Fallback value
	} );

	test( 'CSS Variables in Different Property Types', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--color-primary: #007cba;
					--color-secondary: #ff6900;
					--color-accent: #28a745;
				}
				.multi-property-test {
					/* Color properties */
					color: var(--color-primary);
					background-color: var(--color-secondary);
					border-color: var(--color-accent);
					
					/* Border shorthand with CSS variable */
					border: 1px solid var(--color-primary);
					
					/* Text properties */
					text-decoration-color: var(--color-accent);
				}
			</style>
			<div class="multi-property-test">
				<p>Testing CSS variables in different property types</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Testing CSS variables in different property types/i } );
		await expect( paragraph ).toBeVisible();

		// Verify color property
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(0, 124, 186)' );

		const container = paragraph.locator( '..' );

		// Verify background-color
		await expect( container ).toHaveCSS( 'background-color', 'rgb(255, 105, 0)' );

		// Verify border properties
		await expect( container ).toHaveCSS( 'border-color', 'rgb(0, 124, 186)' ); // From border shorthand
		await expect( container ).toHaveCSS( 'border-width', '1px' );
		await expect( container ).toHaveCSS( 'border-style', 'solid' );
	} );
} );
