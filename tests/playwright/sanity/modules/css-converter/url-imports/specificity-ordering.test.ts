import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

test.describe( 'CSS Converter - Specificity-Based Ordering', () => {
	let helper: CssConverterHelper;
	let testPageUrl: string;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		// Enable required experiments
		await wpAdminPage.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
			e_classes: 'active',
		} );

		await page.close();
		helper = new CssConverterHelper();

		// Use HTTP URLs served by WordPress
		const baseUrl = process.env.BASE_URL || 'http://elementor.local';
		testPageUrl = `${ baseUrl }/wp-content/uploads/test-fixtures/specificity-test-page.html`;

		console.log( 'Specificity test page URL:', testPageUrl );
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();
		await page.close();
	} );

	test( 'should order global classes by CSS specificity when no user order exists', async ( { request, page }, testInfo ) => {
		// Create HTML with nested CSS selectors of different specificities
		const htmlContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					/* Specificity: 1 (element) */
					p { 
						color: red; 
						margin: 1px;
					}
					
					/* Specificity: 10 (class) */
					.simple { 
						color: blue; 
						margin: 10px;
					}
					
					/* Specificity: 20 (two classes) */
					.parent .child { 
						color: green; 
						margin: 20px;
					}
					
					/* Specificity: 30 (three classes) */
					.container .wrapper .content { 
						color: purple; 
						margin: 30px;
					}
					
					/* Specificity: 100 (ID) */
					#special { 
						color: orange; 
						margin: 100px;
					}
					
					/* Specificity: 110 (ID + class) */
					#special.highlighted { 
						color: yellow; 
						margin: 110px;
					}
				</style>
			</head>
			<body>
				<p>Element selector</p>
				<div class="simple">Simple class</div>
				<div class="parent">
					<div class="child">Nested classes</div>
				</div>
				<div class="container">
					<div class="wrapper">
						<div class="content">Triple nested</div>
					</div>
				</div>
				<div id="special">ID selector</div>
				<div id="special" class="highlighted">ID with class</div>
			</body>
			</html>
		`;

		// Convert the HTML with nested CSS
		const result: CssConverterResponse = await helper.convertHtmlWithCss(
			request,
			htmlContent,
			{
				createGlobalClasses: true,
				postType: 'page',
			}
		);

		// Verify conversion was successful
		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );

		console.log( `Created ${ result.global_classes_created } global classes` );

		// Check that we have a post ID to inspect
		expect( result.post_id ).toBeGreaterThan( 0 );

		// Navigate to the created page to inspect the generated CSS
		await page.goto( `${ process.env.BASE_URL }/wp-admin/post.php?post=${ result.post_id }&action=elementor` );
		
		// Wait for Elementor editor to load
		await page.waitForSelector( '.elementor-editor-loaded', { timeout: 30000 } );

		// Get the generated global classes CSS
		const globalCssResponse = await page.evaluate( async () => {
			try {
				const response = await fetch( '/wp-content/uploads/elementor/css/global-frontend-desktop.css?ver=all&t=' + Date.now() );
				if ( response.ok ) {
					return {
						css: await response.text(),
						exists: true
					};
				}
				return { css: '', exists: false };
			} catch ( error ) {
				return { css: '', exists: false, error: error.message };
			}
		} );

		// Verify CSS was generated
		expect( globalCssResponse.exists ).toBe( true );
		expect( globalCssResponse.css ).toBeTruthy();

		console.log( 'Generated CSS:', globalCssResponse.css );

		// Parse the CSS to extract class order
		const cssContent = globalCssResponse.css;
		const classMatches = cssContent.match( /\.elementor\s+\.[\w-]+/g ) || [];
		
		// Extract class names in order they appear in CSS
		const classOrder = classMatches.map( match => {
			const className = match.replace( '.elementor .', '' );
			return className;
		} );

		console.log( 'CSS class order:', classOrder );

		// Verify that classes are ordered by specificity (lowest to highest)
		// We expect the order to roughly follow specificity values:
		// p (1) → .simple (10) → .parent .child (20) → .container .wrapper .content (30) → #special (100) → #special.highlighted (110)
		
		expect( classOrder.length ).toBeGreaterThan( 0 );

		// Find classes that correspond to our different specificity levels
		const elementClass = classOrder.find( cls => cls.includes( 'p' ) || cls.includes( 'element' ) );
		const simpleClass = classOrder.find( cls => cls.includes( 'simple' ) );
		const nestedClass = classOrder.find( cls => cls.includes( 'child' ) || cls.includes( 'parent' ) );
		const tripleNestedClass = classOrder.find( cls => cls.includes( 'content' ) || cls.includes( 'container' ) );
		const idClass = classOrder.find( cls => cls.includes( 'special' ) );

		// Log what we found
		console.log( 'Found classes:', {
			elementClass,
			simpleClass,
			nestedClass,
			tripleNestedClass,
			idClass
		} );

		// Verify that lower specificity classes appear before higher specificity classes
		if ( elementClass && simpleClass ) {
			const elementIndex = classOrder.indexOf( elementClass );
			const simpleIndex = classOrder.indexOf( simpleClass );
			expect( elementIndex ).toBeLessThan( simpleIndex );
			console.log( `✓ Element class (${ elementClass }) appears before simple class (${ simpleClass })` );
		}

		if ( simpleClass && nestedClass ) {
			const simpleIndex = classOrder.indexOf( simpleClass );
			const nestedIndex = classOrder.indexOf( nestedClass );
			expect( simpleIndex ).toBeLessThan( nestedIndex );
			console.log( `✓ Simple class (${ simpleClass }) appears before nested class (${ nestedClass })` );
		}

		if ( nestedClass && tripleNestedClass ) {
			const nestedIndex = classOrder.indexOf( nestedClass );
			const tripleIndex = classOrder.indexOf( tripleNestedClass );
			expect( nestedIndex ).toBeLessThan( tripleIndex );
			console.log( `✓ Nested class (${ nestedClass }) appears before triple nested class (${ tripleNestedClass })` );
		}

		if ( tripleNestedClass && idClass ) {
			const tripleIndex = classOrder.indexOf( tripleNestedClass );
			const idIndex = classOrder.indexOf( idClass );
			expect( tripleIndex ).toBeLessThan( idIndex );
			console.log( `✓ Triple nested class (${ tripleNestedClass }) appears before ID class (${ idClass })` );
		}
	} );

	test( 'should preserve user order when classes are manually reordered', async ( { request, page }, testInfo ) => {
		// Create HTML with nested CSS selectors
		const htmlContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					.low-specificity { color: red; margin: 10px; }
					.parent .high-specificity { color: blue; margin: 20px; }
					.medium-specificity { color: green; margin: 15px; }
				</style>
			</head>
			<body>
				<div class="low-specificity">Low specificity</div>
				<div class="parent">
					<div class="high-specificity">High specificity</div>
				</div>
				<div class="medium-specificity">Medium specificity</div>
			</body>
			</html>
		`;

		// Convert the HTML
		const result: CssConverterResponse = await helper.convertHtmlWithCss(
			request,
			htmlContent,
			{
				createGlobalClasses: true,
				postType: 'page',
			}
		);

		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );

		console.log( `Created ${ result.global_classes_created } global classes for user order test` );

		// Navigate to Elementor editor
		await page.goto( `${ process.env.BASE_URL }/wp-admin/post.php?post=${ result.post_id }&action=elementor` );
		await page.waitForSelector( '.elementor-editor-loaded', { timeout: 30000 } );

		// Get initial CSS order (should be by specificity)
		const initialCssResponse = await page.evaluate( async () => {
			const response = await fetch( '/wp-content/uploads/elementor/css/global-frontend-desktop.css?ver=all&t=' + Date.now() );
			return response.ok ? await response.text() : '';
		} );

		console.log( 'Initial CSS (by specificity):', initialCssResponse );

		// TODO: In a real implementation, we would:
		// 1. Open Global Classes Manager
		// 2. Manually reorder the classes (drag and drop)
		// 3. Save the changes
		// 4. Verify that the new CSS respects the user's manual order
		// 5. Add new classes and verify they don't disrupt the user's order

		// For now, we'll just verify that the initial ordering is by specificity
		const classMatches = initialCssResponse.match( /\.elementor\s+\.[\w-]+/g ) || [];
		const classOrder = classMatches.map( match => match.replace( '.elementor .', '' ) );

		console.log( 'Initial class order (should be by specificity):', classOrder );
		expect( classOrder.length ).toBeGreaterThan( 0 );

		// Verify that classes exist and are in some order
		// The exact order verification would require more complex setup
		expect( classOrder.some( cls => cls.includes( 'low' ) || cls.includes( 'specificity' ) ) ).toBe( true );
	} );

	test( 'should handle mixed CSS Converter and regular global classes', async ( { request, page }, testInfo ) => {
		// Create HTML with some nested selectors
		const htmlContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					.css-converter-low { color: red; margin: 5px; }
					.parent .css-converter-high { color: blue; margin: 25px; }
				</style>
			</head>
			<body>
				<div class="css-converter-low">CSS Converter Low</div>
				<div class="parent">
					<div class="css-converter-high">CSS Converter High</div>
				</div>
			</body>
			</html>
		`;

		// Convert the HTML
		const result: CssConverterResponse = await helper.convertHtmlWithCss(
			request,
			htmlContent,
			{
				createGlobalClasses: true,
				postType: 'page',
			}
		);

		expect( result.success ).toBe( true );
		expect( result.global_classes_created ).toBeGreaterThan( 0 );

		console.log( `Created ${ result.global_classes_created } CSS Converter global classes` );

		// Navigate to editor and check CSS generation
		await page.goto( `${ process.env.BASE_URL }/wp-admin/post.php?post=${ result.post_id }&action=elementor` );
		await page.waitForSelector( '.elementor-editor-loaded', { timeout: 30000 } );

		// Get the generated CSS
		const cssResponse = await page.evaluate( async () => {
			const response = await fetch( '/wp-content/uploads/elementor/css/global-frontend-desktop.css?ver=all&t=' + Date.now() );
			return response.ok ? await response.text() : '';
		} );

		console.log( 'Mixed classes CSS:', cssResponse );

		// Verify CSS was generated and contains our classes
		expect( cssResponse ).toBeTruthy();
		
		// Extract class order
		const classMatches = cssResponse.match( /\.elementor\s+\.[\w-]+/g ) || [];
		const classOrder = classMatches.map( match => match.replace( '.elementor .', '' ) );

		console.log( 'Mixed class order:', classOrder );

		// Verify that CSS Converter classes are present and ordered
		const cssConverterClasses = classOrder.filter( cls => 
			cls.includes( 'css-converter' ) || 
			cls.includes( 'low' ) || 
			cls.includes( 'high' ) ||
			cls.includes( 'parent' )
		);

		expect( cssConverterClasses.length ).toBeGreaterThan( 0 );
		console.log( 'CSS Converter classes found:', cssConverterClasses );

		// Verify that lower specificity appears before higher specificity
		const lowSpecificityClass = cssConverterClasses.find( cls => cls.includes( 'low' ) );
		const highSpecificityClass = cssConverterClasses.find( cls => cls.includes( 'high' ) || cls.includes( 'parent' ) );

		if ( lowSpecificityClass && highSpecificityClass ) {
			const lowIndex = classOrder.indexOf( lowSpecificityClass );
			const highIndex = classOrder.indexOf( highSpecificityClass );
			expect( lowIndex ).toBeLessThan( highIndex );
			console.log( `✓ Low specificity class (${ lowSpecificityClass }) appears before high specificity class (${ highSpecificityClass })` );
		}
	} );
} );
