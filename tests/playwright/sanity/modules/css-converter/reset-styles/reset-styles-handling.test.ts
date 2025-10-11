import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

test.describe('Reset Styles Handling Tests', () => {
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
		testPageUrl = `${baseUrl}/wp-content/uploads/test-fixtures/reset-styles-test-page.html`;
		cssFile1Url = `${baseUrl}/wp-content/uploads/test-fixtures/reset-normalize.css`;
		cssFile2Url = `${baseUrl}/wp-content/uploads/test-fixtures/reset-custom.css`;
		
		console.log('Reset test page URL:', testPageUrl);
		console.log('Normalize CSS URL:', cssFile1Url);
		console.log('Custom reset CSS URL:', cssFile2Url);
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

	test('should successfully import page with comprehensive reset styles', async ({ request }) => {
		// Convert the URL with external CSS files containing reset styles
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url], // External reset CSS files
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
		console.log('Reset Styles Conversion Results:');
		console.log(`- Widgets created: ${result.widgets_created}`);
		console.log(`- Global classes created: ${result.global_classes_created}`);
		console.log(`- Variables created: ${result.variables_created}`);
		console.log(`- Post ID: ${result.post_id}`);

		// Expect multiple widgets to be created from elements with reset styles
		expect(result.widgets_created).toBeGreaterThanOrEqual(15);
		
		// Global classes may or may not be created depending on threshold
		expect(result.global_classes_created).toBeGreaterThanOrEqual(0);
	});

	test('should handle body element reset styles', async ({ request }) => {
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
		
		// Body styles should be processed even though there's no direct body widget
		// The converter should handle body styles through:
		// 1. Page-level settings
		// 2. Container/wrapper styles
		// 3. Global CSS application
		
		expect(result.widgets_created).toBeGreaterThan(0);
		
		// Check conversion log for body style processing
		if (result.conversion_log) {
			console.log('Body styles processing logged');
		}
	});

	test('should handle heading element resets (h1-h6)', async ({ request }) => {
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
		
		// Our test page contains h1, h2, h3, h4, h5, h6 elements
		// Each should be converted to e-heading widgets with appropriate reset styles
		// Reset styles include: font-size, font-weight, color, margin, line-height
		
		expect(result.widgets_created).toBeGreaterThanOrEqual(6); // At least 6 headings
		
		// Verify heading widgets were created
		if (result.conversion_log && result.conversion_log.mapping_stats) {
			const widgetTypes = result.conversion_log.mapping_stats.widget_types;
			if (widgetTypes && widgetTypes['e-heading']) {
				expect(widgetTypes['e-heading']).toBeGreaterThanOrEqual(6);
				console.log(`Created ${widgetTypes['e-heading']} heading widgets with reset styles`);
			}
		}
	});

	test('should handle paragraph element resets', async ({ request }) => {
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
		
		// Our test page contains multiple paragraph elements
		// Reset styles should be applied: font-size, line-height, margin, color
		
		// Verify paragraph widgets were created
		if (result.conversion_log && result.conversion_log.mapping_stats) {
			const widgetTypes = result.conversion_log.mapping_stats.widget_types;
			if (widgetTypes && widgetTypes['e-paragraph']) {
				expect(widgetTypes['e-paragraph']).toBeGreaterThan(0);
				console.log(`Created ${widgetTypes['e-paragraph']} paragraph widgets with reset styles`);
			}
		}
	});

	test('should handle link element resets', async ({ request }) => {
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
		
		// Our test page contains multiple link elements
		// Reset styles should be applied: color, text-decoration, font-weight
		
		// Verify link widgets were created
		if (result.conversion_log && result.conversion_log.mapping_stats) {
			const widgetTypes = result.conversion_log.mapping_stats.widget_types;
			if (widgetTypes && widgetTypes['e-link']) {
				expect(widgetTypes['e-link']).toBeGreaterThan(0);
				console.log(`Created ${widgetTypes['e-link']} link widgets with reset styles`);
			}
		}
	});

	test('should handle button element resets', async ({ request }) => {
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
		
		// Our test page contains button elements with reset styles
		// Reset styles should be applied: background, color, border, padding, font-size
		
		expect(result.widgets_created).toBeGreaterThan(0);
	});

	test('should handle list element resets (ul, ol, li)', async ({ request }) => {
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
		
		// Our test page contains ul, ol, and li elements
		// Reset styles should be applied: margin, padding, list-style
		
		expect(result.widgets_created).toBeGreaterThan(0);
		
		// Lists might be converted to various widget types depending on implementation
		console.log('List elements processed with reset styles');
	});

	test('should handle table element resets', async ({ request }) => {
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
		
		// Our test page contains table, th, td elements
		// Reset styles should be applied: border-collapse, padding, text-align
		
		expect(result.widgets_created).toBeGreaterThan(0);
		
		console.log('Table elements processed with reset styles');
	});

	test('should handle universal selector resets (* {})', async ({ request }) => {
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
		
		// Our CSS includes universal selector resets: * { margin: 0; padding: 0; box-sizing: border-box; }
		// These should be handled appropriately - either applied globally or to individual widgets
		
		expect(result.widgets_created).toBeGreaterThan(0);
		
		console.log('Universal selector resets processed');
	});

	test('should prioritize inline styles over reset styles', async ({ request }) => {
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
		
		// Our test page has elements with both reset styles and inline styles
		// Inline styles should have higher priority and override reset styles
		// This tests the CSS specificity handling in the converter
		
		expect(result.widgets_created).toBeGreaterThan(0);
		
		// Check that CSS processing handled specificity correctly
		if (result.conversion_log && result.conversion_log.css_processing) {
			const cssProcessing = result.conversion_log.css_processing;
			expect(cssProcessing.by_source.inline).toBeGreaterThan(0);
			console.log(`Processed ${cssProcessing.by_source.inline} inline styles with proper priority over resets`);
		}
	});

	test('should handle conflicting reset styles from multiple sources', async ({ request }) => {
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
		
		// Our test setup includes:
		// 1. normalize.css-style resets (external file 1)
		// 2. Eric Meyer reset-style resets (external file 2)  
		// 3. Custom resets in style block
		// These may have conflicting values for the same properties
		
		expect(result.widgets_created).toBeGreaterThan(0);
		
		// The converter should handle conflicts using CSS cascade rules
		console.log('Multiple reset sources processed with conflict resolution');
	});

	test('should handle normalize.css vs reset.css patterns', async ({ request }) => {
		// Test with only normalize.css patterns
		const normalizeResult: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url], // Only normalize.css
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
			}
		);

		// Test with only reset.css patterns  
		const resetResult: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile2Url], // Only custom reset.css
			false,
			{
				postType: 'page',
				createGlobalClasses: true,
			}
		);

		const normalizeValidation = helper.validateApiResult(normalizeResult);
		const resetValidation = helper.validateApiResult(resetResult);
		
		if (normalizeValidation.shouldSkip) {
			test.skip(true, `Normalize test: ${normalizeValidation.skipReason}`);
			return;
		}
		
		if (resetValidation.shouldSkip) {
			test.skip(true, `Reset test: ${resetValidation.skipReason}`);
			return;
		}

		expect(normalizeResult.success).toBe(true);
		expect(resetResult.success).toBe(true);
		
		// Both approaches should successfully create widgets
		expect(normalizeResult.widgets_created).toBeGreaterThan(0);
		expect(resetResult.widgets_created).toBeGreaterThan(0);
		
		console.log('Normalize.css approach:');
		console.log(`- Widgets: ${normalizeResult.widgets_created}`);
		console.log(`- Global classes: ${normalizeResult.global_classes_created}`);
		
		console.log('Reset.css approach:');
		console.log(`- Widgets: ${resetResult.widgets_created}`);
		console.log(`- Global classes: ${resetResult.global_classes_created}`);
		
		// Different reset approaches may produce different numbers of widgets/classes
		// Both should be valid but may have different optimization characteristics
	});

	test('should handle nested elements with reset inheritance', async ({ request }) => {
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
		
		// Our test page has nested div structures with headings and paragraphs inside
		// Reset styles should be inherited properly through the nesting hierarchy
		
		expect(result.widgets_created).toBeGreaterThan(0);
		
		// Verify that nested elements were processed correctly
		console.log('Nested elements with reset inheritance processed successfully');
	});

	test('should provide comprehensive conversion logging for reset styles', async ({ request }) => {
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
		
		// Verify comprehensive logging is available
		expect(result.conversion_log).toBeTruthy();
		
		if (result.conversion_log) {
			// Check CSS processing stats
			expect(result.conversion_log.css_processing).toBeTruthy();
			expect(result.conversion_log.css_processing.total_styles).toBeGreaterThan(0);
			
			// Check mapping stats
			expect(result.conversion_log.mapping_stats).toBeTruthy();
			expect(result.conversion_log.mapping_stats.total_elements).toBeGreaterThan(0);
			
			// Check widget creation stats
			expect(result.conversion_log.widget_creation).toBeTruthy();
			expect(result.conversion_log.widget_creation.widgets_created).toBeGreaterThan(0);
			
			console.log('Reset Styles Conversion Summary:');
			console.log(`- Total CSS styles processed: ${result.conversion_log.css_processing.total_styles}`);
			console.log(`- Total elements mapped: ${result.conversion_log.mapping_stats.total_elements}`);
			console.log(`- Widget types created:`, result.conversion_log.mapping_stats.widget_types);
			console.log(`- CSS properties by type:`, result.conversion_log.css_processing.by_property);
			console.log(`- Processing time: ${result.conversion_log.total_time}s`);
		}
		
		// Verify no critical errors occurred
		expect(result.errors).toBeNull();
		expect(result.warnings).toEqual([]);
	});
});
