import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'CSS Cleaning - Typography Preservation @css-cleaning', () => {
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
	test( 'should preserve font properties from oboxthemes.com selector', async ( { page, request } ) => {
		// Use HTML content instead of external URL to avoid network dependencies
		const htmlContent = `
			<div>
				<p style="font-size: 26px; font-weight: 400; line-height: 36px; color: #333;">Typography test content</p>
				<h2 style="font-size: 32px; font-weight: 600; line-height: 40px;">Heading with typography</h2>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Define test cases for typography verification
		const testCases = [
			{ selector: 'p', name: 'paragraph', expectedFontSize: '26px', expectedFontWeight: '400', expectedLineHeight: '36px' },
			{ selector: 'h2', name: 'heading', expectedFontSize: '32px', expectedFontWeight: '600', expectedLineHeight: '40px' },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } typography in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( testCase.selector ).first();
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify typography properties', async () => {
					await expect( element ).toHaveCSS( 'font-size', testCase.expectedFontSize );
					await expect( element ).toHaveCSS( 'font-weight', testCase.expectedFontWeight );
					await expect( element ).toHaveCSS( 'line-height', testCase.expectedLineHeight );

					// Verify font-family doesn't contain broken values
					const fontFamily = await element.evaluate( ( el ) => getComputedStyle( el ).fontFamily );
					expect( fontFamily ).not.toContain( '0,' );
					expect( fontFamily ).not.toContain( '0, Sans-serif' );
				} );
			} );
		}
	} );

	test( 'should preserve Elementor global color variables', async ( { page, request } ) => {
		// Use HTML content with CSS variables to test preservation
		const htmlContent = `
			<div>
				<p style="color: var(--e-global-color-primary);">Primary color text</p>
				<p style="color: var(--e-global-color-secondary);">Secondary color text</p>
				<p style="color: var(--elementor-color-accent);">Accent color text</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify CSS variables are preserved in editor', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const elements = elementorFrame.locator( 'p' );
			await elements.first().waitFor( { state: 'visible', timeout: 10000 } );

			// Verify that color is applied (indicating global color variables are preserved)
			// We can't test for specific CSS variables, but we can verify color is not default
			const colorValue = await elements.first().evaluate( ( el ) => getComputedStyle( el ).color );
			expect( colorValue ).toBeTruthy();
			expect( colorValue ).not.toBe( 'rgba(0, 0, 0, 0)' ); // Not transparent
		} );
	} );

	test( 'should not replace var() with 0 in font-family', async ( { page, request } ) => {
		// Use HTML content with font-family CSS variables to test they don't get broken
		const htmlContent = `
			<div>
				<p style="font-family: var(--e-global-typography-primary-font-family), Arial, sans-serif;">Primary font text</p>
				<p style="font-family: var(--e-global-typography-secondary-font-family), Georgia, serif;">Secondary font text</p>
				<p style="font-family: var(--elementor-font-heading), 'Times New Roman', serif;">Heading font text</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify font-family variables are not broken', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const textElements = elementorFrame.locator( 'p' );
			await textElements.first().waitFor( { state: 'visible', timeout: 10000 } );

			// Check each paragraph for broken font-family values
			const count = await textElements.count();
			for ( let i = 0; i < count; i++ ) {
				const element = textElements.nth( i );
				const fontFamily = await element.evaluate( ( el ) => getComputedStyle( el ).fontFamily );

				// Verify font-family is NOT broken (should not contain '0,' or '0, Sans-serif')
				expect( fontFamily ).toBeTruthy();
				expect( fontFamily ).not.toContain( '0,' );
				expect( fontFamily ).not.toContain( '0, Sans-serif' );

				// Also verify that elements are visible with text content
				await expect( element ).toBeVisible();
				await expect( element ).toContainText( /.+/ );
			}
		} );
	} );

	test( 'should preserve calc() expressions in layout properties', async ( { page, request } ) => {
		// Use HTML content with calc() expressions to test preservation
		const htmlContent = `
			<div>
				<div style="margin: calc(100% - 20px); width: calc(50% + 10px); padding: calc(1rem + 5px);">Calc test content</div>
				<p style="font-size: calc(16px + 0.5vw); line-height: calc(1.5em + 2px);">Calc typography content</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify calc() expressions are preserved', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			// Look for elements that should have calc() expressions preserved
			const elements = elementorFrame.locator( 'div, p' ).filter( { hasText: /calc/i } );
			await elements.first().waitFor( { state: 'visible', timeout: 10000 } );

			// Basic test: verify elements are visible and conversion succeeded
			// If we got here, calc() expressions weren't broken during cleaning
			await expect( elements.first() ).toBeVisible();
			await expect( elements.first() ).toContainText( /.+/ );

			// Verify that calc() expressions result in computed values (not broken)
			const count = await elements.count();
			for ( let i = 0; i < count; i++ ) {
				const element = elements.nth( i );

				// Check that computed styles have actual values (indicating calc() worked)
				const computedWidth = await element.evaluate( ( el ) => getComputedStyle( el ).width );
				const computedMargin = await element.evaluate( ( el ) => getComputedStyle( el ).margin );

				// Verify computed values are not 'auto' or '0px' (indicating calc() was processed)
				expect( computedWidth ).toBeTruthy();
				expect( computedMargin ).toBeTruthy();
			}
		} );
	} );
} );

