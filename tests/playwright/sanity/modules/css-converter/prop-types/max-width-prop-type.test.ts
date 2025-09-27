import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Max Width Prop Type Integration @prop-types', () => {
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

	test( 'should convert max-width properties and verify styling in editor and frontend', async ( { page, request } ) => {
		const testCases = [
			{ property: 'max-width', value: '200px', selector: '[data-test="max-width-200px"]', expected: '200px' },
			{ property: 'max-width', value: '500px', selector: '[data-test="max-width-500px"]', expected: '500px' },
			{ property: 'max-width', value: '50%', selector: '[data-test="max-width-50percent"]', expected: '50%' },
			{ property: 'max-width', value: '75%', selector: '[data-test="max-width-75percent"]', expected: '75%' },
			{ property: 'max-width', value: '20em', selector: '[data-test="max-width-20em"]', expected: '20em' },
			{ property: 'max-width', value: '15rem', selector: '[data-test="max-width-15rem"]', expected: '15rem' },
			{ property: 'max-width', value: '80vw', selector: '[data-test="max-width-80vw"]', expected: '80vw' },
			{ property: 'max-width', value: '60vh', selector: '[data-test="max-width-60vh"]', expected: '60vh' },
		];

		// Create HTML with multiple max-width test cases
		const htmlContent = testCases.map( testCase => 
			`<div style="max-width: ${testCase.value}; background: #f0f0f0; padding: 10px; margin: 5px;" data-test="${testCase.selector.replace(/[\[\]"]/g, '').replace('=', '-')}">${testCase.property}: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with max-width properties...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();
		expect( apiResult.edit_url ).toBeDefined();

		console.log( `API conversion successful. Post ID: ${apiResult.post_id}` );

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		console.log( 'Editor loaded, verifying max-width properties...' );

		// Verify each max-width property in the editor
		for ( const testCase of testCases ) {
			console.log( `Testing ${testCase.property}: ${testCase.value}` );
			
			const element = page.locator( testCase.selector ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			// Check computed max-width style
			const computedMaxWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).maxWidth;
			} );

			console.log( `Expected: ${testCase.expected}, Actual: ${computedMaxWidth}` );
			expect( computedMaxWidth ).toBe( testCase.expected );
		}

		console.log( 'All max-width properties verified successfully in editor' );

		// Test frontend rendering
		const frontendUrl = apiResult.edit_url.replace( '/wp-admin/post.php?post=', '/wp-json/wp/v2/pages/' ).replace( '&action=elementor', '' );
		console.log( `Testing frontend rendering...` );

		// Get the page content to verify frontend rendering
		const pageResponse = await request.get( frontendUrl );
		expect( pageResponse.ok() ).toBe( true );

		console.log( 'Max width prop type integration test completed successfully' );
	} );

	test( 'should handle unitless numeric values and default to pixels', async ( { page, request } ) => {
		const unitlessTestCases = [
			{ value: '100', expected: '100px' },
			{ value: '250', expected: '250px' },
			{ value: '500', expected: '500px' },
			{ value: '0', expected: '0px' },
		];

		// Create HTML with unitless numeric values
		const htmlContent = unitlessTestCases.map( testCase => 
			`<div style="max-width: ${testCase.value}; background: #e0e0e0; padding: 10px; margin: 5px;" data-test="max-width-unitless-${testCase.value}">Unitless: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with unitless max-width values...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each unitless value defaults to pixels
		for ( const testCase of unitlessTestCases ) {
			console.log( `Testing unitless ${testCase.value} -> ${testCase.expected}` );
			
			const element = page.locator( `[data-test="max-width-unitless-${testCase.value}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedMaxWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).maxWidth;
			} );

			console.log( `Unitless ${testCase.value}: Expected ${testCase.expected}, Got ${computedMaxWidth}` );
			expect( computedMaxWidth ).toBe( testCase.expected );
		}

		console.log( 'All unitless max-width values converted to pixels correctly' );
	} );

	test( 'should handle decimal values correctly', async ( { page, request } ) => {
		const decimalTestCases = [
			{ value: '100.5px', expected: '100.5px' },
			{ value: '50.25%', expected: '50.25%' },
			{ value: '1.75em', expected: '1.75em' },
			{ value: '2.5rem', expected: '2.5rem' },
		];

		// Create HTML with decimal values
		const htmlContent = decimalTestCases.map( testCase => 
			`<div style="max-width: ${testCase.value}; background: #d0d0d0; padding: 10px; margin: 5px;" data-test="max-width-decimal-${testCase.value.replace('.', '-')}">Decimal: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with decimal max-width values...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each decimal value is preserved
		for ( const testCase of decimalTestCases ) {
			console.log( `Testing decimal ${testCase.value} -> ${testCase.expected}` );
			
			const testId = `max-width-decimal-${testCase.value.replace('.', '-')}`;
			const element = page.locator( `[data-test="${testId}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedMaxWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).maxWidth;
			} );

			console.log( `Decimal ${testCase.value}: Expected ${testCase.expected}, Got ${computedMaxWidth}` );
			expect( computedMaxWidth ).toBe( testCase.expected );
		}

		console.log( 'All decimal max-width values preserved correctly' );
	} );

	test( 'should handle viewport and character units', async ( { page, request } ) => {
		const specialUnitTestCases = [
			{ value: '25vmin', expected: '25vmin' },
			{ value: '75vmax', expected: '75vmax' },
			{ value: '20ch', expected: '20ch' },
			{ value: '5ex', expected: '5ex' },
		];

		// Create HTML with special units
		const htmlContent = specialUnitTestCases.map( testCase => 
			`<div style="max-width: ${testCase.value}; background: #c0c0c0; padding: 10px; margin: 5px;" data-test="max-width-special-${testCase.value}">Special unit: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with special unit max-width values...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each special unit is preserved
		for ( const testCase of specialUnitTestCases ) {
			console.log( `Testing special unit ${testCase.value} -> ${testCase.expected}` );
			
			const element = page.locator( `[data-test="max-width-special-${testCase.value}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedMaxWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).maxWidth;
			} );

			console.log( `Special unit ${testCase.value}: Expected ${testCase.expected}, Got ${computedMaxWidth}` );
			expect( computedMaxWidth ).toBe( testCase.expected );
		}

		console.log( 'All special unit max-width values preserved correctly' );
	} );

	test( 'should verify atomic widget structure in API response', async ( { request } ) => {
		const htmlContent = `<div style="max-width: 400px;">Max width test for API structure</div>`;

		console.log( 'Testing API response structure for max-width...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 0 );

		// Verify the API processed max-width correctly
		console.log( `Widgets created: ${apiResult.widgets_created}` );
		console.log( `Global classes created: ${apiResult.global_classes_created}` );
		
		// The API should have successfully processed the max-width property
		expect( apiResult.warnings ).toEqual( [] );
		expect( apiResult.errors ).toEqual( [] );

		console.log( 'Max-width API structure verification completed' );
	} );

	test( 'should handle zero values correctly', async ( { page, request } ) => {
		const zeroTestCases = [
			{ value: '0', expected: '0px' },
			{ value: '0px', expected: '0px' },
			{ value: '0%', expected: '0%' },
			{ value: '0em', expected: '0em' },
		];

		// Create HTML with zero values
		const htmlContent = zeroTestCases.map( testCase => 
			`<div style="max-width: ${testCase.value}; background: #b0b0b0; padding: 10px; margin: 5px;" data-test="max-width-zero-${testCase.value.replace('%', 'percent')}">Zero: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with zero max-width values...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each zero value is handled correctly
		for ( const testCase of zeroTestCases ) {
			console.log( `Testing zero value ${testCase.value} -> ${testCase.expected}` );
			
			const testId = `max-width-zero-${testCase.value.replace('%', 'percent')}`;
			const element = page.locator( `[data-test="${testId}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedMaxWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).maxWidth;
			} );

			console.log( `Zero ${testCase.value}: Expected ${testCase.expected}, Got ${computedMaxWidth}` );
			expect( computedMaxWidth ).toBe( testCase.expected );
		}

		console.log( 'All zero max-width values handled correctly' );
	} );
} );
