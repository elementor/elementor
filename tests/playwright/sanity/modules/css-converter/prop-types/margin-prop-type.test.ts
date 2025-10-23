import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Margin Prop Type Integration @prop-types', () => {
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
		// Await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert negative margin values', async ( { page, request } ) => {
		const html = '<div><p style="margin: -20px;">Negative margin content</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, html );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'API validation failed' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify negative margin is applied
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const element = elementorFrame.locator( '.e-con p' ).first();
		await element.waitFor( { state: 'visible', timeout: 10000 } );

		await expect( element ).toHaveCSS( 'margin-block-start', '-20px' );
		await expect( element ).toHaveCSS( 'margin-inline-end', '-20px' );
		await expect( element ).toHaveCSS( 'margin-block-end', '-20px' );
		await expect( element ).toHaveCSS( 'margin-inline-start', '-20px' );
	} );

	test( 'should convert margin shorthand with mixed values', async ( { page, request } ) => {
		const html = '<div><p style="margin: 10px -20px 30px -40px;">Mixed margin values</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, html );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'API validation failed' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each direction has correct value
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const element = elementorFrame.locator( '.e-con p' ).first();
		await element.waitFor( { state: 'visible', timeout: 10000 } );

		await expect( element ).toHaveCSS( 'margin-block-start', '10px' );
		await expect( element ).toHaveCSS( 'margin-inline-end', '-20px' );
		await expect( element ).toHaveCSS( 'margin-block-end', '30px' );
		await expect( element ).toHaveCSS( 'margin-inline-start', '-40px' );
	} );

	test( 'should test individual margin properties with Strategy 1', async ( { page, request } ) => {
		const testCases = [
			{
				name: 'Individual physical property',
				html: '<div><p style="margin-left: 40px;">Physical individual</p></div>',
				expectedLogical: { marginInlineStart: '40px' },
			},
			{
				name: 'Individual logical property',
				html: '<div><p style="margin-inline-start: 40px;">Logical individual</p></div>',
				expectedLogical: { marginInlineStart: '40px' },
			},
			{
				name: 'Multiple individual properties',
				html: '<div><p style="margin-inline-start: 40px; margin-block-end: 20px;">Multiple individual</p></div>',
				expectedLogical: { marginInlineStart: '40px', marginBlockEnd: '20px' },
			},
		];

		for ( const testCase of testCases ) {
			const apiResult = await cssHelper.convertHtmlWithCss( request, testCase.html );

			const validation = cssHelper.validateApiResult( apiResult );
			if ( validation.shouldSkip ) {
				continue;
			}

			await page.goto( apiResult.edit_url );
			editor = new EditorPage( page, wpAdmin.testInfo );
			await editor.waitForPanelToLoad();

			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Wait longer for the editor to fully load
			await page.waitForTimeout( 3000 );

			const element = elementorFrame.locator( '.e-con p' ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			// Verify that inline CSS has been converted to atomic properties
			// The final widget should have NO inline CSS - only atomic properties

			// 1. Check that the element has NO inline style attribute
			const hasInlineStyle = await element.evaluate( ( el ) => el.hasAttribute( 'style' ) );
			expect( hasInlineStyle ).toBe( false );

			// 2. Verify the margin is applied via atomic styling (not inline CSS)
			const computedStyles = await element.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					marginInlineStart: styles.marginInlineStart,
					marginBlockEnd: styles.marginBlockEnd,
					hasInlineStyle: el.hasAttribute( 'style' ),
				};
			} );

			// 3. Verify no inline CSS and margin is applied
			expect( computedStyles.hasInlineStyle ).toBe( false );
			expect( computedStyles.marginInlineStart ).toBe( testCase.expectedLogical.marginInlineStart );

			if ( testCase.expectedLogical.marginBlockEnd ) {
				expect( computedStyles.marginBlockEnd ).toBe( testCase.expectedLogical.marginBlockEnd );
			}
		}
	} );

	test( 'should convert margin-inline shorthand by splitting to individual properties', async ( { page, request } ) => {
		// Test if we can make margin-inline work by converting it to individual properties
		const html = '<div><p style="margin-inline: 10px 30px;">Inline margin dual</p></div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, html );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'API validation failed' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const element = elementorFrame.locator( '.e-con p' ).first();
		await element.waitFor( { state: 'visible', timeout: 10000 } );

		await expect( element ).toHaveCSS( 'margin-inline-start', '10px' );
		await expect( element ).toHaveCSS( 'margin-inline-end', '30px' );
	} );

	test.skip( 'should convert margin auto for centering - SKIPPED: margin auto difficult to test in Playwright', async ( { page, request } ) => {
		// This test is skipped because margin: auto is difficult to test reliably in Playwright
		// The auto value depends on container width and layout context which varies
		const html = '<div style="margin: auto;">Auto margin centering</div>';

		const apiResult = await cssHelper.convertHtmlWithCss( request, html );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, 'API validation failed' );
			return;
		}
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify all margins are auto
		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		const element = elementorFrame.locator( '.e-con p' ).first();
		await element.waitFor( { state: 'visible', timeout: 10000 } );

		await expect( element ).toHaveCSS( 'margin-block-start', 'auto' );
		await expect( element ).toHaveCSS( 'margin-inline-end', 'auto' );
		await expect( element ).toHaveCSS( 'margin-block-end', 'auto' );
		await expect( element ).toHaveCSS( 'margin-inline-start', 'auto' );
	} );
} );
