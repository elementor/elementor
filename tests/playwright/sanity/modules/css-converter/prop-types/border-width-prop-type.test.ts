import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper } from '../helper';

test.describe( 'Border Width Prop Type Integration @prop-types', () => {
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

	test( 'should convert single border-width values and verify styling', async ( { page, request } ) => {
		const testCases = [
			{ property: 'border-width', value: '1px', selector: '[data-test="border-width-1px"]', expected: '1px' },
			{ property: 'border-width', value: '2px', selector: '[data-test="border-width-2px"]', expected: '2px' },
			{ property: 'border-width', value: '5px', selector: '[data-test="border-width-5px"]', expected: '5px' },
			{ property: 'border-width', value: '0.5em', selector: '[data-test="border-width-em"]', expected: '0.5em' },
			{ property: 'border-width', value: '1rem', selector: '[data-test="border-width-rem"]', expected: '1rem' },
		];

		// Create HTML with single border-width values (need border-style for visibility)
		const htmlContent = testCases.map( testCase => 
			`<div style="border-width: ${testCase.value}; border-style: solid; border-color: #333; padding: 10px; margin: 5px;" data-test="${testCase.selector.replace(/[\[\]"]/g, '').replace('=', '-')}">${testCase.property}: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with single border-width properties...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();
		expect( apiResult.edit_url ).toBeDefined();

		console.log( `API conversion successful. Post ID: ${apiResult.post_id}` );

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		console.log( 'Editor loaded, verifying border-width properties...' );

		// Verify each border-width property in the editor
		for ( const testCase of testCases ) {
			console.log( `Testing ${testCase.property}: ${testCase.value}` );
			
			const element = page.locator( testCase.selector ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			// Check computed border-width style
			const computedBorderWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).borderWidth;
			} );

			console.log( `Expected: ${testCase.expected}, Actual: ${computedBorderWidth}` );
			expect( computedBorderWidth ).toBe( testCase.expected );
		}

		console.log( 'All single border-width properties verified successfully' );
	} );

	test( 'should convert border-width keyword values correctly', async ( { page, request } ) => {
		const keywordTestCases = [
			{ value: 'thin', expected: '1px' },
			{ value: 'medium', expected: '3px' },
			{ value: 'thick', expected: '5px' },
		];

		// Create HTML with keyword border-width values
		const htmlContent = keywordTestCases.map( testCase => 
			`<div style="border-width: ${testCase.value}; border-style: solid; border-color: #666; padding: 10px; margin: 5px;" data-test="border-width-${testCase.value}">Keyword: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with border-width keywords...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each keyword is converted to the correct pixel value
		for ( const testCase of keywordTestCases ) {
			console.log( `Testing keyword ${testCase.value} -> ${testCase.expected}` );
			
			const element = page.locator( `[data-test="border-width-${testCase.value}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedBorderWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).borderWidth;
			} );

			console.log( `Keyword ${testCase.value}: Expected ${testCase.expected}, Got ${computedBorderWidth}` );
			expect( computedBorderWidth ).toBe( testCase.expected );
		}

		console.log( 'All border-width keywords converted correctly' );
	} );

	test( 'should handle border-width shorthand with 2 values', async ( { page, request } ) => {
		const shorthandTestCases = [
			{ value: '1px 2px', expectedTop: '1px', expectedRight: '2px', expectedBottom: '1px', expectedLeft: '2px' },
			{ value: '3px 1px', expectedTop: '3px', expectedRight: '1px', expectedBottom: '3px', expectedLeft: '1px' },
		];

		// Create HTML with 2-value border-width shorthand
		const htmlContent = shorthandTestCases.map( ( testCase, index ) => 
			`<div style="border-width: ${testCase.value}; border-style: solid; border-color: #999; padding: 10px; margin: 5px;" data-test="border-width-shorthand-2-${index}">Shorthand 2: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with 2-value border-width shorthand...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each shorthand expands correctly
		for ( let i = 0; i < shorthandTestCases.length; i++ ) {
			const testCase = shorthandTestCases[i];
			console.log( `Testing 2-value shorthand: ${testCase.value}` );
			
			const element = page.locator( `[data-test="border-width-shorthand-2-${i}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			// Check individual border widths
			const borderWidths = await element.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					top: style.borderTopWidth,
					right: style.borderRightWidth,
					bottom: style.borderBottomWidth,
					left: style.borderLeftWidth,
				};
			} );

			console.log( `Shorthand ${testCase.value}:`, borderWidths );
			
			expect( borderWidths.top ).toBe( testCase.expectedTop );
			expect( borderWidths.right ).toBe( testCase.expectedRight );
			expect( borderWidths.bottom ).toBe( testCase.expectedBottom );
			expect( borderWidths.left ).toBe( testCase.expectedLeft );
		}

		console.log( 'All 2-value border-width shorthand values expanded correctly' );
	} );

	test( 'should handle border-width shorthand with 4 values', async ( { page, request } ) => {
		const shorthandTestCases = [
			{ 
				value: '1px 2px 3px 4px', 
				expectedTop: '1px', 
				expectedRight: '2px', 
				expectedBottom: '3px', 
				expectedLeft: '4px' 
			},
			{ 
				value: '2px 1px 4px 3px', 
				expectedTop: '2px', 
				expectedRight: '1px', 
				expectedBottom: '4px', 
				expectedLeft: '3px' 
			},
		];

		// Create HTML with 4-value border-width shorthand
		const htmlContent = shorthandTestCases.map( ( testCase, index ) => 
			`<div style="border-width: ${testCase.value}; border-style: solid; border-color: #ccc; padding: 10px; margin: 5px;" data-test="border-width-shorthand-4-${index}">Shorthand 4: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with 4-value border-width shorthand...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each 4-value shorthand expands correctly
		for ( let i = 0; i < shorthandTestCases.length; i++ ) {
			const testCase = shorthandTestCases[i];
			console.log( `Testing 4-value shorthand: ${testCase.value}` );
			
			const element = page.locator( `[data-test="border-width-shorthand-4-${i}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			// Check individual border widths
			const borderWidths = await element.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					top: style.borderTopWidth,
					right: style.borderRightWidth,
					bottom: style.borderBottomWidth,
					left: style.borderLeftWidth,
				};
			} );

			console.log( `Shorthand ${testCase.value}:`, borderWidths );
			
			expect( borderWidths.top ).toBe( testCase.expectedTop );
			expect( borderWidths.right ).toBe( testCase.expectedRight );
			expect( borderWidths.bottom ).toBe( testCase.expectedBottom );
			expect( borderWidths.left ).toBe( testCase.expectedLeft );
		}

		console.log( 'All 4-value border-width shorthand values expanded correctly' );
	} );

	test( 'should handle individual border-width properties', async ( { page, request } ) => {
		const individualTestCases = [
			{ property: 'border-top-width', value: '3px', checkProperty: 'borderTopWidth' },
			{ property: 'border-right-width', value: '2px', checkProperty: 'borderRightWidth' },
			{ property: 'border-bottom-width', value: '4px', checkProperty: 'borderBottomWidth' },
			{ property: 'border-left-width', value: '1px', checkProperty: 'borderLeftWidth' },
		];

		// Create HTML with individual border-width properties
		const htmlContent = individualTestCases.map( testCase => 
			`<div style="${testCase.property}: ${testCase.value}; border-style: solid; border-color: #aaa; padding: 10px; margin: 5px;" data-test="${testCase.property.replace('-', '-')}">${testCase.property}: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with individual border-width properties...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify each individual property
		for ( const testCase of individualTestCases ) {
			console.log( `Testing ${testCase.property}: ${testCase.value}` );
			
			const element = page.locator( `[data-test="${testCase.property.replace('-', '-')}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedValue = await element.evaluate( ( el, prop ) => {
				return window.getComputedStyle( el )[prop];
			}, testCase.checkProperty );

			console.log( `${testCase.property}: Expected ${testCase.value}, Got ${computedValue}` );
			expect( computedValue ).toBe( testCase.value );
		}

		console.log( 'All individual border-width properties verified correctly' );
	} );

	test( 'should handle mixed units in border-width shorthand', async ( { page, request } ) => {
		const mixedUnitTestCases = [
			{ 
				value: '1px 2em 3% 4rem',
				expectedTop: '1px',
				expectedRight: '2em', 
				expectedBottom: '3%',
				expectedLeft: '4rem'
			},
		];

		// Create HTML with mixed units
		const htmlContent = mixedUnitTestCases.map( ( testCase, index ) => 
			`<div style="border-width: ${testCase.value}; border-style: solid; border-color: #888; padding: 10px; margin: 5px;" data-test="border-width-mixed-${index}">Mixed units: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with mixed unit border-width...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify mixed units are preserved
		for ( let i = 0; i < mixedUnitTestCases.length; i++ ) {
			const testCase = mixedUnitTestCases[i];
			console.log( `Testing mixed units: ${testCase.value}` );
			
			const element = page.locator( `[data-test="border-width-mixed-${i}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			// Check individual border widths preserve their units
			const borderWidths = await element.evaluate( ( el ) => {
				const style = window.getComputedStyle( el );
				return {
					top: style.borderTopWidth,
					right: style.borderRightWidth,
					bottom: style.borderBottomWidth,
					left: style.borderLeftWidth,
				};
			} );

			console.log( `Mixed units ${testCase.value}:`, borderWidths );
			
			expect( borderWidths.top ).toBe( testCase.expectedTop );
			expect( borderWidths.right ).toBe( testCase.expectedRight );
			expect( borderWidths.bottom ).toBe( testCase.expectedBottom );
			expect( borderWidths.left ).toBe( testCase.expectedLeft );
		}

		console.log( 'All mixed unit border-width values preserved correctly' );
	} );

	test( 'should verify atomic widget structure in API response', async ( { request } ) => {
		const htmlContent = `<div style="border-width: 2px; border-style: solid;">Border width test for API structure</div>`;

		console.log( 'Testing API response structure for border-width...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		expect( apiResult.global_classes_created ).toBeGreaterThan( 0 );

		// Verify the API processed border-width correctly
		console.log( `Widgets created: ${apiResult.widgets_created}` );
		console.log( `Global classes created: ${apiResult.global_classes_created}` );
		
		// The API should have successfully processed the border-width property
		expect( apiResult.warnings ).toEqual( [] );
		expect( apiResult.errors ).toEqual( [] );

		console.log( 'Border-width API structure verification completed' );
	} );

	test( 'should handle zero border-width values', async ( { page, request } ) => {
		const zeroTestCases = [
			{ value: '0', expected: '0px' },
			{ value: '0px', expected: '0px' },
			{ value: '0em', expected: '0em' },
		];

		// Create HTML with zero border-width values
		const htmlContent = zeroTestCases.map( testCase => 
			`<div style="border-width: ${testCase.value}; border-style: solid; border-color: #777; padding: 10px; margin: 5px;" data-test="border-width-zero-${testCase.value.replace('px', 'px').replace('em', 'em')}">Zero: ${testCase.value}</div>`
		).join( '\n' );

		console.log( 'Converting HTML with zero border-width values...' );
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent );
		
		expect( apiResult.success ).toBe( true );
		expect( apiResult.post_id ).toBeDefined();

		// Navigate to the editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Verify zero values are handled correctly
		for ( const testCase of zeroTestCases ) {
			console.log( `Testing zero value ${testCase.value} -> ${testCase.expected}` );
			
			const testId = `border-width-zero-${testCase.value.replace('px', 'px').replace('em', 'em')}`;
			const element = page.locator( `[data-test="${testId}"]` ).first();
			await expect( element ).toBeVisible( { timeout: 10000 } );
			
			const computedBorderWidth = await element.evaluate( ( el ) => {
				return window.getComputedStyle( el ).borderWidth;
			} );

			console.log( `Zero ${testCase.value}: Expected ${testCase.expected}, Got ${computedBorderWidth}` );
			expect( computedBorderWidth ).toBe( testCase.expected );
		}

		console.log( 'All zero border-width values handled correctly' );
	} );
} );
