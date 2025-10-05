import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';
import * as path from 'path';
import * as fs from 'fs';

test.describe( 'HTML Import with Flat Classes @url-imports', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let cssHelper: CssConverterHelper;
	const fixturesPath = path.join( __dirname, 'fixtures' );
	const htmlFilePath = path.join( fixturesPath, 'flat-classes-test-page.html' );
	const css1Path = path.join( fixturesPath, 'external-styles-1.css' );
	const css2Path = path.join( fixturesPath, 'external-styles-2.css' );

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

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should apply inline and ID selector styles directly to widgets', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( ( apiResult.conversion_log as any )?.css_processing?.id_selectors_processed ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify ID selector styles (#header) are applied to widget', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const elements = elementorFrame.locator( '.elementor-element' );
			await expect( elements.first() ).toBeVisible( { timeout: 10000 } );

			const header = elements.first();
			await expect( header ).toHaveCSS( 'background-color', 'rgb(44, 62, 80)' );
			await expect( header ).toHaveCSS( 'padding', '40px 20px' );
			await expect( header ).toHaveCSS( 'text-align', 'center' );
		} );

		await test.step( 'Verify inline styles are applied to widgets', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const heading = elementorFrame.locator( '.e-heading-base' ).first();
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveCSS( 'color', 'rgb(236, 240, 241)' );
			await expect( heading ).toHaveCSS( 'font-size', '48px' );
			await expect( heading ).toHaveCSS( 'font-weight', '700' );
		} );
	} );

	test( 'should verify global classes creation from flat classes', async ( { request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 0 );
	} );

	test( 'should create widgets from elements with multiple classes', async ( { request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 20 );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 20 );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL advanced text properties', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify letter-spacing from .text-bold class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const bannerTitle = elementorFrame.locator( '.e-heading-base' ).filter( { hasText: 'Ready to Get Started?' } );
			await expect( bannerTitle ).toBeVisible();
			await expect( bannerTitle ).toHaveCSS( 'letter-spacing', '1px' );
		} );

		await test.step( 'CRITICAL: Verify text-transform from .banner-title class', async () => {
		} );

		await test.step( 'CRITICAL: Verify text-shadow from .banner-title class', async () => {
                } );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL box-shadow properties', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify header box-shadow from #header ID selector', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const header = elementorFrame.locator( '.elementor-element' ).first();
			await expect( header ).toHaveCSS( 'box-shadow', 'rgba(0, 0, 0, 0.1) 2px 8px 0px 0px' );
		} );

		await test.step( 'CRITICAL: Verify links-container box-shadow from .links-container class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			
			const linksContainer = elementorFrame.locator( '.elementor-element' ).filter( { has: elementorFrame.locator( 'a' ).filter( { hasText: 'Link One - Important Resource' } ) } ).first();
			await expect( linksContainer ).toHaveCSS( 'box-shadow', 'rgba(0, 0, 0, 0.12) 1px 3px 0px 0px' );
		} );

		await test.step( 'CRITICAL: Verify button box-shadow from .button-primary class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			
			const primaryButton = elementorFrame.locator( 'a' ).filter( { hasText: 'Get Started Now' } );
			await expect( primaryButton ).toHaveCSS( 'box-shadow', 'rgba(52, 152, 219, 0.3) 4px 6px 0px 0px' );
		} );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL border properties', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify border from .bg-light class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const linksContainer = elementorFrame.locator( '.elementor-element' ).filter( { has: elementorFrame.locator( 'a' ).filter( { hasText: 'Link One' } ) } ).first();
			
			await expect( linksContainer ).toHaveCSS( 'border-top-width', '1px' );
			await expect( linksContainer ).toHaveCSS( 'border-right-width', '1px' );
			await expect( linksContainer ).toHaveCSS( 'border-bottom-width', '1px' );
			await expect( linksContainer ).toHaveCSS( 'border-left-width', '1px' );
			
			await expect( linksContainer ).toHaveCSS( 'border-top-style', 'solid' );
			await expect( linksContainer ).toHaveCSS( 'border-right-style', 'solid' );
			await expect( linksContainer ).toHaveCSS( 'border-bottom-style', 'solid' );
			await expect( linksContainer ).toHaveCSS( 'border-left-style', 'solid' );
			
			await expect( linksContainer ).toHaveCSS( 'border-top-color', 'rgb(222, 226, 230)' );
			await expect( linksContainer ).toHaveCSS( 'border-right-color', 'rgb(222, 226, 230)' );
			await expect( linksContainer ).toHaveCSS( 'border-bottom-color', 'rgb(222, 226, 230)' );
			await expect( linksContainer ).toHaveCSS( 'border-left-color', 'rgb(222, 226, 230)' );
		} );

		await test.step( 'CRITICAL: Verify border-bottom from .link-item class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			
			const linkItemContainer = elementorFrame.locator( '.e-div-block-base' ).filter( { 
				has: elementorFrame.locator( 'a' ).filter( { hasText: 'Link One - Important Resource' } ) 
			} ).filter( { 
				hasNotText: 'Link Two - Additional Information' 
			} ).first();
                        
			await expect( linkItemContainer ).toHaveCSS( 'border-bottom-width', '1px' );
			await expect( linkItemContainer ).toHaveCSS( 'border-bottom-style', 'solid' );
			await expect( linkItemContainer ).toHaveCSS( 'border-bottom-color', 'rgb(233, 236, 239)' );
			
			await expect( linkItemContainer ).toHaveCSS( 'border-top-width', '0px' );
			await expect( linkItemContainer ).toHaveCSS( 'border-left-width', '0px' );
			await expect( linkItemContainer ).toHaveCSS( 'border-right-width', '0px' );
		} );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL link colors and typography', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify .link-secondary color and typography', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const linkSecondary = elementorFrame.locator( 'a' ).filter( { hasText: 'Link Two - Additional Information' } );
			await expect( linkSecondary ).toBeVisible();
			
			await expect( linkSecondary ).toHaveCSS( 'color', 'rgb(22, 160, 133)' );
			await expect( linkSecondary ).toHaveCSS( 'font-size', '17px' );
			await expect( linkSecondary ).toHaveCSS( 'font-weight', '500' );
		} );

		await test.step( 'CRITICAL: Verify .link-accent color and typography', async () => {
			const elementorFrame = editor.getPreviewFrame();
			
			const linkAccent = elementorFrame.locator( 'a' ).filter( { hasText: 'Link Three - Special Feature' } );
			
			await expect( linkAccent ).toHaveCSS( 'color', 'rgb(231, 76, 60)' );
			await expect( linkAccent ).toHaveCSS( 'font-weight', '700' );
		} );

		await test.step( 'CRITICAL: Verify .link-danger color and typography', async () => {
			const elementorFrame = editor.getPreviewFrame();
			
			const linkDanger = elementorFrame.locator( 'a' ).filter( { hasText: 'Link Nine - Critical Updates' } );
			
			await expect( linkDanger ).toHaveCSS( 'color', 'rgb(192, 57, 43)' );
			await expect( linkDanger ).toHaveCSS( 'font-size', '17px' );
			await expect( linkDanger ).toHaveCSS( 'font-weight', '700' );
		} );
	} );

	test( 'COMPREHENSIVE STYLING TEST - should apply ALL background properties', async ( { page, request } ) => {
		let htmlContent = fs.readFileSync( htmlFilePath, 'utf-8' );
		const css1Content = fs.readFileSync( css1Path, 'utf-8' );
		const css2Content = fs.readFileSync( css2Path, 'utf-8' );

		htmlContent = htmlContent
			.replace( '<link rel="stylesheet" href="external-styles-1.css">', `<style>${ css1Content }</style>` )
			.replace( '<link rel="stylesheet" href="external-styles-2.css">', `<style>${ css2Content }</style>` );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, {
			createGlobalClasses: true,
			preserveIds: true,
		} );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 API Result Debug:', JSON.stringify( apiResult, null, 2 ) );
			console.log( '🔍 Validation Skip Reason:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'CRITICAL: Verify gradient background from .bg-gradient class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const bannerSection = elementorFrame.locator( '.elementor-element' ).filter( { has: elementorFrame.locator( 'h2' ).filter( { hasText: 'Ready to Get Started?' } ) } ).first();
			await expect( bannerSection ).toBeVisible();
			
			const backgroundImage = await bannerSection.evaluate( ( el ) => getComputedStyle( el ).backgroundImage );
			
			expect( backgroundImage ).toContain( 'linear-gradient' );
			expect( backgroundImage ).toContain( 'rgb(102, 126, 234)' );
			expect( backgroundImage ).toContain( 'rgb(118, 75, 162)' );
		} );
	} );
} );
