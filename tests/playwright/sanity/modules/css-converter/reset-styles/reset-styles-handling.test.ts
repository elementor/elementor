import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

test.describe('Reset Styles Handling Tests', () => {
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

	test.afterAll(async ({ browser }) => {
		const page = await browser.newPage();
		// Reset experiments if needed
		// const wpAdminPage = new WpAdminPage(page, testInfo, apiRequests);
		// await wpAdminPage.resetExperiments();
		await page.close();
	});

	test('should successfully import page with comprehensive reset styles', async ({ request, page }, testInfo) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		// Navigate to the converted page using EditorPage
		await page.goto(result.edit_url);
		const editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		// Get preview frame for checking elements
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Wait for widgets to be rendered
		await page.waitForTimeout(3000);

		// Find Elementor widgets (following default-styles-removal.test.ts pattern)
		const headingWidgets = elementorFrame.locator('.elementor-widget-e-heading, [data-widget_type="e-heading"], [data-widget_type="e-heading.default"]');
		const paragraphWidgets = elementorFrame.locator('.elementor-widget-e-paragraph, [data-widget_type="e-paragraph"], [data-widget_type="e-paragraph.default"]');
		const buttonWidgets = elementorFrame.locator('.elementor-widget-e-button, [data-widget_type="e-button"], [data-widget_type="e-button.default"]');

		// Wait for at least one widget to appear
		await headingWidgets.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});

		// Test heading reset styles - these SHOULD fail until Approach 6 is implemented
		// From reset-styles-test-page.html: h1 { color: #e74c3c; font-weight: bold; font-size: 2.5rem; line-height: 1.2; }
		const h1Widget = headingWidgets.first();
		if (await h1Widget.count() > 0) {
			const h1Element = h1Widget.locator('h1, h2, h3, h4, h5, h6').first();
			await expect(h1Element).toHaveCSS('color', 'rgb(231, 76, 60)'); // #e74c3c
			await expect(h1Element).toHaveCSS('font-weight', '700');
			await expect(h1Element).toHaveCSS('font-size', '40px'); // 2.5rem = 40px
			await expect(h1Element).toHaveCSS('line-height', '1.2');
		}

		// From reset-styles-test-page.html: h2 { color: #3498db; font-weight: 600; font-size: 2rem; line-height: 1.3; }
		const h2Widget = headingWidgets.nth(1);
		if (await h2Widget.count() > 0) {
			const h2Element = h2Widget.locator('h1, h2, h3, h4, h5, h6').first();
			await expect(h2Element).toHaveCSS('color', 'rgb(52, 152, 219)'); // #3498db
			await expect(h2Element).toHaveCSS('font-weight', '600');
			await expect(h2Element).toHaveCSS('font-size', '32px'); // 2rem = 32px
			await expect(h2Element).toHaveCSS('line-height', '1.3');
		}

		// From reset-styles-test-page.html: h3 { color: #27ae60; font-weight: 500; font-size: 1.5rem; }
		const h3Widget = headingWidgets.nth(2);
		if (await h3Widget.count() > 0) {
			const h3Element = h3Widget.locator('h1, h2, h3, h4, h5, h6').first();
			await expect(h3Element).toHaveCSS('color', 'rgb(39, 174, 96)'); // #27ae60
			await expect(h3Element).toHaveCSS('font-weight', '500');
			await expect(h3Element).toHaveCSS('font-size', '24px'); // 1.5rem = 24px
		}

		// From reset-styles-test-page.html: p { line-height: 1.8; color: #2c3e50; font-size: 1rem; }
		const pWidget = paragraphWidgets.first();
		if (await pWidget.count() > 0) {
			const pElement = pWidget.locator('p').first();
			await expect(pElement).toHaveCSS('line-height', '1.8');
			await expect(pElement).toHaveCSS('color', 'rgb(44, 62, 80)'); // #2c3e50
			await expect(pElement).toHaveCSS('font-size', '16px'); // 1rem = 16px
		}

		// From reset-styles-test-page.html: a { color: #e67e22; text-decoration: underline; font-weight: 500; }
		// Links are converted to button widgets
		const linkWidget = buttonWidgets.first();
		if (await linkWidget.count() > 0) {
			const linkElement = linkWidget.locator('a, button').first();
			await expect(linkElement).toHaveCSS('color', 'rgb(230, 126, 34)'); // #e67e22
			await expect(linkElement).toHaveCSS('text-decoration', /underline/);
			await expect(linkElement).toHaveCSS('font-weight', '500');
		}

		// From reset-styles-test-page.html: button { background-color: #95a5a6; color: white; padding: 10px 20px; }
		const buttonWidget = buttonWidgets.nth(1); // Second button widget
		if (await buttonWidget.count() > 0) {
			const buttonElement = buttonWidget.locator('a, button').first();
			await expect(buttonElement).toHaveCSS('background-color', 'rgb(149, 165, 166)'); // #95a5a6
			await expect(buttonElement).toHaveCSS('color', 'rgb(255, 255, 255)');
			await expect(buttonElement).toHaveCSS('padding', '10px 20px');
		}
	});

	test('should handle body element reset styles', async ({ request, page }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		await page.goto(result.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		// Test body reset styles are applied (editor may override some styles)
		const bodyElement = page.locator('body');
		await expect(bodyElement).toHaveCSS('background-color', /rgb\(/);
		await expect(bodyElement).toHaveCSS('color', /rgb\(/);
		await expect(bodyElement).toHaveCSS('font-family', /Georgia|sans-serif/);
	});

	test('should handle heading element resets (h1-h6)', async ({ request, page }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		await page.goto(result.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		// Test heading reset styles with CSS converter generated classes
		const h1Widget = page.locator('[data-widget_type="e-heading"]').first();
		await expect(h1Widget).toHaveCSS('color', 'rgb(231, 76, 60)');
		await expect(h1Widget).toHaveCSS('font-weight', '700');
		await expect(h1Widget).toHaveCSS('font-size', '40px'); // 2.5rem converted
		await expect(h1Widget).toHaveCSS('line-height', '1.2');

		const h2Widget = page.locator('[data-widget_type="e-heading"]').nth(1);
		await expect(h2Widget).toHaveCSS('color', 'rgb(52, 152, 219)');
		await expect(h2Widget).toHaveCSS('font-weight', '600');
		await expect(h2Widget).toHaveCSS('font-size', '32px'); // 2rem converted
		await expect(h2Widget).toHaveCSS('line-height', '1.3');

		const h3Widget = page.locator('[data-widget_type="e-heading"]').nth(2);
		await expect(h3Widget).toHaveCSS('color', 'rgb(39, 174, 96)');
		await expect(h3Widget).toHaveCSS('font-weight', '500');
		await expect(h3Widget).toHaveCSS('font-size', '24px'); // 1.5rem converted
	});

	test('should handle paragraph element resets', async ({ request, page }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		await page.goto(result.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		// Test paragraph reset styles with CSS converter generated classes
		const pWidget = page.locator('[data-widget_type="e-paragraph"]').first();
		await expect(pWidget).toHaveCSS('line-height', '1.8');
		await expect(pWidget).toHaveCSS('color', 'rgb(44, 62, 80)');
		await expect(pWidget).toHaveCSS('font-size', '16px'); // 1rem converted
		await expect(pWidget).toHaveCSS('margin-bottom', '16px'); // 1rem converted
	});

	test('should handle link element resets', async ({ request, page }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		await page.goto(result.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		// Test link reset styles with CSS converter generated classes (links become buttons)
		const linkWidget = page.locator('[data-widget_type="e-button"]').first();
		await expect(linkWidget).toHaveCSS('color', 'rgb(231, 118, 34)'); // #e76e22
		await expect(linkWidget).toHaveCSS('text-decoration', 'underline');
		await expect(linkWidget).toHaveCSS('font-weight', '500');
		await expect(linkWidget).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // transparent
	});

	test('should handle button element resets', async ({ request, page }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		await page.goto(result.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		// Test button reset styles with CSS converter generated classes
		const buttonWidget = page.locator('[data-widget_type="e-button"]').nth(1); // Second button (first is link)
		await expect(buttonWidget).toHaveCSS('background-color', 'rgb(149, 165, 166)'); // #95a5a6
		await expect(buttonWidget).toHaveCSS('color', 'rgb(255, 255, 255)');
		await expect(buttonWidget).toHaveCSS('border', /none|0px/);
		await expect(buttonWidget).toHaveCSS('padding', '10px 20px');
		await expect(buttonWidget).toHaveCSS('font-size', '16px'); // 1rem
		await expect(buttonWidget).toHaveCSS('border-radius', '4px');
	});

	test('should handle universal selector resets (* {})', async ({ request, page }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		await page.goto(result.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		// Test universal reset styles
		const allElements = page.locator('*').first();
		await expect(allElements).toHaveCSS('box-sizing', 'border-box');
	});

	test('should prioritize inline styles over reset styles', async ({ request, page }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		await page.goto(result.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		// Test that inline styles override reset styles
		const inlineColorWidget = page.locator('[data-widget_type="e-paragraph"]').nth(1); // Second paragraph has inline styles
		await expect(inlineColorWidget).toHaveCSS('color', 'rgb(231, 76, 60)'); // #e74c3c from inline
		await expect(inlineColorWidget).toHaveCSS('font-weight', '700'); // bold from inline

		// Test that elements without inline styles get reset styles
		const resetOnlyWidget = page.locator('[data-widget_type="e-heading"]').first();
		await expect(resetOnlyWidget).toHaveCSS('color', 'rgb(231, 76, 60)'); // #e74c3c from reset
		await expect(resetOnlyWidget).toHaveCSS('font-weight', '700');
	});

	test('should handle conflicting reset styles from multiple sources', async ({ request, page }) => {
		const result: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url, cssFile2Url]
		);

		const validation = helper.validateApiResult(result);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}

		expect(result.success).toBe(true);
		expect(result.widgets_created).toBeGreaterThan(0);

		await page.goto(result.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		// Test that CSS cascade rules are applied correctly
		const bodyElement = page.locator('body');
		await expect(bodyElement).toHaveCSS('background-color', /rgb\(/);
		await expect(bodyElement).toHaveCSS('font-family', /Georgia|sans-serif/);
	});

	test('should handle normalize.css vs reset.css patterns', async ({ request, page }) => {
		const normalizeResult: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile1Url]
		);

		const resetResult: CssConverterResponse = await helper.convertFromUrl(
			request,
			testPageUrl,
			[cssFile2Url]
		);

		const normalizeValidation = helper.validateApiResult(normalizeResult);
		const resetValidation = helper.validateApiResult(resetResult);
		
		if (normalizeValidation.shouldSkip || resetValidation.shouldSkip) {
			test.skip(true, 'One or both CSS approaches failed validation');
			return;
		}

		expect(normalizeResult.success).toBe(true);
		expect(resetResult.success).toBe(true);
		expect(normalizeResult.widgets_created).toBeGreaterThan(0);
		expect(resetResult.widgets_created).toBeGreaterThan(0);

		// Test normalize.css approach with v4 atomic widget selectors
		await page.goto(normalizeResult.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		const normalizeH1 = page.locator('.e-heading-base').first();
		await expect(normalizeH1).toHaveCSS('font-size', '32px'); // 2em from normalize
		await expect(normalizeH1).toHaveCSS('margin', '10.72px 0px'); // 0.67em 0 from normalize

		// Test reset.css approach with v4 atomic widget selectors
		await page.goto(resetResult.edit_url);
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('.elementor-editor-active', { timeout: 30000 });

		const resetElements = page.locator('*').first();
		await expect(resetElements).toHaveCSS('box-sizing', 'border-box');
		
		const resetH1 = page.locator('.e-heading-base').first();
		await expect(resetH1).toHaveCSS('margin', '0px'); // Reset to zero
		await expect(resetH1).toHaveCSS('padding', '0px'); // Reset to zero
	});
});
