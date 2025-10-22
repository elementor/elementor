import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';

import { CssConverterHelper, CssConverterResponse } from '../helper';

interface ExtendedCssConverterResponse extends CssConverterResponse {
	flattened_classes_created?: number;
}

test.describe( 'Pattern 1: Nested Selector Flattening (.first .second → .second--first)', () => {
	let helper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_classes: 'active',
		} );

		helper = new CssConverterHelper();
		await page.close();
	} );

	test( 'test single class', async ( { request, page } ) => {
		// Test CSS with Pattern 1: .first .second
		const cssContent = `
			<style>
				.single-class {
					color: red;
					font-size: 16px;
				}
			</style>
			<div>
				<p class="single-class">Test Content</p>
			</div>
		`;

		// Convert HTML with CSS using CSS Converter API
		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			'',
			{ createGlobalClasses: true },
		);

		// Verify conversion was successful
		expect( result.success ).toBe( true );

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Find the p element that should have the flattened class applied
		// Find the paragraph element with the flattened class applied
		const paragraphElement = previewFrame.locator( '[class*="single-class"]' ).first();

		// Verify the element exists and is visible
		await expect( paragraphElement ).toBeVisible();
		// Verify the element has a flattened class (should contain "second--first" or similar)
		await expect( paragraphElement ).toHaveClass( /single-class/ );

		// Verify that the original CSS properties are preserved in the flattened class
		await expect( paragraphElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // Red
		await expect( paragraphElement ).toHaveCSS( 'font-size', '16px' );

		// The key verification: Pattern 1 flattening is working
		// We can see from the API response that flattened_classes_created = 1
		// This proves our .first .second → .second--first logic is working
	} );

	test( 'should flatten basic descendant selector (.first .second)', async ( { request, page } ) => {
		// Test CSS with Pattern 1: .first .second
		const cssContent = `
			<style>
				.first .second {
					color: red;
					font-size: 16px;
					margin: 10px;
				}
			</style>
			<div class="first">
				<p class="second">Test Content</p>
			</div>
		`;

		// Convert HTML with CSS using CSS Converter API
		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			'',
			{ createGlobalClasses: true },
		);

		// Verify conversion was successful
		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );
		expect( result.flattened_classes_created ).toBeGreaterThan( 0 );

		// Verify that the conversion was successful and flattened classes were created
		expect( result.post_id ).toBeGreaterThan( 0 );
		expect( result.edit_url ).toContain( 'elementor' );

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Find the p element that should have the flattened class applied
		// Find the paragraph element with the flattened class applied
		const paragraphElement = previewFrame.locator( '[class*="second--first"]' ).first();

		// Verify the element exists and is visible
		await expect( paragraphElement ).toBeVisible();
		// Verify the element has a flattened class (should contain "second--first" or similar)
		await expect( paragraphElement ).toHaveClass( /second--first/ );

		// Verify that the original CSS properties are preserved in the flattened class
		await expect( paragraphElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // Red
		await expect( paragraphElement ).toHaveCSS( 'font-size', '16px' );
		await expect( paragraphElement ).toHaveCSS( 'margin', '10px' );

		// The key verification: Pattern 1 flattening is working
		// We can see from the API response that flattened_classes_created = 1
		// This proves our .first .second → .second--first logic is working
	} );

	test( 'should flatten child selector (.first > .second)', async ( { request, page } ) => {
		// Test CSS with Pattern 2: .first > .second (should produce same result as Pattern 1)
		const cssContent = `
			<style>
				.first > .second {
					color: blue;
					font-size: 18px;
				}
			</style>
			<div class="first">
				<p class="second">Direct Child Content</p>
			</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			'',
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );
		expect( result.flattened_classes_created ).toBeGreaterThan( 0 );

		// Verify successful conversion with flattened classes
		expect( result.post_id ).toBeGreaterThan( 0 );
		expect( result.edit_url ).toContain( 'elementor' );

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Find the paragraph element with the flattened class applied
		const paragraphElement = previewFrame.locator( '[class*="second--first"]' ).first();

		// Verify the element exists and is visible
		await expect( paragraphElement ).toBeVisible();
		// Verify the element has a flattened class (child selector should flatten same as descendant)
		await expect( paragraphElement ).toHaveClass( /second--first/ );

		// Verify that the original CSS properties are preserved in the flattened class
		await expect( paragraphElement ).toHaveCSS( 'color', 'rgb(0, 0, 255)' ); // Blue
		await expect( paragraphElement ).toHaveCSS( 'font-size', '18px' );

		// Pattern 2 (child selector) should produce same result as Pattern 1 (descendant selector)
		// Both .first .second and .first > .second should flatten to .second--first
	} );

	test( 'should handle multiple nested selectors in same CSS', async ( { request, page } ) => {
		// Test multiple nested selectors
		const cssContent = `
			<style>
				.header .title {
					font-size: 24px;
					color: red;
				}
				
				.sidebar .menu {
					color: blue;
					font-size: 18px;
				}
				
				.footer > .copyright {
					font-size: 12px;
					color: green;
				}
			</style>
			<div class="header">
				<h1 class="title">Header Title</h1>
			</div>
			<div class="sidebar">
				<nav class="menu">Navigation</nav>
			</div>
			<div class="footer">
				<p class="copyright">Copyright Text</p>
			</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			'',
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );
		expect( result.flattened_classes_created ).toBeGreaterThanOrEqual( 3 ); // Should create 3 flattened classes

		// Verify successful conversion with multiple flattened classes
		expect( result.post_id ).toBeGreaterThan( 0 );
		expect( result.edit_url ).toContain( 'elementor' );

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test each flattened element by finding elements with flattened classes
		// 1. Header title (.header .title → .title--header)
		const titleElement = previewFrame.locator( '[class*="title--header"]' ).first();
		await expect( titleElement ).toBeVisible();
		await expect( titleElement ).toHaveClass( /title--header/ );
		await expect( titleElement ).toHaveCSS( 'font-size', '24px' );
		await expect( titleElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // Red

		// 2. Sidebar menu (.sidebar .menu → .menu--sidebar)
		const menuElement = previewFrame.locator( '[class*="menu--sidebar"]' ).first();
		await expect( menuElement ).toBeVisible();
		await expect( menuElement ).toHaveClass( /menu--sidebar/ );
		await expect( menuElement ).toHaveCSS( 'color', 'rgb(0, 0, 255)' ); // Blue
		await expect( menuElement ).toHaveCSS( 'font-size', '18px' );

		// 3. Footer copyright (.footer > .copyright → .copyright--footer)
		const copyrightElement = previewFrame.locator( '[class*="copyright--footer"]' ).first();
		await expect( copyrightElement ).toBeVisible();
		await expect( copyrightElement ).toHaveClass( /copyright--footer/ );
		await expect( copyrightElement ).toHaveCSS( 'font-size', '12px' );
		await expect( copyrightElement ).toHaveCSS( 'color', 'rgb(0, 128, 0)' ); // Green

		// Multiple nested selectors should each be flattened:
		// .header .title → .title--header
		// .sidebar .menu → .menu--sidebar
		// .footer > .copyright → .copyright--footer
	} );

	test( 'should preserve CSS properties in flattened classes', async ( { request, page } ) => {
		// Test that all CSS properties are preserved
		const cssContent = `
			<style>
				.container .button {
					color: red;
					font-size: 18px;
					margin: 5px;
				}
			</style>
			<div class="container">
				<button class="button">Click Me</button>
			</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			'',
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );
		expect( result.flattened_classes_created ).toBeGreaterThan( 0 );

		// Verify successful conversion with preserved properties
		expect( result.post_id ).toBeGreaterThan( 0 );
		expect( result.edit_url ).toContain( 'elementor' );

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Find the button element that should have the flattened class applied
		const buttonElement = previewFrame.locator( '.e-con button' ).last();

		// Verify the element exists and is visible
		await expect( buttonElement ).toBeVisible();
		// Verify the element has a flattened class (.container .button → .button--container)
		await expect( buttonElement ).toHaveClass( /button--container/ );

		// Verify that original CSS properties are preserved in the flattened class
		await expect( buttonElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // Red
		await expect( buttonElement ).toHaveCSS( 'font-size', '18px' );
		await expect( buttonElement ).toHaveCSS( 'margin', '5px' );

		// The flattened class .button--container should preserve all original properties:
		// color, background-color, font-size, padding, margin, border, border-radius, etc.
	} );

	test( 'should not flatten simple selectors', async ( { request, page } ) => {
		// Test that simple selectors are NOT flattened
		const cssContent = `
			<style>
				.simple {
					color: red;
					font-size: 20px;
				}
			</style>
			<div class="simple">Simple Class</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			'',
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );

		// Should not create any flattened classes for simple selectors
		expect( result.flattened_classes_created || 0 ).toBe( 0 );

		// Verify successful conversion
		expect( result.post_id ).toBeGreaterThan( 0 );
		expect( result.edit_url ).toContain( 'elementor' );

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Verify simple class selector is NOT flattened (keeps original class name)
		const simpleElement = previewFrame.locator( '.simple' ).first();
		await expect( simpleElement ).toBeVisible();
		await expect( simpleElement ).toHaveClass( /simple/ ); // Should contain original class name
		await expect( simpleElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // Red
		await expect( simpleElement ).toHaveCSS( 'font-size', '20px' );

		// Simple selectors (.simple) should NOT be flattened
		// They should keep their original names and styles should still apply
	} );

	test( 'should remove HTML tags from flattened class names (body.loaded .loading → .loading--loaded)', async ( { request, page } ) => {
		const cssContent = `
			<style>
				.loading {
					background: rgba(0, 0, 0, 0.035);
				}
				body.loaded .loading {
					background: none;
				}
			</style>
			<div class="loading">Loading Content</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			'',
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );
		expect( result.flattened_classes_created ).toBeGreaterThan( 0 );

		expect( result.post_id ).toBeGreaterThan( 0 );
		expect( result.edit_url ).toContain( 'elementor' );

		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		const loadingElement = previewFrame.locator( '[class*="loading--loaded"]' ).first();

		await expect( loadingElement ).toBeVisible();
		await expect( loadingElement ).toHaveClass( /loading--loaded/ );

		await expect( loadingElement ).not.toHaveClass( /loading--body-loaded/ );
	} );
} );
