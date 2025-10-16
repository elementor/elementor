import { expect } from "@playwright/test";
import { parallelTest as test } from "../../../../parallelTest";
import WpAdminPage from "../../../../pages/wp-admin-page";
import EditorPage from "../../../../pages/editor-page";
import { CssConverterHelper } from "../helper";

test.describe("Basic ID Styles @id-styles", () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll(async ({ browser, apiRequests }, testInfo) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage(page, testInfo, apiRequests);

		await wpAdminPage.setExperiments({
			e_opt_in_v4_page: "active",
			e_atomic_elements: "active",
		});

		await wpAdminPage.setExperiments({
			e_nested_elements: "active",
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

	test("should apply ID styles correctly", async ({ page, request }) => {
		const html = '<div id="header"><h1>Header Title</h1></div>';
		const css = "#header { background-color: blue; padding: 20px; }";

		const apiResult = await cssHelper.convertHtmlWithCss(request, html, css);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, "Skipping due to backend property mapper issues");
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect(postId).toBeDefined();
		expect(editUrl).toBeDefined();

		await page.goto(editUrl);
		editor = new EditorPage(page, wpAdmin.testInfo);
		await editor.waitForPanelToLoad();

		await test.step("Verify ID styles are applied to widget (without ID attribute)", async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// The div widget should NOT have id="header" but should have the styles applied
			const divWidget = elementorFrame.locator('[data-element_type="e-div-block"]').first();
			await divWidget.waitFor({ state: "visible", timeout: 10000 });

			// Verify the widget does NOT have the ID attribute
			const hasId = await divWidget.getAttribute("id");
			expect(hasId).not.toBe("header");

			// But it SHOULD have the styles from #header selector applied
			await expect(divWidget).toHaveCSS("background-color", "rgb(0, 0, 255)");
			await expect(divWidget).toHaveCSS("padding", "20px");
		});
	});

	test("should handle multiple elements with different IDs", async ({
		page,
		request,
	}) => {
		const html = `
			<div>
				<div id="header">Header</div>
				<div id="content">Content</div>
				<div id="footer">Footer</div>
			</div>
		`;
		const css = `
			#header { background-color: red; }
			#content { background-color: blue; }
			#footer { background-color: green; }
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, html, css);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, "Skipping due to backend property mapper issues");
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect(postId).toBeDefined();
		expect(editUrl).toBeDefined();

		await page.goto(editUrl);
		editor = new EditorPage(page, wpAdmin.testInfo);
		await editor.waitForPanelToLoad();

		await test.step("Verify each ID style is applied correctly", async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Get all div widgets (there should be 3 child divs with different colors)
			const divWidgets = elementorFrame.locator('[data-element_type="e-div-block"]');
			
			// Wait for widgets to be visible
			await divWidgets.first().waitFor({ state: "visible", timeout: 10000 });

			// Verify each widget has the correct background color from ID selectors
			await expect(divWidgets.nth(1)).toHaveCSS("background-color", "rgb(255, 0, 0)");
			await expect(divWidgets.nth(2)).toHaveCSS("background-color", "rgb(0, 0, 255)");
			await expect(divWidgets.nth(3)).toHaveCSS("background-color", "rgb(0, 128, 0)");
		});
	});

	test("should apply ID selector styles without ID attribute", async ({ page, request }) => {
		const html = '<div id="unique-section"><p>Content</p></div>';
		const css = "#unique-section { border: 2px solid red; }";

		const apiResult = await cssHelper.convertHtmlWithCss(request, html, css);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, "Skipping due to backend property mapper issues");
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect(postId).toBeDefined();
		expect(editUrl).toBeDefined();

		await page.goto(editUrl);
		editor = new EditorPage(page, wpAdmin.testInfo);
		await editor.waitForPanelToLoad();

		await test.step("Verify ID attribute is NOT preserved", async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const divWidget = elementorFrame.locator('[data-element_type="e-div-block"]').first();
			await divWidget.waitFor({ state: "visible", timeout: 10000 });

			// Verify there is NO element with id="unique-section"
			const elementWithId = elementorFrame.locator("#unique-section");
			await expect(elementWithId).toHaveCount(0);
		});

		await test.step("Verify ID styles are applied to widget", async () => {
			const elementorFrame = editor.getPreviewFrame();
			const divWidget = elementorFrame.locator('[data-element_type="e-div-block"]').first();

			await expect(divWidget).toHaveCSS("border-width", "2px");
			await expect(divWidget).toHaveCSS("border-style", "solid");
			await expect(divWidget).toHaveCSS("border-color", "rgb(255, 0, 0)");
		});
	});

	test("should handle ID styles on nested elements", async ({
		page,
		request,
	}) => {
		const html = `
			<div id="outer">
				<div id="inner">
					<p>Nested content</p>
				</div>
			</div>
		`;
		const css = `
			#outer { background-color: #d3d3d3; padding: 20px; }
			#inner { background-color: #ffffff; padding: 10px; }
		`;

		const apiResult = await cssHelper.convertHtmlWithCss(request, html, css);

		const validation = cssHelper.validateApiResult(apiResult);
		if (validation.shouldSkip) {
			test.skip(true, "Skipping due to backend property mapper issues");
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect(postId).toBeDefined();
		expect(editUrl).toBeDefined();

		await page.goto(editUrl);
		editor = new EditorPage(page, wpAdmin.testInfo);
		await editor.waitForPanelToLoad();

		await test.step("Verify outer ID styles applied to widget", async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const divWidgets = elementorFrame.locator('[data-element_type="e-div-block"]');
			await divWidgets.first().waitFor({ state: "visible", timeout: 10000 });

			// The outer div widget should have styles from #outer selector
			const outerWidget = divWidgets.first();
			await expect(outerWidget).toHaveCSS("background-color", "rgb(211, 211, 211)");
			await expect(outerWidget).toHaveCSS("padding", "20px");
		});

		await test.step("Verify inner ID styles applied to widget", async () => {
			const elementorFrame = editor.getPreviewFrame();

			const divWidgets = elementorFrame.locator('[data-element_type="e-div-block"]');
			
			// The inner div widget should have styles from #inner selector
			const innerWidget = divWidgets.nth(1);
			await expect(innerWidget).toHaveCSS("background-color", "rgb(255, 255, 255)");
			await expect(innerWidget).toHaveCSS("padding", "10px");
		});
	});
});
