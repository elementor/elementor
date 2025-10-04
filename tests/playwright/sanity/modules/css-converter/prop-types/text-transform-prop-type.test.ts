import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Text Transform Prop Type Integration @prop-types', () => {
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

	test( 'should convert text-transform properties and verify styles - EXPECTED TO FAIL', async ( { page, request } ) => {
		console.log( '🔍 DEBUG: Starting text-transform prop type test' );
		
		const combinedCssContent = `
			<div>
				<h1 style="text-transform: uppercase;" data-test="text-transform-uppercase">Uppercase Text</h1>
				<h2 style="text-transform: lowercase;" data-test="text-transform-lowercase">Lowercase Text</h2>
				<p style="text-transform: capitalize;" data-test="text-transform-capitalize">capitalize text</p>
				<p style="text-transform: none;" data-test="text-transform-none">None Transform</p>
			</div>
		`;

		console.log( '🔍 DEBUG: Converting HTML content with text-transform properties' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		console.log( '🔍 DEBUG: API Result:', {
			success: apiResult.success,
			post_id: apiResult.post_id,
			widgets_created: apiResult.widgets_created,
			global_classes_created: apiResult.global_classes_created
		} );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			console.log( '🔍 DEBUG: Skipping test due to validation failure:', validation.skipReason );
			test.skip( true, validation.skipReason );
			return;
		}
		
		const postId = apiResult.post_id;
		const editUrl = apiResult.edit_url;
		expect( postId ).toBeDefined();
		expect( editUrl ).toBeDefined();

		console.log( '🔍 DEBUG: Navigating to editor URL:', editUrl );
		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		console.log( '🔍 DEBUG: Editor loaded, starting style verification' );

		// Define test cases - THESE ARE EXPECTED TO FAIL
		const testCases = [
			{ 
				index: 0, 
				name: 'text-transform: uppercase on h1', 
				property: 'text-transform', 
				expected: 'uppercase',
				selector: '.e-heading-base'
			},
			{ 
				index: 1, 
				name: 'text-transform: lowercase on h2', 
				property: 'text-transform', 
				expected: 'lowercase',
				selector: '.e-heading-base'
			},
			{ 
				index: 0, 
				name: 'text-transform: capitalize on p', 
				property: 'text-transform', 
				expected: 'capitalize',
				selector: '.e-paragraph-base'
			},
			{ 
				index: 1, 
				name: 'text-transform: none on p', 
				property: 'text-transform', 
				expected: 'none',
				selector: '.e-paragraph-base'
			},
		];

		// Editor verification - EXPECTED TO FAIL
		for ( const testCase of testCases ) {
			await test.step( `🚨 EXPECTED FAILURE: Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				console.log( `🔍 DEBUG: Testing ${ testCase.name } with selector ${ testCase.selector }` );
				
				const elements = elementorFrame.locator( testCase.selector );
				const element = elements.nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				// Get actual computed style for debugging
				const actualValue = await element.evaluate( ( el ) => {
					return window.getComputedStyle( el ).textTransform;
				} );

				console.log( `🔍 DEBUG: ${ testCase.name } - Expected: ${ testCase.expected }, Actual: ${ actualValue }` );

				// This assertion is EXPECTED TO FAIL
				try {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
					console.log( `✅ UNEXPECTED SUCCESS: ${ testCase.name } passed!` );
				} catch ( error ) {
					console.log( `❌ EXPECTED FAILURE: ${ testCase.name } failed as expected - ${ error.message }` );
					// Re-throw to make test fail as expected
					throw error;
				}
			} );
		}

		await test.step( '🚨 EXPECTED FAILURE: Publish page and verify text-transform styles on frontend', async () => {
			console.log( '🔍 DEBUG: Publishing page and testing frontend' );
			
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			console.log( '🔍 DEBUG: Navigating to frontend page ID:', pageId );
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification - EXPECTED TO FAIL
			for ( const testCase of testCases ) {
				await test.step( `🚨 EXPECTED FAILURE: Verify ${ testCase.name } on frontend`, async () => {
					const frontendElements = page.locator( testCase.selector );
					const frontendElement = frontendElements.nth( testCase.index );

					// Get actual computed style for debugging
					const actualValue = await frontendElement.evaluate( ( el ) => {
						return window.getComputedStyle( el ).textTransform;
					} );

					console.log( `🔍 DEBUG: Frontend ${ testCase.name } - Expected: ${ testCase.expected }, Actual: ${ actualValue }` );

					// This assertion is EXPECTED TO FAIL
					try {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
						console.log( `✅ UNEXPECTED SUCCESS: Frontend ${ testCase.name } passed!` );
					} catch ( error ) {
						console.log( `❌ EXPECTED FAILURE: Frontend ${ testCase.name } failed as expected - ${ error.message }` );
						// Re-throw to make test fail as expected
						throw error;
					}
				} );
			}
		} );
	} );
} );
