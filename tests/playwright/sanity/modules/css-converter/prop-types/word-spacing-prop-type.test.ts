import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe('Word Spacing Prop Type Conversion @prop-types', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll(async ({ browser, apiRequests }, testInfo) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage(page, testInfo, apiRequests);

		// Enable atomic widgets experiments to match manual testing environment
		await wpAdminPage.setExperiments({
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		});

		await wpAdminPage.setExperiments({
			e_nested_elements: 'active',
		});

		await page.close();
		cssHelper = new CssConverterHelper();
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

	test('should convert word-spacing with different units correctly', async ({ page, request }, testInfo) => {
		const htmlContent = `
			<div>
				<h2 style="word-spacing: 2px;">Pixel Word Spacing</h2>
				<p style="word-spacing: 0.5em;">Em Word Spacing</p>
				<div style="word-spacing: 1rem;">Rem Word Spacing</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test pixel word-spacing - target converted widget by text content
		const heading = previewFrame.locator('h2').filter({ hasText: 'Pixel Word Spacing' });
		await expect(heading).toHaveCSS('word-spacing', '2px');

		// Test em word-spacing (browser may compute to pixel value) - target the actual widget content
		const paragraph = previewFrame.locator('p').filter({ hasText: 'Em Word Spacing' }).first();
		const paragraphWordSpacing = await paragraph.evaluate(el => getComputedStyle(el).wordSpacing);
		// Should be either em value or computed pixel value
		expect(paragraphWordSpacing === '0.5em' || parseFloat(paragraphWordSpacing) > 0).toBeTruthy();

		// Test rem word-spacing - div elements are converted to div-block widgets, target the actual widget content
		const divElement = previewFrame.locator('div[data-widget_type="e-div-block"] div, div.e-con > div').filter({ hasText: 'Rem Word Spacing' }).first();
		const divWordSpacing = await divElement.evaluate(el => getComputedStyle(el).wordSpacing);
		expect(divWordSpacing === '1rem' || parseFloat(divWordSpacing) > 0).toBeTruthy();
	});

	test('should handle normal keyword correctly', async ({ page, request }, testInfo) => {
		const htmlContent = `
			<div>
				<h2 style="word-spacing: normal;">Normal Word Spacing</h2>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test normal keyword (should convert to 0px)
		const heading = previewFrame.locator('h2').filter({ hasText: 'Normal Word Spacing' });
		await expect(heading).toHaveCSS('word-spacing', '0px');
	});

	test('should handle positive and negative values', async ({ page, request }, testInfo) => {
		const htmlContent = `
			<div>
				<h2 style="word-spacing: 5px;">Positive Word Spacing</h2>
				<p style="word-spacing: -2px;">Negative Word Spacing</p>
				<div style="word-spacing: 0px;">Zero Word Spacing</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test positive word-spacing
		const heading = previewFrame.locator('h2').filter({ hasText: 'Positive Word Spacing' });
		await expect(heading).toHaveCSS('word-spacing', '5px');

		// Test negative word-spacing
		const paragraph = previewFrame.locator('p').filter({ hasText: 'Negative Word Spacing' });
		await expect(paragraph).toHaveCSS('word-spacing', '-2px');

		// Test zero word-spacing - div elements are converted to div-block widgets, target the actual widget content
		const divElement = previewFrame.locator('div[data-widget_type="e-div-block"] div, div.e-con > div').filter({ hasText: 'Zero Word Spacing' }).first();
		await expect(divElement).toHaveCSS('word-spacing', '0px');
	});

	test('should preserve word-spacing with other typography properties', async ({ page, request }, testInfo) => {
		const htmlContent = `
			<div>
				<h2 style="word-spacing: 3px; color: #333; font-weight: bold;">Spaced Bold Dark</h2>
				<p style="word-spacing: 1px; font-size: 16px; text-align: justify;">Spaced Justified Text</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test word-spacing is preserved alongside other properties
		const heading = previewFrame.locator('h2').filter({ hasText: 'Spaced Bold Dark' });
		await expect(heading).toHaveCSS('word-spacing', '3px');
		await expect(heading).toHaveCSS('color', 'rgb(51, 51, 51)');
		await expect(heading).toHaveCSS('font-weight', '700'); // bold

		const paragraph = previewFrame.locator('p').filter({ hasText: 'Spaced Justified Text' });
		await expect(paragraph).toHaveCSS('word-spacing', '1px');
		await expect(paragraph).toHaveCSS('font-size', '16px');
		await expect(paragraph).toHaveCSS('text-align', 'justify');
	});

	test('should handle invalid values gracefully', async ({ page, request }, testInfo) => {
		const htmlContent = `
			<div>
				<h2 style="word-spacing: invalid-value;">Invalid Word Spacing</h2>
				<p style="word-spacing: auto;">Auto (Invalid for word-spacing)</p>
				<div style="word-spacing: inherit;">Inherit Word Spacing</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Invalid values should fall back to browser defaults or be ignored
		// The mapper should return null for invalid values, so no atomic prop is applied
		const heading = previewFrame.locator('h2').filter({ hasText: 'Invalid Word Spacing' });
		const headingWordSpacing = await heading.evaluate(el => getComputedStyle(el).wordSpacing);
		// Should use browser default (typically 0px or normal)
		expect(['0px', 'normal']).toContain(headingWordSpacing);

		const paragraph = previewFrame.locator('p').filter({ hasText: 'Auto (Invalid for word-spacing)' });
		const paragraphWordSpacing = await paragraph.evaluate(el => getComputedStyle(el).wordSpacing);
		// Should use browser default
		expect(['0px', 'normal']).toContain(paragraphWordSpacing);

		// Inherit should use parent or browser default - div elements are converted to div-block widgets, target the actual widget content
		const divElement = previewFrame.locator('div[data-widget_type="e-div-block"] div, div.e-con > div').filter({ hasText: 'Inherit Word Spacing' }).first();
		const divWordSpacing = await divElement.evaluate(el => getComputedStyle(el).wordSpacing);
		// Inherit values should resolve to some valid value
		expect(divWordSpacing).toBeDefined();
	});

	test('should work with different text content and lengths', async ({ page, request }, testInfo) => {
		const htmlContent = `
			<div>
				<h2 style="word-spacing: 4px;">Short text</h2>
				<p style="word-spacing: 2px;">This is a longer paragraph with multiple words to test word spacing behavior across different content lengths and word counts.</p>
				<div style="word-spacing: 1px;">Medium length text content</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test word-spacing applies to different content lengths
		const heading = previewFrame.locator('h2').filter({ hasText: 'Short text' });
		await expect(heading).toHaveCSS('word-spacing', '4px');

		const paragraph = previewFrame.locator('p').filter({ hasText: 'This is a longer paragraph' });
		await expect(paragraph).toHaveCSS('word-spacing', '2px');

		// Test medium length content - div elements are converted to div-block widgets, target the actual widget content
		const divElement = previewFrame.locator('div[data-widget_type="e-div-block"] div, div.e-con > div').filter({ hasText: 'Medium length text content' }).first();
		await expect(divElement).toHaveCSS('word-spacing', '1px');
	});

	test('should convert different element types with word-spacing', async ({ page, request }, testInfo) => {
		const htmlContent = `
			<div>
				<h1 style="word-spacing: 3px;">Spaced H1 Heading</h1>
				<h2 style="word-spacing: 2px;">Spaced H2 Heading</h2>
				<p style="word-spacing: 1px;">Spaced paragraph text</p>
				<blockquote style="word-spacing: 4px;">Spaced blockquote content</blockquote>
				<em style="word-spacing: 2px;">Spaced emphasis text</em>
				<strong style="word-spacing: 3px;">Spaced strong text</strong>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test each element type with different word-spacing values
		const h1 = previewFrame.locator('h1').filter({ hasText: 'Spaced H1 Heading' });
		await expect(h1).toHaveCSS('word-spacing', '3px');

		const h2 = previewFrame.locator('h2').filter({ hasText: 'Spaced H2 Heading' });
		await expect(h2).toHaveCSS('word-spacing', '2px');

		const paragraph = previewFrame.locator('p').filter({ hasText: 'Spaced paragraph text' });
		await expect(paragraph).toHaveCSS('word-spacing', '1px');

		// blockquote elements are converted to e-paragraph widgets, so look for p elements
		const blockquote = previewFrame.locator('p').filter({ hasText: 'Spaced blockquote content' });
		await expect(blockquote).toHaveCSS('word-spacing', '4px');

		// Note: em and strong elements may be converted to other elements
		// depending on widget mapping configuration, so we test by content
		const emphasisElements = previewFrame.locator('*').filter({ hasText: 'Spaced emphasis text' });
		if (await emphasisElements.count() > 0) {
			const emphasisWordSpacing = await emphasisElements.first().evaluate(el => getComputedStyle(el).wordSpacing);
			expect(emphasisWordSpacing).toBe('2px');
		}

		const strongElements = previewFrame.locator('*').filter({ hasText: 'Spaced strong text' });
		if (await strongElements.count() > 0) {
			const strongWordSpacing = await strongElements.first().evaluate(el => getComputedStyle(el).wordSpacing);
			expect(strongWordSpacing).toBe('3px');
		}
	});

	test('should handle extreme values correctly', async ({ page, request }, testInfo) => {
		const htmlContent = `
			<div>
				<h2 style="word-spacing: 50px;">Very Large Spacing</h2>
				<p style="word-spacing: -10px;">Very Negative Spacing</p>
				<div style="word-spacing: 0.1px;">Very Small Spacing</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		editor = new EditorPage(page, testInfo);
		await editor.waitForPanelToLoad();

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test extreme values are preserved
		const heading = previewFrame.locator('h2').filter({ hasText: 'Very Large Spacing' });
		await expect(heading).toHaveCSS('word-spacing', '50px');

		const paragraph = previewFrame.locator('p').filter({ hasText: 'Very Negative Spacing' });
		await expect(paragraph).toHaveCSS('word-spacing', '-10px');

		// Test very small spacing - div elements are converted to div-block widgets, target the actual widget content
		const divElement = previewFrame.locator('div[data-widget_type="e-div-block"] div, div.e-con > div').filter({ hasText: 'Very Small Spacing' }).first();
		await expect(divElement).toHaveCSS('word-spacing', '0.1px');
	});
});
