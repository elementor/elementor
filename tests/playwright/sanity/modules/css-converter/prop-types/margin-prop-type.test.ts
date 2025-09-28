import { test, expect } from '@playwright/test';
import { CssConverterHelper } from '../helper';

/**
 * Comprehensive Margin Property Tests
 * 
 * Tests all margin scenarios including negative values, logical properties,
 * shorthand syntax, CSS keywords, and atomic widget compliance.
 */

test.describe('Margin Prop Type Integration @prop-types', () => {
	let helper: CssConverterHelper;

	test.beforeEach(async ({ page, request }) => {
		helper = new CssConverterHelper(page, request);
	});

	test('should convert negative margin values', async ({ page, request }) => {
		const html = '<div style="margin: -20px;">Negative margin content</div>';
		
		const apiResult = await helper.convertHtmlWithCss(html, '');
		
		expect(apiResult.widgets_created).toBeGreaterThan(0);
		expect(apiResult.global_classes_created).toBeGreaterThan(0);
		
		await page.goto(apiResult.edit_url);
		await page.waitForSelector('.e-paragraph-base');
		
		// Verify negative margin is applied
		const element = page.locator('.e-paragraph-base').first();
		await expect(element).toHaveCSS('margin-top', '-20px');
		await expect(element).toHaveCSS('margin-right', '-20px');
		await expect(element).toHaveCSS('margin-bottom', '-20px');
		await expect(element).toHaveCSS('margin-left', '-20px');
	});

	test('should convert margin shorthand with mixed values', async ({ page, request }) => {
		const html = '<div style="margin: 10px -20px 30px -40px;">Mixed margin values</div>';
		
		const apiResult = await helper.convertHtmlWithCss(html, '');
		
		expect(apiResult.widgets_created).toBeGreaterThan(0);
		expect(apiResult.global_classes_created).toBeGreaterThan(0);
		
		await page.goto(apiResult.edit_url);
		await page.waitForSelector('.e-paragraph-base');
		
		// Verify each direction has correct value
		const element = page.locator('.e-paragraph-base').first();
		await expect(element).toHaveCSS('margin-top', '10px');
		await expect(element).toHaveCSS('margin-right', '-20px');
		await expect(element).toHaveCSS('margin-bottom', '30px');
		await expect(element).toHaveCSS('margin-left', '-40px');
	});

	test('should convert margin-inline properties', async ({ page, request }) => {
		const html = '<div style="margin-inline: 10px 30px;">Inline margin dual</div>';
		
		const apiResult = await helper.convertHtmlWithCss(html, '');
		
		expect(apiResult.widgets_created).toBeGreaterThan(0);
		expect(apiResult.global_classes_created).toBeGreaterThan(0);
		
		await page.goto(apiResult.edit_url);
		await page.waitForSelector('.e-paragraph-base');
		
		// Verify inline-start: 10px, inline-end: 30px
		const element = page.locator('.e-paragraph-base').first();
		await expect(element).toHaveCSS('margin-top', '0px');
		await expect(element).toHaveCSS('margin-right', '30px');
		await expect(element).toHaveCSS('margin-bottom', '0px');
		await expect(element).toHaveCSS('margin-left', '10px');
	});

	test('should convert margin auto for centering', async ({ page, request }) => {
		const html = '<div style="margin: auto;">Auto margin centering</div>';
		
		const apiResult = await helper.convertHtmlWithCss(html, '');
		
		expect(apiResult.widgets_created).toBeGreaterThan(0);
		expect(apiResult.global_classes_created).toBeGreaterThan(0);
		
		await page.goto(apiResult.edit_url);
		await page.waitForSelector('.e-paragraph-base');
		
		// Verify all margins are auto
		const element = page.locator('.e-paragraph-base').first();
		await expect(element).toHaveCSS('margin-top', 'auto');
		await expect(element).toHaveCSS('margin-right', 'auto');
		await expect(element).toHaveCSS('margin-bottom', 'auto');
		await expect(element).toHaveCSS('margin-left', 'auto');
	});
});