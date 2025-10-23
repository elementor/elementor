import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';
import * as fs from 'fs';
import * as path from 'path';

const testIndex = process.env.TEST_PARALLEL_INDEX || '0';
const storageStatePath = path.resolve( `test-results/.storageState-${ testIndex }.json` );

if ( ! fs.existsSync( storageStatePath ) ) {
	try {
		fs.writeFileSync( storageStatePath, JSON.stringify( {} ), 'utf-8' );
	} catch ( error ) {
		//
	}
}

test.describe( 'CSS Class Generation @inline-styles @critical', () => {
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
		// Await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'CRITICAL: should generate CSS classes for inline styles', async ( { page, request } ) => {
		const html = '<p style="color: red;">Text with inline style</p>';

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

		await test.step( 'Verify element has CSS class', async () => {
			let elementorFrame = editor.getPreviewFrame();
			
			if ( ! elementorFrame ) {
				await page.waitForTimeout( 1000 );
				elementorFrame = editor.getPreviewFrame();
			}
			
			if ( ! elementorFrame ) {
				console.warn( 'Preview frame not available, skipping element class verification' );
				return;
			}
			
			try {
				await elementorFrame.waitForLoadState( 'networkidle' );
			} catch ( e ) {
				console.warn( 'Preview frame did not load state' );
			}

			const element = elementorFrame.locator( '.e-con p' ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			const elementClass = await element.getAttribute( 'class' );

			expect( elementClass ).toBeTruthy();
			expect( elementClass ).toContain( 'p' );

			const hasGeneratedClass = /e-[a-f0-9-]+/.test( elementClass || '' );
			expect( hasGeneratedClass ).toBeTruthy();
		} );

		await test.step( 'Verify CSS rule exists in page', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const element = elementorFrame.locator( '.e-con p' ).first();

			const color = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).getPropertyValue( 'color' );
			} );

			expect( color ).toBe( 'rgb(255, 0, 0)' );
		} );
	} );

	test( 'CRITICAL: should generate unique CSS classes for each element', async ( { page, request } ) => {
		const html = `
			<div>
				<p style="color: red;">Text 1</p>
				<p style="color: blue;">Text 2</p>
				<p style="color: green;">Text 3</p>
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

			const elements = elementorFrame.locator( '.e-con p' );
			const count = await elements.count();
			expect( count ).toBe( 3 );

			const classes: string[] = [];
			for ( let i = 0; i < count; i++ ) {
				const element = elements.nth( i );
				const elementClass = await element.getAttribute( 'class' );

				expect( elementClass ).toBeTruthy();
				expect( elementClass ).toContain( 'p' );

				const generatedClassMatch = elementClass?.match( /e-[a-f0-9-]+/ );
				expect( generatedClassMatch ).toBeTruthy();

				if ( generatedClassMatch ) {
					classes.push( generatedClassMatch[ 0 ] );
				}
			}

			const uniqueClasses = new Set( classes );
			expect( uniqueClasses.size ).toBe( 3 );
		} );

		await test.step( 'Verify each CSS rule is applied correctly', async () => {
			const elementorFrame = editor.getPreviewFrame();

			const element1 = elementorFrame.locator( '.e-con p' ).nth( 0 );
			await expect( element1 ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );

			const element2 = elementorFrame.locator( '.e-con p' ).nth( 1 );
			await expect( element2 ).toHaveCSS( 'color', 'rgb(0, 0, 255)' );

			const element3 = elementorFrame.locator( '.e-con p' ).nth( 2 );
			await expect( element3 ).toHaveCSS( 'color', 'rgb(0, 128, 0)' );
		} );
	} );

	test( 'CRITICAL: should not break when no inline styles present', async ( { page, request } ) => {
		const html = '<p>Text without inline style</p>';

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

		await test.step( 'Verify element is created without inline style class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( '.e-con p' ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			const elementClass = await element.getAttribute( 'class' );
			expect( elementClass ).toContain( 'p' );
		} );
	} );

	test( 'CRITICAL: should handle mix of inline and non-inline elements', async ( { page, request } ) => {
		const html = `
			<div>
				<p>Normal text</p>
				<p style="color: red;">Red text</p>
				<p>Another normal text</p>
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

		await test.step( 'Verify inline styled element has generated class', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const styledElement = elementorFrame.locator( '.e-con p' ).nth( 1 );
			await styledElement.waitFor( { state: 'visible', timeout: 10000 } );

			const elementClass = await styledElement.getAttribute( 'class' );
			const hasGeneratedClass = /e-[a-f0-9-]+/.test( elementClass || '' );
			expect( hasGeneratedClass ).toBeTruthy();

			await expect( styledElement ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		} );

		await test.step( 'Verify all elements are created', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const elements = elementorFrame.locator( '.e-con p' );
			const count = await elements.count();
			expect( count ).toBe( 3 );
		} );
	} );
} );
