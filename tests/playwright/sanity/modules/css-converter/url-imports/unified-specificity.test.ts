import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';
import * as path from 'path';
import * as fs from 'fs';

test.describe( 'Unified Specificity Management @unified-specificity', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;
	const fixturesPath = path.join( __dirname, 'fixtures' );
	const htmlFilePath = path.join( fixturesPath, 'specificity-test.html' );
	const cssFilePath = path.join( fixturesPath, 'specificity-test.css' );

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		await page.setViewportSize( { width: 1280, height: 720 } );
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should handle element selector specificity correctly', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const cssContent = fs.readFileSync( cssFilePath, 'utf-8' );

		// Replace external CSS link with inline styles
		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="specificity-test.css">', 
			`<style>${ cssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: false,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify element selector only (specificity: 1)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Test 1: Element selector only - should get styles from h1 { color: black; font-size: 20px; }
			const elementOnlyHeading = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Element Selector Only' } );
			await expect( elementOnlyHeading ).toBeVisible();

			// Element selector styles (specificity: 1)
			await expect( elementOnlyHeading ).toHaveCSS( 'color', 'rgb(0, 0, 0)' ); // black
			await expect( elementOnlyHeading ).toHaveCSS( 'font-size', '20px' );
		} );
	} );

	test( 'should handle class selector specificity correctly', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const cssContent = fs.readFileSync( cssFilePath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="specificity-test.css">', 
			`<style>${ cssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: false,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify class selector wins over element selector (specificity: 10 > 1)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Test 2: Element + Class - class should win
			// h1 { color: black; } vs .red-text { color: red; font-weight: 500; }
			const classHeading = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Element with Class' } );
			await expect( classHeading ).toBeVisible();

			// Class selector should win (specificity: 10 > 1)
			await expect( classHeading ).toHaveCSS( 'color', 'rgb(255, 0, 0)' ); // red from .red-text
			await expect( classHeading ).toHaveCSS( 'font-weight', '500' ); // from .red-text
			await expect( classHeading ).toHaveCSS( 'font-size', '20px' ); // from h1 (no conflict)
		} );
	} );

	test( 'should handle multiple class selectors correctly', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const cssContent = fs.readFileSync( cssFilePath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="specificity-test.css">', 
			`<style>${ cssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: false,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify multiple class selector wins (specificity: 20 > 10 > 1)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Test 3: Element + Multiple Classes
			// .red-text.large-text { color: darkred; font-size: 28px; } (specificity: 20)
			// vs .red-text { color: red; } (specificity: 10)
			// vs h1 { color: black; font-size: 20px; } (specificity: 1)
			const multipleClassHeading = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Element with Multiple Classes' } );
			await expect( multipleClassHeading ).toBeVisible();

			// Multiple class selector should win (specificity: 20)
			await expect( multipleClassHeading ).toHaveCSS( 'color', 'rgb(139, 0, 0)' ); // darkred from .red-text.large-text
			await expect( multipleClassHeading ).toHaveCSS( 'font-size', '28px' ); // from .red-text.large-text
		} );
	} );

	test( 'should handle ID selector specificity correctly', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const cssContent = fs.readFileSync( cssFilePath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="specificity-test.css">', 
			`<style>${ cssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: false, // Note: IDs not preserved, but CSS rules should still apply
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify ID selector wins over class and element (specificity: 100 > 10 > 1)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Test 4: Element + ID + Class
			// #special-heading { color: purple; font-size: 32px; font-weight: 700; } (specificity: 100)
			// vs .red-text { color: red; } (specificity: 10)
			// vs h1 { color: black; font-size: 20px; } (specificity: 1)
			const idHeading = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Element with ID and Class' } );
			await expect( idHeading ).toBeVisible();

			// ID selector should win (specificity: 100)
			await expect( idHeading ).toHaveCSS( 'color', 'rgb(128, 0, 128)' ); // purple from #special-heading
			await expect( idHeading ).toHaveCSS( 'font-size', '32px' ); // from #special-heading
			await expect( idHeading ).toHaveCSS( 'font-weight', '700' ); // from #special-heading
		} );
	} );

	test( 'should handle inline style specificity correctly', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const cssContent = fs.readFileSync( cssFilePath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="specificity-test.css">', 
			`<style>${ cssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: false,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify inline style wins over all CSS selectors (specificity: 1000 > 100)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Test 6: Inline Style
			// style="color: lime; font-size: 36px;" (specificity: 1000)
			// vs #special-heading { color: purple; font-size: 32px; } (specificity: 100)
			// vs .red-text { color: red; } (specificity: 10)
			// vs h1 { color: black; font-size: 20px; } (specificity: 1)
			const inlineHeading = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Inline Style' } );
			await expect( inlineHeading ).toBeVisible();

			// Inline style should win (specificity: 1000)
			await expect( inlineHeading ).toHaveCSS( 'color', 'rgb(0, 255, 0)' ); // lime from inline style
			await expect( inlineHeading ).toHaveCSS( 'font-size', '36px' ); // from inline style
		} );
	} );

	test( 'should handle !important declarations correctly', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const cssContent = fs.readFileSync( cssFilePath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="specificity-test.css">', 
			`<style>${ cssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: false,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify !important wins over inline styles (specificity: 10010 > 1000)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Test 7: !important vs Inline
			// .important-class { color: gold !important; font-size: 20px !important; } (specificity: 10000 + 10 = 10010)
			// vs style="color: pink; font-size: 30px;" (specificity: 1000)
			const importantHeading = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Important vs Inline' } );
			await expect( importantHeading ).toBeVisible();

			// !important should win (specificity: 10010)
			await expect( importantHeading ).toHaveCSS( 'color', 'rgb(255, 215, 0)' ); // gold from !important
			await expect( importantHeading ).toHaveCSS( 'font-size', '20px' ); // from !important
		} );
	} );

	test( 'should handle descendant selectors correctly', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const cssContent = fs.readFileSync( cssFilePath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="specificity-test.css">', 
			`<style>${ cssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: false,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify descendant selector specificity (specificity: 11 > 1)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Test 8: Descendant Selector
			// .container h1 { color: green; font-size: 22px; } (specificity: 10 + 1 = 11)
			// vs h1 { color: black; font-size: 20px; } (specificity: 1)
			const descendantHeading = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Descendant Selector' } );
			await expect( descendantHeading ).toBeVisible();

			// Descendant selector should win (specificity: 11)
			await expect( descendantHeading ).toHaveCSS( 'color', 'rgb(0, 128, 0)' ); // green from .container h1
			await expect( descendantHeading ).toHaveCSS( 'font-size', '22px' ); // from .container h1
		} );
	} );

	test( 'should verify API statistics for unified approach', async ( { request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const cssContent = fs.readFileSync( cssFilePath, 'utf-8' );

		htmlContent = htmlContent.replace( 
			'<link rel="stylesheet" href="specificity-test.css">', 
			`<style>${ cssContent }</style>` 
		);

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			useZeroDefaults: true,
			preserveIds: false,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );

		await test.step( 'Verify conversion statistics', async () => {
			const cssProcessing = (apiResult.conversion_log as any)?.css_processing;
			
			// Should have processed CSS rules
			expect( cssProcessing?.rules_processed ).toBeGreaterThan( 0 );
			
			// Should have created widgets
			expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
			
			// Should have processed global classes
			expect( cssProcessing?.global_classes_created ).toBeGreaterThan( 0 );
		} );

		await test.step( 'Verify unified approach benefits', async () => {
			// The API should have used zero defaults
			expect( (apiResult.conversion_log as any)?.options?.useZeroDefaults ).toBe( true );
			
			// Should have proper specificity handling (this would be validated by the visual tests above)
			// The unified approach should eliminate competition between inline styles and CSS selectors
			
			// Log for debugging
			console.log( '🎯 Unified Approach Statistics:' );
			console.log( '  - Widgets Created:', apiResult.widgets_created );
			console.log( '  - Rules Processed:', (apiResult.conversion_log as any)?.css_processing?.rules_processed );
			console.log( '  - Global Classes:', (apiResult.conversion_log as any)?.css_processing?.global_classes_created );
		} );
	} );
});
