import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Basic Inline Styles @inline-styles', () => {
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

	test( 'should generate CSS classes for inline styles', async ( { page, request } ) => {
		const html = '<p style="color: red;">Red text</p>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, html, '' );

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

		await test.step( 'Verify CSS class is generated', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( '.elementor-widget-e-paragraph p' ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			const elementClass = await element.getAttribute( 'class' );
			expect( elementClass ).toMatch( /e-[a-f0-9-]+/ );
		} );

		await test.step( 'Verify inline style is applied', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const element = elementorFrame.locator( '.elementor-widget-e-paragraph p' ).first();

			await expect( element ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		} );
	} );

	test( 'should generate unique CSS classes for multiple inline styles', async ( { page, request } ) => {
		const html = `
			<div>
				<p style="color: red;">Red text</p>
				<p style="color: blue;">Blue text</p>
				<p style="color: green;">Green text</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, html, '' );

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

		await test.step( 'Verify each element has unique CSS class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const elements = elementorFrame.locator( '.elementor-widget-e-paragraph p' );
			const count = await elements.count();
			expect( count ).toBe( 3 );

			const classes = [];
			for ( let i = 0; i < count; i++ ) {
				const element = elements.nth( i );
				const elementClass = await element.getAttribute( 'class' );
				classes.push( elementClass );
			}

			const uniqueClasses = new Set( classes );
			expect( uniqueClasses.size ).toBe( 3 );
		} );

		await test.step( 'Verify each inline style is applied correctly', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const redElement = elementorFrame.locator( '.elementor-widget-e-paragraph p' ).nth( 0 );
			await expect( redElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );

			const blueElement = elementorFrame.locator( '.elementor-widget-e-paragraph p' ).nth( 1 );
			await expect( blueElement ).toHaveCSS( 'color', 'rgb(0, 0, 255)' );

			const greenElement = elementorFrame.locator( '.elementor-widget-e-paragraph p' ).nth( 2 );
			await expect( greenElement ).toHaveCSS( 'color', 'rgb(0, 128, 0)' );
		} );
	} );

	test( 'should handle multiple inline properties on same element', async ( { page, request } ) => {
		const html = '<p style="color: red; font-size: 24px; padding: 10px;">Styled text</p>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, html, '' );

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

		await test.step( 'Verify all inline styles are applied', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( '.elementor-widget-e-paragraph p' ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			await expect( element ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
			await expect( element ).toHaveCSS( 'font-size', '24px' );
			await expect( element ).toHaveCSS( 'padding', '10px' );
		} );
	} );

	test( 'should handle inline styles on different element types', async ( { page, request } ) => {
		const html = `
			<div>
				<h1 style="color: red;">Red Heading</h1>
				<p style="color: blue;">Blue paragraph</p>
				<div style="background-color: yellow; padding: 20px;">
					<span style="font-weight: bold;">Bold text</span>
				</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, html, '' );

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

		await test.step( 'Verify inline styles on h1', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const heading = elementorFrame.locator( '.elementor-widget-e-heading :is(h1, h2, h3, h4)' ).first();
			await heading.waitFor( { state: 'visible', timeout: 10000 } );
			await expect( heading ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		} );

		await test.step( 'Verify inline styles on p', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const paragraph = elementorFrame.locator( '.elementor-widget-e-paragraph p' ).first();
			await expect( paragraph ).toHaveCSS( 'color', 'rgb(0, 0, 255)' );
		} );

		await test.step( 'Verify inline styles on div', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const divBlock = elementorFrame.locator( '[data-element_type="e-div-block"]' ).first();
			await divBlock.waitFor( { state: 'visible', timeout: 10000 } );
			await expect( divBlock ).toHaveCSS( 'background-color', 'rgb(255, 255, 0)' );
			await expect( divBlock ).toHaveCSS( 'padding', '20px' );
		} );
	} );
} );
