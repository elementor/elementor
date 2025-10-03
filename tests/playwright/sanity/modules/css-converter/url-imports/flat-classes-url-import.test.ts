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

	test.only( 'should apply inline and ID selector styles directly to widgets', async ( { page, request } ) => {
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

		console.log( `✓ Created ${ apiResult.widgets_created } widgets` );
		console.log( `✓ ID selectors processed: ${ ( apiResult.conversion_log as any )?.css_processing?.id_selectors_processed || 0 }` );

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

			console.log( '✓ ID selector styles (#header) applied and verified in widget' );
		} );

		await test.step( 'Verify inline styles are applied to widgets', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const heading = elementorFrame.locator( '.e-heading-base' ).first();
			await expect( heading ).toBeVisible();
			await expect( heading ).toHaveCSS( 'color', 'rgb(236, 240, 241)' );
			await expect( heading ).toHaveCSS( 'font-size', '48px' );
			await expect( heading ).toHaveCSS( 'font-weight', '700' );

			console.log( '✓ Inline styles applied and verified in widget' );
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

		console.log( `✓ Test verified: ${ apiResult.global_classes_created } global classes created from flat CSS classes` );
		console.log( `✓ Widgets created: ${ apiResult.widgets_created }` );
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

		console.log( '✓ Successfully processed HTML with multiple classes per element' );
		console.log( `✓ Created ${ apiResult.widgets_created } widgets from multi-class elements` );
		console.log( `✓ Created ${ apiResult.global_classes_created } global classes from flat CSS` );
	} );
} );
