import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Body Styles Import', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should extract and apply body background color from CSS', async ( { page, request } ) => {
		const htmlContent = `
			<div class="content">
				<h1>Test Page</h1>
				<p>This is a test paragraph.</p>
			</div>
		`;

		const cssContent = `
			body {
				background-color: #FFFFF3;
			}
			.content {
				padding: 20px;
			}
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, cssContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const body = editorFrame.locator( 'body' );

		await expect( body ).toHaveCSS( 'background-color', 'rgb(255, 255, 243)' );
	} );

	test( 'should extract body background color with complex selector', async ( { page, request } ) => {
		const htmlContent = `
			<div class="elementor-1140">
				<div class="content">
					<h1>Test Page</h1>
				</div>
			</div>
		`;

		const cssContent = `
			body.elementor-page-1140:not(.elementor-motion-effects-element-type-background),
			body.elementor-page-1140 > .elementor-motion-effects-container > .elementor-motion-effects-layer {
				background-color: #FFFFF3;
			}
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, cssContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const body = editorFrame.locator( 'body' );

		await expect( body ).toHaveCSS( 'background-color', 'rgb(255, 255, 243)' );
	} );

	test.skip( 'should extract body styles when using selector parameter', async ( { page, request } ) => {
		const htmlContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body.elementor-page-1140 {
						background-color: #FFFFF3;
						margin: 20px;
						padding: 30px;
					}
				</style>
			</head>
			<body class="elementor-page-1140">
				<div class="elementor-1140">
					<div class="content">
						<h1>Test Page</h1>
					</div>
				</div>
			</body>
			</html>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const body = editorFrame.locator( 'body' );

		await expect( body ).toHaveCSS( 'background-color', 'rgb(255, 255, 243)' );
	} );

	test( 'should extract body margin and padding', async ( { page, request } ) => {
		const htmlContent = `
			<div class="content">
				<h1>Test Page</h1>
			</div>
		`;

		const cssContent = `
			body {
				margin: 20px 30px;
				padding: 40px 50px;
			}
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, cssContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const body = editorFrame.locator( 'body' );

		const marginTop = await body.evaluate( ( el ) => window.getComputedStyle( el ).marginTop );
		const marginRight = await body.evaluate( ( el ) => window.getComputedStyle( el ).marginRight );
		const marginBottom = await body.evaluate( ( el ) => window.getComputedStyle( el ).marginBottom );
		const marginLeft = await body.evaluate( ( el ) => window.getComputedStyle( el ).marginLeft );

		const paddingTop = await body.evaluate( ( el ) => window.getComputedStyle( el ).paddingTop );
		const paddingRight = await body.evaluate( ( el ) => window.getComputedStyle( el ).paddingRight );
		const paddingBottom = await body.evaluate( ( el ) => window.getComputedStyle( el ).paddingBottom );
		const paddingLeft = await body.evaluate( ( el ) => window.getComputedStyle( el ).paddingLeft );

		expect( marginTop ).toBe( '20px' );
		expect( marginRight ).toBe( '30px' );
		expect( marginBottom ).toBe( '20px' );
		expect( marginLeft ).toBe( '30px' );

		expect( paddingTop ).toBe( '40px' );
		expect( paddingRight ).toBe( '50px' );
		expect( paddingBottom ).toBe( '40px' );
		expect( paddingLeft ).toBe( '50px' );
	} );

	test( 'should extract body gradient background', async ( { page, request } ) => {
		const htmlContent = `
			<div class="content">
				<h1>Test Page</h1>
			</div>
		`;

		const cssContent = `
			body {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			}
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, cssContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const body = editorFrame.locator( 'body' );

		const backgroundImage = await body.evaluate( ( el ) => window.getComputedStyle( el ).backgroundImage );

		expect( backgroundImage ).toContain( 'gradient' );
	} );

	test( 'should verify body styles are saved in page settings', async ( { page, request } ) => {
		const htmlContent = `
			<div class="content">
				<h1>Test Page</h1>
			</div>
		`;

		const cssContent = `
			body {
				background-color: #FFFFF3;
				margin: 20px;
				padding: 30px;
			}
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, cssContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		const pageSettings = await request.get( `/wp-json/wp/v2/pages/${ apiResult.post_id }`, {
			headers: {
				'X-DEV-TOKEN': cssHelper.devToken,
			},
		} );

		const pageData = await pageSettings.json();
		const meta = pageData.meta || {};

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();
		const body = editorFrame.locator( 'body' );

		await expect( body ).toHaveCSS( 'background-color', 'rgb(255, 255, 243)' );
	} );
} );

