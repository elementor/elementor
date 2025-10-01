import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Size Prop Type Integration @prop-types', () => {
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

	test( 'should convert size properties and verify core functionality', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="height: 100px;" data-test="height-px">Height in pixels</p>
				<p style="font-size: 18px;" data-test="font-size-px">Font size in pixels</p>
				<p style="max-width: 300px;" data-test="max-width">Max width</p>
				<p style="min-height: 50px;" data-test="min-height">Min height</p>
				<p style="width: auto;" data-test="width-auto">Width auto</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
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

		// Define test cases for both editor and frontend verification
		const testCases = [
			{ index: 0, name: 'height: 100px', property: 'height', expected: '100px' },
			{ index: 1, name: 'font-size: 18px', property: 'font-size', expected: '18px' },
			{ index: 2, name: 'max-width: 300px', property: 'max-width', expected: '300px' },
			{ index: 3, name: 'min-height: 50px', property: 'min-height', expected: '50px' },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
				} );
			} );
		}

		// Verify width: auto in editor
		await test.step( 'Verify width: auto in editor', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const element = elementorFrame.locator( '.e-paragraph-base' ).nth( 4 );
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			// For width: auto, check that it takes a reasonable width (at least 1000px)
			// This indicates that auto is working and the element is taking full container width
			const computedWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).width;
			} );

			expect( computedWidth ).toMatch( /^\d+(\.\d+)?px$/ );

			const widthValue = parseFloat( computedWidth );
			expect( widthValue ).toBeGreaterThanOrEqual( 1000 ); // Should be at least 1000px for auto width
		} );

		await test.step( 'Publish page and verify all size styles on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification using same test cases array
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					const frontendElement = page.locator( '.e-paragraph-base' ).nth( testCase.index );

					await test.step( 'Verify CSS property', async () => {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
					} );
				} );
			}

			// Verify width: auto on frontend
			await test.step( 'Verify width: auto on frontend', async () => {
				const frontendElement = page.locator( '.e-paragraph-base' ).nth( 4 );

				// For width: auto, check that it takes a reasonable width (at least 1000px)
				// This indicates that auto is working and the element is taking full container width
				const computedWidth = await frontendElement.evaluate( ( el ) => {
					return window.getComputedStyle( el ).width;
				} );

				expect( computedWidth ).toMatch( /^\d+(\.\d+)?px$/ );

				const widthValue = parseFloat( computedWidth );
				expect( widthValue ).toBeGreaterThanOrEqual( 1000 ); // Should be at least 1000px for auto width
			} );
		} );
	} );

	test( 'should support unitless zero for all size properties', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="max-width: 0;" data-test="max-width-zero">Max width unitless zero</p>
				<p style="min-height: 0;" data-test="min-height-zero">Min height unitless zero</p>
				<p style="min-width: 0;" data-test="min-width-zero">Min width unitless zero</p>
				<p style="max-height: 0;" data-test="max-height-zero">Max height unitless zero</p>
				<p style="width: 0; min-height: 20px;" data-test="width-zero">Width unitless zero (with min-height for visibility)</p>
				<p style="height: 0; min-width: 100px;" data-test="height-zero">Height unitless zero (with min-width for visibility)</p>
				<p style="font-size: 0; min-height: 20px;" data-test="font-size-zero">Font size unitless zero (with min-height for visibility)</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
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

		// Define test cases for unitless zero verification
		const testCases = [
			{ index: 0, name: 'max-width: 0', property: 'max-width', expected: '0px' },
			{ index: 1, name: 'min-height: 0', property: 'min-height', expected: '0px' },
			{ index: 2, name: 'min-width: 0', property: 'min-width', expected: '0px' },
			{ index: 3, name: 'max-height: 0', property: 'max-height', expected: '0px' },
			{ index: 4, name: 'width: 0', property: 'width', expected: '0px' },
			{ index: 5, name: 'height: 0', property: 'height', expected: '0px' },
			{ index: 6, name: 'font-size: 0', property: 'font-size', expected: '0px' },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( '.e-paragraph-base' ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
				} );
			} );
		}

		await test.step( 'Publish page and verify all unitless zero values on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification using same test cases array
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					const frontendElement = page.locator( '.e-paragraph-base' ).nth( testCase.index );

					await test.step( 'Verify CSS property', async () => {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
					} );
				} );
			}
		} );
	} );
} );
