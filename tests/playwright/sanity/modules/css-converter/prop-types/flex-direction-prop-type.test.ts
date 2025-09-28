import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Flex Direction Prop Type Integration @prop-types', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic widgets experiments to match manual testing environment
		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdminPage.setExperiments( {
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert flex-direction properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'flex-direction', value: 'row', selector: '[data-test="flex-row"]', expected: 'row' },
			{ property: 'flex-direction', value: 'row-reverse', selector: '[data-test="flex-row-reverse"]', expected: 'row-reverse' },
			{ property: 'flex-direction', value: 'column', selector: '[data-test="flex-column"]', expected: 'column' },
			{ property: 'flex-direction', value: 'column-reverse', selector: '[data-test="flex-column-reverse"]', expected: 'column-reverse' },
		];

		const combinedCssContent = `
			<div>
				<div style="display: flex; flex-direction: row; border: 1px solid #ccc; margin: 10px;">
					<p>Item 1</p>
					<p>Item 2</p>
					<p>Item 3</p>
				</div>
				<div style="display: flex; flex-direction: row-reverse; border: 1px solid #ccc; margin: 10px;">
					<p>Item 1</p>
					<p>Item 2</p>
					<p>Item 3</p>
				</div>
				<div style="display: flex; flex-direction: column; border: 1px solid #ccc; margin: 10px;">
					<p>Item 1</p>
					<p>Item 2</p>
					<p>Item 3</p>
				</div>
				<div style="display: flex; flex-direction: column-reverse; border: 1px solid #ccc; margin: 10px;">
					<p>Item 1</p>
					<p>Item 2</p>
					<p>Item 3</p>
				</div>
			</div>
		`;

		// Convert HTML with CSS to Elementor widgets
		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to editor
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify in editor
		for ( const testCase of testCases ) {
			const element = editor.getPreviewFrame().locator( `[data-test="${ testCase.selector.replace( /[\[\]"]/g, '' ).split( '=' )[ 1 ] }"]` );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'flex-direction', testCase.expected );
		}

		// Save and navigate to frontend
		await editor.saveAndReloadPage();
		await page.goto( editor.getPreviewUrl() );

		// Verify on frontend
		for ( const testCase of testCases ) {
			const element = page.locator( `[data-test="${ testCase.selector.replace( /[\[\]"]/g, '' ).split( '=' )[ 1 ] }"]` );
			await expect( element ).toBeVisible();
			await expect( element ).toHaveCSS( 'flex-direction', testCase.expected );
		}
	} );

	test( 'should handle flex-direction with flex containers', async ( { page, request } ) => {
		const flexContainerCssContent = `
			<div>
				<div style="display: flex; flex-direction: column; height: 200px; justify-content: space-between;">
					<p style="background: #f0f0f0;">Header</p>
					<p style="background: #e0e0e0;">Content</p>
					<p style="background: #d0d0d0;">Footer</p>
				</div>
			</div>
		`;

		// Convert and test flex containers
		const apiResult = await cssHelper.convertHtmlWithCss( request, flexContainerCssContent, '' );
		expect( apiResult.post_id ).toBeDefined();

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify flex container in editor
		const flexContainer = editor.getPreviewFrame().locator( '[data-test="flex-column-container"]' );
		await expect( flexContainer ).toBeVisible();
		await expect( flexContainer ).toHaveCSS( 'display', 'flex' );
		await expect( flexContainer ).toHaveCSS( 'flex-direction', 'column' );
	} );
} );

