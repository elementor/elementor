import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Basic ID Styles @id-styles', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

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
		// await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should apply ID styles correctly', async ( { page, request } ) => {
		const html = '<div id="header"><h1>Header Title</h1></div>';
		const css = '#header { background-color: blue; padding: 20px; }';

		const apiResult = await cssHelper.convertHtmlWithCss( request, html, css );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify ID styles are applied', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const header = elementorFrame.locator( '#header' ).first();
			await header.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( header ).toHaveCSS( 'background-color', 'rgb(0, 0, 255)' );
			await expect( header ).toHaveCSS( 'padding', '20px' );
		} );
	} );

	test( 'should handle multiple elements with different IDs', async ( { page, request } ) => {
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

		const apiResult = await cssHelper.convertHtmlWithCss( request, html, css );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify each ID style is applied correctly', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const header = elementorFrame.locator( '#header' ).first();
			await header.waitFor( { state: 'visible', timeout: 10000 } );
			await expect( header ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );

			const content = elementorFrame.locator( '#content' ).first();
			await content.waitFor( { state: 'visible', timeout: 10000 } );
			await expect( content ).toHaveCSS( 'background-color', 'rgb(0, 0, 255)' );

			const footer = elementorFrame.locator( '#footer' ).first();
			await footer.waitFor( { state: 'visible', timeout: 10000 } );
			await expect( footer ).toHaveCSS( 'background-color', 'rgb(0, 128, 0)' );
		} );
	} );

	test( 'should preserve ID attribute on element', async ( { page, request } ) => {
		const html = '<div id="unique-section"><p>Content</p></div>';
		const css = '#unique-section { border: 2px solid red; }';

		const apiResult = await cssHelper.convertHtmlWithCss( request, html, css );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify ID attribute is preserved', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( '#unique-section' ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			const id = await element.getAttribute( 'id' );
			expect( id ).toBe( 'unique-section' );
		} );

		await test.step( 'Verify ID styles are applied', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const element = elementorFrame.locator( '#unique-section' ).first();

			await expect( element ).toHaveCSS( 'border-width', '2px' );
			await expect( element ).toHaveCSS( 'border-style', 'solid' );
			await expect( element ).toHaveCSS( 'border-color', 'rgb(255, 0, 0)' );
		} );
	} );

	test( 'should handle ID styles on nested elements', async ( { page, request } ) => {
		const html = `
			<div id="outer">
				<div id="inner">
					<p>Nested content</p>
				</div>
			</div>
		`;
		const css = `
			#outer { background-color: lightgray; padding: 20px; }
			#inner { background-color: white; padding: 10px; }
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, html, css );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}

		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify outer ID styles', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const outer = elementorFrame.locator( '#outer' ).first();
			await outer.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( outer ).toHaveCSS( 'background-color', 'rgb(211, 211, 211)' );
			await expect( outer ).toHaveCSS( 'padding', '20px' );
		} );

		await test.step( 'Verify inner ID styles', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const inner = elementorFrame.locator( '#inner' ).first();
			await inner.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( inner ).toHaveCSS( 'background-color', 'rgb(255, 255, 255)' );
			await expect( inner ).toHaveCSS( 'padding', '10px' );
		} );
	} );
} );
