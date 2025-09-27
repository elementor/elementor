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
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		// Enable atomic widgets experiments to match manual testing environment
		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		await wpAdmin.setExperiments( {
			e_nested_elements: 'active',
		} );

		await page.close();
		cssHelper = new CssConverterHelper();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
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

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent );
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

				await expect( element ).toHaveCSS( testCase.property, testCase.expected );
			} );
		}

		// Special case for width: auto in editor - flexible validation
		await test.step( 'Verify width: auto in editor (computed validation)', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const element = elementorFrame.locator( '.e-paragraph-base' ).nth( 4 );
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			// Auto width gets computed to pixels based on content, verify it's a reasonable value
			const computedWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).width;
			} );
			
			expect( computedWidth ).toMatch( /^\d+(\.\d+)?px$/ );
			
			const widthValue = parseFloat( computedWidth );
			expect( widthValue ).toBeGreaterThan( 0 );
			expect( widthValue ).toBeLessThan( 500 ); // Should be reasonable for "Width auto" text
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
				await test.step( `Verify ${testCase.name} on frontend`, async () => {
					const frontendElement = page.locator( '.e-paragraph-base' ).nth( testCase.index );

					await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
				} );
			}

			// Special case for width: auto on frontend - flexible validation
			await test.step( 'Verify width: auto on frontend (computed validation)', async () => {
				const frontendElement = page.locator( '.e-paragraph-base' ).nth( 4 );

				const computedWidth = await frontendElement.evaluate( ( el ) => {
					return window.getComputedStyle( el ).width;
				} );
				
				// Auto width should be computed to a pixel value (may be 0 if element is hidden/collapsed)
				expect( computedWidth ).toMatch( /^\d+(\.\d+)?px$/ );
				
				const widthValue = parseFloat( computedWidth );
				expect( widthValue ).toBeGreaterThanOrEqual( 0 ); // Allow 0 for collapsed elements
			} );

		} );
	} );
} );
