import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';

import { CssConverterHelper, CssConverterResponse } from '../helper';

interface ExtendedCssConverterResponse extends CssConverterResponse {
	flattened_classes_created?: number;
}

test.describe( 'Pattern 5: Element Selectors (.first .second h1 → .h1--first-second)', () => {
	let helper: CssConverterHelper;

	test.beforeEach( async () => {
		helper = new CssConverterHelper();
	} );

	test( 'should flatten descendant element selector (.first .second h1)', async ( { request, page } ) => {
		// Test CSS with Pattern 5: .first .second h1 (element selector)
		const cssContent = `
			<style>
				.first .second h1 {
					color: purple;
					font-size: 24px;
					margin: 8px;
				}
			</style>
			<div class="first">
				<div class="second">
					<h1>Element Selector Test</h1>
				</div>
			</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
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

		// Find the h1 element with flattened class (.first .second h1 → .h1--first-second)
		const headingElement = previewFrame.locator( '[class*="h1--first-second"]' ).first();

		// Verify the element exists and is visible
		await expect( headingElement ).toBeVisible();
		// Verify the element has a flattened class
		await expect( headingElement ).toHaveClass( /h1--first-second/ );

		// Verify that the original CSS properties are preserved in the flattened class
		await expect( headingElement ).toHaveCSS( 'color', 'rgb(128, 0, 128)' ); // Purple
		await expect( headingElement ).toHaveCSS( 'font-size', '24px' );
		await expect( headingElement ).toHaveCSS( 'margin', '8px' );

		// Element selector flattening: .first .second h1 → .h1--first-second
	} );

	test( 'should flatten child element selector (.container > .header h2)', async ( { request, page } ) => {
		// Test CSS with Pattern 5: .container > .header h2 (child + element selector)
		const cssContent = `
			<style>
				.container > .header h2 {
					color: orange;
					font-size: 20px;
					margin: 6px;
				}
			</style>
			<div class="container">
				<div class="header">
					<h2>Child Element Test</h2>
				</div>
			</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );
		expect( result.flattened_classes_created ).toBeGreaterThan( 0 );

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Find the h2 element with flattened class (.container > .header h2 → .h2--container-header)
		const headingElement = previewFrame.locator( '[class*="h2--container-header"]' ).first();

		// Verify the element exists and is visible
		await expect( headingElement ).toBeVisible();
		// Verify the element has a flattened class
		await expect( headingElement ).toHaveClass( /h2--container-header/ );

		// Verify that the original CSS properties are preserved in the flattened class
		await expect( headingElement ).toHaveCSS( 'color', 'rgb(255, 165, 0)' ); // Orange
		await expect( headingElement ).toHaveCSS( 'font-size', '20px' );
		await expect( headingElement ).toHaveCSS( 'margin', '6px' );

		// Child element selector flattening: .container > .header h2 → .h2--container-header
	} );

	test( 'should flatten deep element selector (.sidebar .menu .item div)', async ( { request, page } ) => {
		// Test CSS with Pattern 5: Deep element selector
		const cssContent = `
			<style>
				.sidebar .menu .item div {
					color: teal;
					font-size: 14px;
					margin: 4px;
				}
			</style>
			<div class="sidebar">
				<div class="menu">
					<div class="item">
						<div>Deep Element</div>
					</div>
				</div>
			</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );
		expect( result.flattened_classes_created ).toBeGreaterThan( 0 );

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Find the div element with flattened class (.sidebar .menu .item div → .div--sidebar-menu-item)
		const divElement = previewFrame.locator( '[class*="div--sidebar-menu-item"]' ).first();

		// Verify the element exists and is visible
		await expect( divElement ).toBeVisible();
		// Verify the element has a flattened class
		await expect( divElement ).toHaveClass( /div--sidebar-menu-item/ );

		// Verify that the original CSS properties are preserved in the flattened class
		await expect( divElement ).toHaveCSS( 'color', 'rgb(0, 128, 128)' ); // Teal
		await expect( divElement ).toHaveCSS( 'font-size', '14px' );
		await expect( divElement ).toHaveCSS( 'margin', '4px' );

		// Deep element selector flattening: .sidebar .menu .item div → .div--sidebar-menu-item
	} );

	test( 'should handle multiple Pattern 5 selectors in same CSS', async ( { request, page } ) => {
		// Test multiple Pattern 5 element selectors
		const cssContent = `
			<style>
				.header .nav a {
					color: blue;
					font-size: 16px;
				}
				.content .article p {
					color: gray;
					font-size: 14px;
				}
				.footer .links div {
					color: black;
					font-size: 12px;
				}
			</style>
			<div class="header">
				<nav class="nav">
					<a>Navigation Link</a>
				</nav>
			</div>
			<div class="content">
				<article class="article">
					<p>Article Content</p>
				</article>
			</div>
			<div class="footer">
				<div class="links">
					<div>Footer Link</div>
				</div>
			</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );
		expect( result.flattened_classes_created ).toBe( 3 ); // Three element selectors

		// Navigate to the Elementor editor to verify DOM and CSS
		await page.goto( result.edit_url );
		await page.waitForLoadState( 'domcontentloaded' );

		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-active', { timeout: 15000 } );

		// Get the preview frame
		const previewFrame = page.frameLocator( '#elementor-preview-iframe' );

		// Test each flattened element with both toHaveClass and toHaveCSS
		// 1. Navigation link (.header .nav a → .a--header-nav)
		const linkElement = previewFrame.locator( '[class*="a--header-nav"]' ).first();
		await expect( linkElement ).toBeVisible();
		await expect( linkElement ).toHaveClass( /a--header-nav/ );
		await expect( linkElement ).toHaveCSS( 'color', 'rgb(0, 0, 255)' ); // Blue
		await expect( linkElement ).toHaveCSS( 'font-size', '16px' );

		// 2. Article paragraph (.content .article p → .p--content-article)
		const paragraphElement = previewFrame.locator( '[class*="p--content-article"]' ).first();
		await expect( paragraphElement ).toBeVisible();
		await expect( paragraphElement ).toHaveClass( /p--content-article/ );
		await expect( paragraphElement ).toHaveCSS( 'color', 'rgb(128, 128, 128)' ); // Gray
		await expect( paragraphElement ).toHaveCSS( 'font-size', '14px' );

		// 3. Footer div (.footer .links div → .div--footer-links)
		const divElement = previewFrame.locator( '[class*="div--footer-links"]' ).first();
		await expect( divElement ).toBeVisible();
		await expect( divElement ).toHaveClass( /div--footer-links/ );
		await expect( divElement ).toHaveCSS( 'color', 'rgb(0, 0, 0)' ); // Black
		await expect( divElement ).toHaveCSS( 'font-size', '12px' );

		// Multiple Pattern 5 selectors should each be flattened:
		// .header .nav a → .a--header-nav
		// .content .article p → .p--content-article
		// .footer .links div → .div--footer-links
	} );

	test( 'should not flatten simple element selectors (h1, p, div)', async ( { request, page } ) => {
		// Test that simple element selectors are NOT flattened
		const cssContent = `
			<style>
				h1 {
					color: red;
					font-size: 32px;
				}
				p {
					color: blue;
					font-size: 16px;
				}
				div {
					color: green;
					font-size: 14px;
				}
			</style>
			<h1>Simple Heading</h1>
			<p>Simple Paragraph</p>
			<div>Simple div</div>
		`;

		const result: ExtendedCssConverterResponse = await helper.convertHtmlWithCss(
			request,
			cssContent,
			{ createGlobalClasses: true },
		);

		expect( result.success ).toBe( true );
		expect( result.flattened_classes_created ).toBe( 0 ); // No flattening for simple element selectors

		// Simple element selectors should not be flattened:
		// h1, p, div should remain as-is (or be applied directly to widgets)
	} );
} );
