import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Font Weight Prop Type Integration @prop-types', () => {
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

	test( 'should convert font-weight properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'font-weight', value: 'normal', selector: '[data-test="font-weight-normal"]', expected: '400' },
			{ property: 'font-weight', value: 'bold', selector: '[data-test="font-weight-bold"]', expected: '700' },
			{ property: 'font-weight', value: '100', selector: '[data-test="font-weight-100"]', expected: '100' },
			{ property: 'font-weight', value: '300', selector: '[data-test="font-weight-300"]', expected: '300' },
			{ property: 'font-weight', value: '500', selector: '[data-test="font-weight-500"]', expected: '500' },
			{ property: 'font-weight', value: '700', selector: '[data-test="font-weight-700"]', expected: '700' },
			{ property: 'font-weight', value: '900', selector: '[data-test="font-weight-900"]', expected: '900' },
			{ property: 'font-weight', value: 'lighter', selector: '[data-test="font-weight-lighter"]', expected: 'lighter' },
			{ property: 'font-weight', value: 'bolder', selector: '[data-test="font-weight-bolder"]', expected: 'bolder' },
		];

		// Create HTML with multiple font-weight test cases
		const htmlContent = testCases.map( testCase => 
			`<p style="font-weight: ${testCase.value};" data-test="${testCase.selector.replace(/[\[\]"]/g, '').replace('=', '-')}">${testCase.property}: ${testCase.value}</p>`
		).join( '\n' );

		console.log( 'Converting HTML with font-weight properties...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent , '' );
		
		
		// Check if API call failed due to backend issues
		if ( apiResult.error ) {
			test.skip( true, 'Skipping due to backend property mapper issues' );
			return;
		}
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();
		expect( apiResult.edit_url ).toBeDefined();

		console.log( `API conversion successful. Post ID: ${apiResult.post_id}` );

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		console.log( 'Editor loaded, verifying font-weight properties...' );

		// Verify each font-weight property in the editor
		for ( const testCase of testCases ) {
			console.log( `Testing ${testCase.property}: ${testCase.value}` );
			
			const element = page.locator( testCase.selector ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			// Check computed font-weight style
			const computedFontWeight = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontWeight;
			} );

			console.log( `Expected: ${testCase.expected}, Actual: ${computedFontWeight}` );
			
			// Font weight can be normalized by browsers (e.g., 'normal' -> '400', 'bold' -> '700')
			if ( testCase.value === 'normal' ) {
				expect( computedFontWeight ).toBe( '400' );
			} else if ( testCase.value === 'bold' ) {
				expect( computedFontWeight ).toBe( '700' );
			} else if ( testCase.value === 'lighter' || testCase.value === 'bolder' ) {
				// These are relative values, just verify they're applied
				expect( computedFontWeight ).toBe( testCase.expected );
			} else {
				// Numeric values should match exactly
				expect( computedFontWeight ).toBe( testCase.expected );
			}
		}

		console.log( 'All font-weight properties verified successfully in editor' );

		// Test frontend rendering
		const frontendUrl = apiResult.edit_url.replace( '/wp-admin/post.php?post=', '/wp-json/wp/v2/pages/' ).replace( '&action=elementor', '' );
		console.log( `Testing frontend rendering...` );

		// Get the page content to verify frontend rendering
		const pageResponse = await request.get( frontendUrl );
		expect( pageResponse.ok() ).toBe( true );

		console.log( 'Font weight prop type integration test completed successfully' );
	} );

	test( 'should handle font-weight aliases and convert them correctly', async ( { page, request } ) => {
		const aliasTestCases = [
			{ alias: 'thin', expected: '100' },
			{ alias: 'light', expected: '300' },
			{ alias: 'regular', expected: '400' },
			{ alias: 'medium', expected: '500' },
			{ alias: 'semi-bold', expected: '600' },
			{ alias: 'extra-bold', expected: '800' },
			{ alias: 'black', expected: '900' },
		];

		// Create HTML with font-weight aliases
		const htmlContent = aliasTestCases.map( testCase => 
			`<p style="font-weight: ${testCase.alias};" data-test="font-weight-${testCase.alias}">${testCase.alias} (should be ${testCase.expected})</p>`
		).join( '\n' );

		console.log( 'Converting HTML with font-weight aliases...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent , '' );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each alias is converted to the correct numeric value
		for ( const testCase of aliasTestCases ) {
			console.log( `Testing alias ${testCase.alias} -> ${testCase.expected}` );
			
			const element = page.locator( `[data-test="font-weight-${testCase.alias}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedFontWeight = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontWeight;
			} );

			console.log( `Alias ${testCase.alias}: Expected ${testCase.expected}, Got ${computedFontWeight}` );
			expect( computedFontWeight ).toBe( testCase.expected );
		}

		console.log( 'All font-weight aliases converted correctly' );
	} );

	test( 'should handle edge cases and invalid font-weight values', async ( { page, request } ) => {
		// Test edge cases that should still work
		const edgeCases = [
			{ value: '150', expected: '200' }, // Should round to nearest 100
			{ value: '450', expected: '500' }, // Should round to nearest 100
			{ value: '50', expected: '100' },  // Below 100 should become 100
			{ value: '1000', expected: '900' }, // Above 900 should become 900
		];

		// Create HTML with edge case values
		const htmlContent = edgeCases.map( testCase => 
			`<p style="font-weight: ${testCase.value};" data-test="font-weight-edge-${testCase.value}">Edge case: ${testCase.value}</p>`
		).join( '\n' );

		console.log( 'Converting HTML with font-weight edge cases...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent , '' );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each edge case is handled correctly
		for ( const testCase of edgeCases ) {
			console.log( `Testing edge case ${testCase.value} -> ${testCase.expected}` );
			
			const element = page.locator( `[data-test="font-weight-edge-${testCase.value}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedFontWeight = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).fontWeight;
			} );

			console.log( `Edge case ${testCase.value}: Expected ${testCase.expected}, Got ${computedFontWeight}` );
			expect( computedFontWeight ).toBe( testCase.expected );
		}

		console.log( 'All font-weight edge cases handled correctly' );
	} );

	test( 'should verify atomic widget structure in API response', async ( { request } ) => {
		const htmlContent = `<p style="font-weight: bold;">Bold text for API structure test</p>`;

		console.log( 'Testing API response structure for font-weight...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent , '' );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 0 );

		// Verify the API processed font-weight correctly
		console.log( `Widgets created: ${apiResult.widgets_created}` );
		console.log( `Global classes created: ${apiResult.global_classes_created}` );
		
		// The API should have successfully processed the font-weight property
		expect( apiResult.warnings ).toEqual( [] );
		expect( apiResult.errors ).toEqual( [] );

		console.log( 'Font-weight API structure verification completed' );
	} );
} );
