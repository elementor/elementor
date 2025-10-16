import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe('Font Style Prop Type Conversion @prop-types', () => {
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

	test('should convert all valid font-style values correctly', async ({ page, request }) => {
		const htmlContent = `
			<div>
				<h2 style="font-style: normal;">Normal Font Style</h2>
				<p style="font-style: italic;">Italic Paragraph</p>
				<h3 style="font-style: oblique;">Oblique Heading</h3>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent, '');

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		await page.waitForLoadState('networkidle');

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test normal font-style
		const heading = previewFrame.locator('h2').first();
		await expect(heading).toHaveCSS('font-style', 'normal');

		// Test italic font-style
		const paragraph = previewFrame.locator('p').first();
		await expect(paragraph).toHaveCSS('font-style', 'italic');

		// Test oblique font-style (browsers may render oblique as italic)
		const h3 = previewFrame.locator('h3').first();
		const h3FontStyle = await h3.evaluate(el => getComputedStyle(el).fontStyle);
		expect(['oblique', 'italic']).toContain(h3FontStyle);
	});

	test('should preserve font-style with other typography properties', async ({ page, request }) => {
		const htmlContent = `
			<div>
				<h2 style="font-style: italic; font-weight: bold; color: #ff0000;">Italic Bold Red</h2>
				<p style="font-style: normal; font-size: 18px; text-align: center;">Normal Large Center</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, htmlContent, '');

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, validation.skipReason);
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto(editUrl);
		await page.waitForLoadState('networkidle');

		const previewFrame = page.frameLocator('#elementor-preview-iframe');

		// Test font-style is preserved alongside other properties
		const heading = previewFrame.locator('h2').first();
		await expect(heading).toHaveCSS('font-style', 'italic');
		await expect(heading).toHaveCSS('font-weight', '700'); // bold
		await expect(heading).toHaveCSS('color', 'rgb(255, 0, 0)');

		const paragraph = previewFrame.locator('p').first();
		await expect(paragraph).toHaveCSS('font-style', 'normal');
		await expect(paragraph).toHaveCSS('font-size', '18px');
		await expect(paragraph).toHaveCSS('text-align', 'center');
	});
});
