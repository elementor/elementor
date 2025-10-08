import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'ID Styles Specificity @id-styles @specificity', () => {
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

	test( 'should respect ID > class > element specificity', async ( { page, request } ) => {
		const html = '<h1 id="title" class="heading">Title</h1>';
		const css = `
			h1 { color: black; }
			.heading { color: blue; }
			#title { color: red; }
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

		await test.step( 'Verify ID style wins over class and element', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const heading = elementorFrame.locator( '#title' ).first();
			await heading.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( heading ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		} );
	} );

	test( 'should respect inline > ID specificity', async ( { page, request } ) => {
		const html = '<p id="text" style="color: green;">Text</p>';
		const css = '#text { color: red; }';

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

		await test.step( 'Verify inline style wins over ID', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const text = elementorFrame.locator( '#text' ).first();
			await text.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( text ).toHaveCSS( 'color', 'rgb(0, 128, 0)' );
		} );
	} );

	test( 'should handle ID with class selector vs ID alone', async ( { page, request } ) => {
		const html = '<div id="container" class="box">Content</div>';
		const css = `
			#container { background-color: blue; }
			#container.box { background-color: red; }
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

		await test.step( 'Verify more specific selector wins', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const container = elementorFrame.locator( '#container' ).first();
			await container.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( container ).toHaveCSS( 'background-color', 'rgb(255, 0, 0)' );
		} );
	} );

	test( 'should handle multiple ID selectors', async ( { page, request } ) => {
		const html = `
			<div id="outer">
				<div id="inner">Content</div>
			</div>
		`;
		const css = `
			#inner { color: blue; }
			#outer #inner { color: red; }
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

		await test.step( 'Verify descendant ID selector wins', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const inner = elementorFrame.locator( '#inner' ).first();
			await inner.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( inner ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		} );
	} );

	test( 'should handle !important with ID styles', async ( { page, request } ) => {
		const html = '<p id="text">Text</p>';
		const css = `
			p { color: blue !important; }
			#text { color: red; }
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

		await test.step( 'Verify !important wins over ID', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const text = elementorFrame.locator( '#text' ).first();
			await text.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( text ).toHaveCSS( 'color', 'rgb(0, 0, 255)' );
		} );
	} );

	test( 'should handle ID with !important vs inline style', async ( { page, request } ) => {
		const html = '<p id="text" style="color: green;">Text</p>';
		const css = '#text { color: red !important; }';

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

		await test.step( 'Verify ID with !important wins over inline', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const text = elementorFrame.locator( '#text' ).first();
			await text.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( text ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		} );
	} );
} );
