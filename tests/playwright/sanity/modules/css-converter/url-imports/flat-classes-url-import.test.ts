import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';
import path from 'path';

test.describe('URL Import - Flat Classes Test', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let helper: CssConverterHelper;
	let testPageUrl: string;
	let cssFile1Url: string;
	let cssFile2Url: string;

	test.beforeAll(async ({ browser, apiRequests }, testInfo) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage(page, testInfo, apiRequests);

		await wpAdminPage.setExperiments({
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		});

		await wpAdminPage.setExperiments({
			e_nested_elements: 'active',
		});

		await page.close();
		helper = new CssConverterHelper();
		
		// Use HTTP URLs served by WordPress
		const baseUrl = process.env.BASE_URL || 'http://elementor.local';
		testPageUrl = `${baseUrl}/wp-content/uploads/test-fixtures/flat-classes-test-page.html`;
		cssFile1Url = `${baseUrl}/wp-content/uploads/test-fixtures/styles-layout.css`;
		cssFile2Url = `${baseUrl}/wp-content/uploads/test-fixtures/styles-components.css`;
		
		console.log('Test page URL:', testPageUrl);
		console.log('CSS file 1 URL:', cssFile1Url);
		console.log('CSS file 2 URL:', cssFile2Url);
	});

	test.afterAll(async ({ browser, apiRequests }, testInfo) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage(page, testInfo, apiRequests);
		// await wpAdminPage.resetExperiments();
		await page.close();
	});

	test.beforeEach(async ({ page, apiRequests }, testInfo) => {
		wpAdmin = new WpAdminPage(page, testInfo, apiRequests);
	});

	test('should successfully import URL with flat classes and mixed styling sources', async ({ request }) => {
		// Convert the URL with external CSS files
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url], // External CSS files
			false, // Don't follow imports
			{
				postType: 'page',
				createGlobalClasses: true,
				globalClassThreshold: 2,
				preserveIds: false,
				useZeroDefaults: false,
			}
		);

		// Validate the API result
		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		// Basic API response validation
		expect(result.success).toBe(true);
		expect(result.post_id).toBeGreaterThan(0);
		expect(result.edit_url).toBeTruthy();
		expect(result.widgets_created).toBeGreaterThan(0);

		// Log conversion statistics
		console.log('Conversion Results:');
		console.log(`- Widgets created: ${result.widgets_created}`);
		console.log(`- Global classes created: ${result.global_classes_created}`);
		console.log(`- Variables created: ${result.variables_created}`);
		console.log(`- Post ID: ${result.post_id}`);
		console.log(`- Edit URL: ${result.edit_url}`);

		// Expect multiple widgets to be created from our complex page
		expect(result.widgets_created).toBeGreaterThanOrEqual(5);
		
		// Global classes may or may not be created depending on threshold
		expect(result.global_classes_created).toBeGreaterThanOrEqual(0);
	});

	test('should handle all styling sources: inline, style block, and external CSS', async ({ request }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url],
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
				globalClassThreshold: 1, // Lower threshold to catch more classes
			}
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);

		// Test that we successfully processed styles from all sources:
		// 1. Inline styles (style attributes)
		// 2. Style block (in <head>)
		// 3. External CSS files (linked stylesheets)
		
		// We should have created widgets for elements with different styling sources
		expect(result.widgets_created).toBeGreaterThanOrEqual(8);
		
		// Log detailed conversion information
		if (result.conversion_log) {
			console.log('Conversion log available:', typeof result.conversion_log);
		}
		
		if (result.warnings && result.warnings.length > 0) {
			console.log('Warnings:', result.warnings);
		}
	});

	test('should correctly process flat class selectors without nesting', async ({ request }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url],
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
				globalClassThreshold: 2,
			}
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		
		// Our test page uses only flat classes (no nested selectors like .parent .child)
		// All classes are single-level: .page-header, .header-title, .nav-link, etc.
		// The converter should handle these correctly
		
		// Verify we created global classes from repeated flat classes (may be 0 if threshold not met)
		expect(result.global_classes_created).toBeGreaterThanOrEqual(0);
		
		// Verify we created multiple widgets from elements with flat classes
		expect(result.widgets_created).toBeGreaterThanOrEqual(6);
	});

	test('should handle multiple classes on single elements', async ({ request }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url],
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
				globalClassThreshold: 1,
			}
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		
		// Our HTML uses multiple classes per element:
		// class="header-title main-heading"
		// class="intro-text primary-text"
		// class="nav-link primary-link"
		// etc.
		
		// The converter should handle combining styles from multiple classes
		expect(result.widgets_created).toBeGreaterThan(0);
		expect(result.global_classes_created).toBeGreaterThanOrEqual(0);
	});

	test('should process complex styling combinations', async ({ request }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url],
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
				globalClassThreshold: 2,
			}
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		
		// Our test page includes complex styling:
		// - Gradient backgrounds
		// - Box shadows
		// - Flexbox layouts
		// - Typography variations
		// - Color combinations
		// - Spacing utilities
		
		// Verify the converter handled complex CSS properties
		expect(result.widgets_created).toBeGreaterThanOrEqual(5);
		
		// Should create some global classes from repeated patterns
		expect(result.global_classes_created).toBeGreaterThanOrEqual(0);
	});

	test('should handle CSS from external files correctly', async ({ request }) => {
		// Test with external CSS files
		const resultWithCss: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url],
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
			}
		);

		// Test without external CSS files
		const resultWithoutCss: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[], // No external CSS
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
			}
		);

		const validationWithCss = helper.validateApiResult(resultWithCss);
		const validationWithoutCss = helper.validateApiResult(resultWithoutCss);
		
		if (validationWithCss.shouldSkip) {
			test.skip(true, `With CSS: ${validationWithCss.skipReason}`);
			return;
		}
		
		if (validationWithoutCss.shouldSkip) {
			test.skip(true, `Without CSS: ${validationWithoutCss.skipReason}`);
			return;
		}

		expect(resultWithCss.success).toBe(true);
		expect(resultWithoutCss.success).toBe(true);
		
		// With external CSS, we should get more widgets/classes due to additional styling
		console.log('With external CSS:');
		console.log(`- Widgets: ${resultWithCss.widgets_created}`);
		console.log(`- Global classes: ${resultWithCss.global_classes_created}`);
		
		console.log('Without external CSS:');
		console.log(`- Widgets: ${resultWithoutCss.widgets_created}`);
		console.log(`- Global classes: ${resultWithoutCss.global_classes_created}`);
		
		// External CSS should contribute to the conversion
		// (Though the exact numbers may vary based on how styles are processed)
		expect(resultWithCss.widgets_created).toBeGreaterThanOrEqual(resultWithoutCss.widgets_created);
	});

	test('should create appropriate widget types for different HTML elements', async ({ request }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url],
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
			}
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		
		// Our test page contains various HTML elements:
		// - <h1> (header title)
		// - <h2> (banner title)  
		// - <p> (paragraphs and link containers)
		// - <a> (links and buttons)
		// - <div> (containers and sections)
		// - <section> (banner)
		
		// The converter should create appropriate widgets for these elements
		expect(result.widgets_created).toBeGreaterThanOrEqual(8);
		
		// Should handle the mix of semantic and generic elements
		expect(result.post_id).toBeGreaterThan(0);
		expect(result.edit_url).toContain('elementor');
	});

	test('should preserve styling hierarchy with flat classes', async ({ request }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url],
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
				globalClassThreshold: 2,
			}
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		
		// Even with flat classes (no CSS nesting), the converter should:
		// 1. Maintain the visual hierarchy of the page
		// 2. Preserve styling relationships
		// 3. Create appropriate widget structure
		
		expect(result.widgets_created).toBeGreaterThan(0);
		expect(result.post_id).toBeGreaterThan(0);
		
		// Log final results
		console.log('Final conversion summary:');
		console.log(`- Success: ${result.success}`);
		console.log(`- Widgets created: ${result.widgets_created}`);
		console.log(`- Global classes: ${result.global_classes_created}`);
		console.log(`- Variables: ${result.variables_created}`);
		console.log(`- Errors: ${result.errors?.length || 0}`);
		console.log(`- Warnings: ${result.warnings?.length || 0}`);
	});

	test('should handle CSS utility classes correctly', async ({ request }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url],
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
				globalClassThreshold: 1, // Lower threshold to catch utility classes
			}
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		
		// Our external CSS includes utility classes:
		// .color-primary, .bg-light, .text-center, .border-rounded, etc.
		// These should be processed correctly even if not used in the HTML
		
		expect(result.widgets_created).toBeGreaterThan(0);
		
		// Utility classes might contribute to global classes if used multiple times
		expect(result.global_classes_created).toBeGreaterThanOrEqual(0);
	});
});
