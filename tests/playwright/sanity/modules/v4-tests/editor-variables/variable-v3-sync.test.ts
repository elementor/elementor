import { BrowserContext, Page, TestInfo, expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';

import ApiRequests from '../../../../assets/api-requests';
import EditorPage from '../../../../pages/editor-page';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { createVariableWithSync, deleteAllVariablesViaApi } from './variables-api-utils';

const initTemplate = async ( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdminPage.setExperiments( { e_variables: 'active', e_atomic_elements: 'active' } );
	await wpAdminPage.setExperiments( { e_variables_manager: 'active' } );
	const editorPage = await wpAdminPage.openNewPage();
	await editorPage.loadTemplate( 'tests/playwright/sanity/modules/v4-tests/editor-variables/variables-manager-template.json' );
	return { wpAdminPage, editorPage };
};

test.describe( 'V4-V3 Color Variable Sync @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;
	let page: Page;
	let apiRequests: ApiRequests;

	const syncedColorName = 'synced-color';
	const syncedColorValue = '#ff5733';

	test.beforeAll( async ( { browser, apiRequests: api }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		apiRequests = api;
		const result = await initTemplate( page, testInfo, apiRequests );
		wpAdminPage = result.wpAdminPage;
		editor = result.editorPage;
	} );

	test.beforeEach( async () => {
		const request = page.context().request;
		await deleteAllVariablesViaApi( apiRequests, request );
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context.close();
	} );

	test( 'Synced V4 color variable appears in Site Settings > Global Colors', async () => {
		await test.step( 'Create a V4 color variable with sync_to_v3 via API', async () => {
			const request = page.context().request;
			await createVariableWithSync( apiRequests, request, {
				id: `synced-color-${ Date.now() }`,
				label: syncedColorName,
				value: syncedColorValue,
				type: 'global-color-variable',
			} );
			await page.reload();
			await editor.waitForPanelToLoad();
		} );

		await test.step( 'Verify synced color appears in Site Settings > Global Colors', async () => {
			await editor.openSiteSettings( 'global-colors' );

			const syncedColorSection = page.locator( '.elementor-control-v4_color_variables_display' );
			await expect( syncedColorSection ).toBeVisible();
			await expect( syncedColorSection.getByText( syncedColorValue, { exact: false } ) ).toBeVisible();
		} );
	} );

	test( 'Synced V4 color variable appears in V3 widget color picker and renders correctly on frontend', async () => {
		await test.step( 'Create a V4 color variable with sync_to_v3 via API', async () => {
			const request = page.context().request;
			await createVariableWithSync( apiRequests, request, {
				id: `synced-color-${ Date.now() }`,
				label: syncedColorName,
				value: syncedColorValue,
				type: 'global-color-variable',
			} );
			await page.reload();
			await editor.waitForPanelToLoad();
		} );

		await test.step( 'Add a V3 Heading widget and verify synced color in picker', async () => {
			await page.locator( 'header' ).getByRole( 'button', { name: 'Add Element' } ).click();
			await editor.addWidget( { widgetType: 'heading' } );
			await editor.openPanelTab( 'style' );
			await page.locator( '.elementor-control-title_color .e-global__popover-toggle' ).click();
			await expect( page.locator( '.e-global__color' ).filter( { hasText: syncedColorName } ) ).toBeVisible();
		} );

		await test.step( 'Select the synced color for the heading', async () => {
			await page.locator( '.e-global__color' ).filter( { hasText: syncedColorName } ).click();
		} );

		await test.step( 'Publish and verify on frontend', async () => {
			await editor.publishAndViewPage();
			const heading = page.locator( 'h2.elementor-heading-title' );
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveScreenshot( 'synced-color-heading.png' );
		} );
	} );
} );
