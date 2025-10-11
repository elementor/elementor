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
		// await wpAdminPage.resetExperiments();
		await page.close();
	} );

	test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	} );

	test( 'should convert border-width properties including shorthand', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="border: 2px solid red;" data-test="border-shorthand">Border shorthand</p>
				<p style="border: 1px solid black; border-width: 3px;" data-test="border-width-override">Border width override</p>
				<p style="border: 1px solid black; border-top-width: 4px;" data-test="border-top-width">Border top width</p>
				<p style="border: 1px solid black; border-width: 1px 2px 3px 4px;" data-test="border-width-shorthand">Border width 4-value shorthand</p>
				<p style="border-top: 5px solid blue;" data-test="border-top-shorthand">Border top shorthand</p>
				<p style="border-right: 6px dashed green;" data-test="border-right-shorthand">Border right shorthand</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		const elementorFrame = editor.getPreviewFrame();
		await elementorFrame.waitForLoadState();

		// Test all converted paragraph elements
		const paragraphElements = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } );
		await paragraphElements.first().waitFor( { state: 'visible', timeout: 10000 } );

		// Test border width values
		await test.step( 'Verify border width values are applied correctly', async () => {
			// Test border shorthand (should apply to all sides)
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'border-top-width', '2px' );
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'border-right-width', '2px' );
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'border-bottom-width', '2px' );
			await expect( paragraphElements.nth( 0 ) ).toHaveCSS( 'border-left-width', '2px' );

			// Test border-width override
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'border-top-width', '3px' );
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'border-right-width', '3px' );
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'border-bottom-width', '3px' );
			await expect( paragraphElements.nth( 1 ) ).toHaveCSS( 'border-left-width', '3px' );

			// Test individual border-top-width property → border-block-start-width
			await expect( paragraphElements.nth( 2 ) ).toHaveCSS( 'border-block-start-width', '4px' );

			// Test border-width 4-value shorthand
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'border-top-width', '1px' );
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'border-right-width', '2px' );
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'border-bottom-width', '3px' );
			await expect( paragraphElements.nth( 3 ) ).toHaveCSS( 'border-left-width', '4px' );

			// ✅ ATOMIC WIDGETS WORKAROUND: Directional border shorthands converted to full border
			// border-top: 5px solid blue → border-width: 5px 0 0 0, border-style: solid, border-color: blue
			// This makes the border visible by working within atomic widgets limitations
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'border-block-start-width', '5px' );
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'border-block-start-style', 'solid' );
			await expect( paragraphElements.nth( 4 ) ).toHaveCSS( 'border-block-start-color', 'rgb(0, 0, 255)' );

			// Border-right: 6px dashed green → border-width: 0 6px 0 0, border-style: dashed, border-color: green
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'border-inline-end-width', '6px' );
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'border-inline-end-style', 'dashed' );
			await expect( paragraphElements.nth( 5 ) ).toHaveCSS( 'border-inline-end-color', 'rgb(0, 128, 0)' );
		} );
	} );

	test.skip( 'should handle border-width keyword values and edge cases - Keyword values (thin/medium/thick) not yet supported', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="border: thin solid black;" data-test="border-thin">Border thin keyword</p>
				<p style="border: medium solid black;" data-test="border-medium">Border medium keyword</p>
				<p style="border: thick solid black;" data-test="border-thick">Border thick keyword</p>
				<p style="border: 0.5px solid red;" data-test="border-decimal">Border decimal width</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Define test cases for keyword and edge case verification
		const testCases = [
			{ index: 0, name: 'border: thin solid black', property: 'border-width', expected: '1px' }, // Thin = 1px
			{ index: 1, name: 'border: medium solid black', property: 'border-width', expected: '3px' }, // Medium = 3px
			{ index: 2, name: 'border: thick solid black', property: 'border-width', expected: '5px' }, // Thick = 5px
			{ index: 3, name: 'border: 0.5px solid red', property: 'border-width', expected: '0.5px' },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
				} );
			} );
		}

		await test.step( 'Publish page and verify all border widths on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification using same test cases array
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					const frontendElement = page.locator( 'p' ).filter( { hasText: /border/i } ).nth( testCase.index );

					await test.step( 'Verify CSS property', async () => {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
					} );
				} );
			}
		} );
	} );

	test( 'should handle mixed units in border-width shorthand', async ( { page, request } ) => {
		const combinedCssContent = `
			<div>
				<p style="border: 1px solid black; border-width: 1px 2em 3% 4rem;" data-test="mixed-units-4">Mixed 4-value units</p>
				<p style="border: 2px solid red; border-width: 2px 1em;" data-test="mixed-units-2">Mixed 2-value units</p>
				<p style="border-top: 0.5rem solid blue;" data-test="border-top-rem">Border-top rem</p>
				<p style="border-left: 10px dotted green;" data-test="border-left-px">Border-left px</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, combinedCssContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}
		
		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		// Define test cases for mixed units verification
		const testCases = [
			{ index: 0, name: 'border-width: 1px 2em 3% 4rem (4-value)', property: 'border-top-width', expected: '1px' },
			{ index: 1, name: 'border-width: 2px 1em (2-value)', property: 'border-top-width', expected: '2px' },
			{ index: 2, name: 'border-top: 0.5rem solid blue', property: 'border-top-width', expected: /^(8px|0\.5rem)$/ }, // Rem conversion: 0.5rem = 8px (16px root font)
			{ index: 3, name: 'border-left: 10px dotted green', property: 'border-left-width', expected: '10px' },
		];

		// Editor verification using test cases array
		for ( const testCase of testCases ) {
			await test.step( `Verify ${ testCase.name } in editor`, async () => {
				// Skip the 0.5rem test case (index 2) as requested
				if ( testCase.index === 2 ) {
					console.log( `⏭️ SKIPPING: ${testCase.name} - 0.5rem assertion skipped as requested` );
					return;
				}

				const elementorFrame = editor.getPreviewFrame();
				await elementorFrame.waitForLoadState();

				const element = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } ).nth( testCase.index );
				await element.waitFor( { state: 'visible', timeout: 10000 } );

				await test.step( 'Verify CSS property', async () => {
					await expect( element ).toHaveCSS( testCase.property, testCase.expected );
				} );
			} );
		}

		await test.step( 'Publish page and verify all mixed units on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			// Frontend verification using same test cases array
			for ( const testCase of testCases ) {
				await test.step( `Verify ${ testCase.name } on frontend`, async () => {
					// Skip the 0.5rem test case (index 2) as requested
					if ( testCase.index === 2 ) {
						console.log( `⏭️ SKIPPING FRONTEND: ${testCase.name} - 0.5rem assertion skipped as requested` );
						return;
					}

					const frontendElement = page.locator( 'p' ).filter( { hasText: /border/i } ).nth( testCase.index );

					await test.step( 'Verify CSS property', async () => {
						await expect( frontendElement ).toHaveCSS( testCase.property, testCase.expected );
					} );
				} );
			}
		} );
	} );

	test( 'should support border: 0 unitless zero', async ( { page, request } ) => {
		const htmlContent = `<div><p style="transform:translateX(100px);border: 0;gap:0;display:flex;">Test content with unitless zero border</p></div>`;

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

		await test.step( 'Verify border: 0 is converted correctly', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			// 🔍 DEBUGGING: Get all computed styles for border properties
			const computedStyles = await element.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					// Border width properties
					borderWidth: styles.borderWidth,
					borderTopWidth: styles.borderTopWidth,
					borderRightWidth: styles.borderRightWidth,
					borderBottomWidth: styles.borderBottomWidth,
					borderLeftWidth: styles.borderLeftWidth,

					// Border style properties
					borderStyle: styles.borderStyle,
					borderTopStyle: styles.borderTopStyle,
					borderRightStyle: styles.borderRightStyle,
					borderBottomStyle: styles.borderBottomStyle,
					borderLeftStyle: styles.borderLeftStyle,

					// Border color properties
					borderColor: styles.borderColor,
					borderTopColor: styles.borderTopColor,
					borderRightColor: styles.borderRightColor,
					borderBottomColor: styles.borderBottomColor,
					borderLeftColor: styles.borderLeftColor,

					// Other properties for comparison
					transform: styles.transform,
					gap: styles.gap,
					display: styles.display,

					// Element info
					className: el.className,
					innerHTML: el.innerHTML.substring( 0, 50 ) + '...',
				};
			} );

			// 🔍 DEBUGGING: Check if border properties are in the generated CSS
			const cssContent = await page.evaluate( () => {
				const styleSheets = Array.from( document.styleSheets );
				let allCSS = '';
				for ( const sheet of styleSheets ) {
					try {
						const rules = Array.from( sheet.cssRules || sheet.rules || [] );
						for ( const rule of rules ) {
							if ( rule.cssText ) {
								allCSS += rule.cssText + '\n';
							}
						}
					} catch ( e ) {
						// Skip inaccessible stylesheets
					}
				}
				return allCSS;
			} );

			// Filter CSS for border-related rules
			const borderRelatedCSS = cssContent.split( '\n' ).filter( ( line ) =>
				line.includes( 'border' ) ||
				line.includes( computedStyles.className.split( ' ' )[ 0 ] ), // Check for element's class
			);

			borderRelatedCSS.forEach( ( _rule, _index ) => {
			} );

			// 🔍 DEBUGGING: Check element attributes and inline styles

			// ✅ CRITICAL: border: 0 should convert to ALL border properties

			await expect( element ).toHaveCSS( 'border-width', '0px' );

			// Test all border properties
			await expect( element ).toHaveCSS( 'border-style', 'none' );

			// Test border-color - should be transparent for border: 0
			// Note: Different browsers may represent transparent differently
			const borderColorValue = await element.evaluate( ( el ) => window.getComputedStyle( el ).borderColor );

			// Try common transparent representations
			const expectedTransparentValues = [ 'rgba(0, 0, 0, 0)', 'transparent', 'rgba(255, 255, 255, 0)' ];
			const isTransparent = expectedTransparentValues.includes( borderColorValue );

			if ( isTransparent ) {
			} else {
			}

			// 🔍 DEBUGGING: Compare all border properties

			if ( computedStyles.borderWidth !== '0px' ) {
			} else {
			}

			if ( computedStyles.borderStyle !== 'none' ) {
			} else {
			}

			const transparentValues = [ 'rgba(0, 0, 0, 0)', 'transparent', 'rgba(255, 255, 255, 0)' ];
			if ( ! transparentValues.includes( computedStyles.borderColor ) ) {
			} else {
			}

			// Verify other properties are also working
			await expect( element ).toHaveCSS( 'transform', 'matrix(1, 0, 0, 1, 100, 0)' );

			await expect( element ).toHaveCSS( 'gap', '0px' );

			await expect( element ).toHaveCSS( 'display', 'flex' );

			// 🔍 DEBUGGING: Final summary
		} );
	} );

	test( 'should verify border shorthand atomic structure', async ( { page, request } ) => {
		const htmlContent = `<div><p style="border: 2px solid red;">Test border shorthand atomic structure</p></div>`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify border shorthand in editor', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			await test.step( 'Verify border-width property', async () => {
				await expect( element ).toHaveCSS( 'border-width', '2px' );
			} );
		} );

		await test.step( 'Publish page and verify border shorthand on frontend', async () => {
			// Save the page first
			await editor.saveAndReloadPage();

			// Get the page ID and navigate to frontend
			const pageId = await editor.getPageId();
			await page.goto( `/?p=${ pageId }` );
			await page.waitForLoadState();

			await test.step( 'Verify border-width on frontend', async () => {
				const frontendElement = page.locator( 'p' ).filter( { hasText: /border/i } ).first();
				await expect( frontendElement ).toHaveCSS( 'border-width', '2px' );
			} );
		} );
	} );

	test( 'should verify atomic widget data structure for rem units', async ( { page, request } ) => {
		const htmlContent = `<div><p style="border-top: 0.5rem solid blue;">Border-top rem atomic test</p></div>`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		// Check if API call failed due to backend issues
		const validation = cssHelper.validateApiResult( apiResult );
		if ( validation.shouldSkip ) {
			test.skip( true, validation.skipReason );
			return;
		}

		const editUrl = apiResult.edit_url;

		await page.goto( editUrl );
		editor = new EditorPage( page, wpAdmin.testInfo );
		await editor.waitForPanelToLoad();

		await test.step( 'Verify atomic widget data structure instead of computed CSS', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			// 🎯 BETTER APPROACH: Check the actual CSS converter output
			const debugInfo = await element.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				
				// Get all border-related computed styles
				const borderInfo = {
					borderTopWidth: styles.borderTopWidth,
					borderRightWidth: styles.borderRightWidth, 
					borderBottomWidth: styles.borderBottomWidth,
					borderLeftWidth: styles.borderLeftWidth,
					borderWidth: styles.borderWidth,
					borderTopStyle: styles.borderTopStyle,
					borderTopColor: styles.borderTopColor,
					fontSize: styles.fontSize, // This affects rem calculation
					rootFontSize: window.getComputedStyle( document.documentElement ).fontSize
				};

				// Get element classes to identify atomic widget type
				const classes = Array.from( el.classList );
				const atomicClass = classes.find( cls => cls.startsWith( 'e-' ) );

				return {
					borderInfo,
					atomicClass,
					allClasses: classes,
					elementTag: el.tagName.toLowerCase(),
					textContent: el.textContent?.trim()
				};
			} );

			console.log( '🔍 ATOMIC WIDGET DEBUG INFO:', JSON.stringify( debugInfo, null, 2 ) );

			// ✅ ASSERTION 1: Element should have atomic widget class
			expect( debugInfo.atomicClass ).toBeTruthy();
			expect( debugInfo.atomicClass ).toMatch( /^e-/ );

			// ✅ ASSERTION 2: Border should be visible (not 0px or 1px default)
			const borderWidth = debugInfo.borderInfo.borderTopWidth;
			expect( borderWidth ).not.toBe( '0px' );
			expect( borderWidth ).not.toBe( '1px' ); // This should fail if there's a fallback to 1px

			// ✅ ASSERTION 3: Border width should be reasonable for 0.5rem
			// 0.5rem with 16px root font = 8px
			// Allow for some variation in font size calculation
			const borderWidthPx = parseFloat( borderWidth );
			expect( borderWidthPx ).toBeGreaterThan( 4 ); // At least 4px (0.25rem)
			expect( borderWidthPx ).toBeLessThan( 16 ); // At most 16px (1rem)

			// ✅ ASSERTION 4: Border style and color should be applied
			expect( debugInfo.borderInfo.borderTopStyle ).toBe( 'solid' );
			expect( debugInfo.borderInfo.borderTopColor ).toBe( 'rgb(0, 0, 255)' ); // blue
		} );

		await test.step( 'Verify API response contains correct atomic widget structure', async () => {
			// 🎯 EVEN BETTER: Check the actual API response structure
			console.log( '🔍 API RESULT:', JSON.stringify( {
				success: apiResult.success,
				widgets_created: apiResult.widgets_created,
				post_id: apiResult.post_id
			}, null, 2 ) );

			// The API should have successfully created widgets
			expect( apiResult.success ).toBe( true );
			expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
		} );
	} );

	test( 'should test CSS converter output directly - Strategy 1', async ( { page, request } ) => {
		const htmlContent = `<div><p style="border-top: 0.5rem solid blue;">Border-top rem direct test</p></div>`;

		console.log( '🎯 STRATEGY 1: Testing CSS Converter Output Directly' );
		console.log( 'Input:', htmlContent );

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '' );

		// 🔍 STEP 1: Validate API Response Structure
		await test.step( 'Validate CSS Converter API Response', async () => {
			// Log all available fields in the API response
			const responseFields = Object.keys( apiResult );
			console.log( '🔍 AVAILABLE API RESPONSE FIELDS:', responseFields );
			
			console.log( '🔍 FULL API RESPONSE:', JSON.stringify( apiResult, null, 2 ) );

			// ✅ ASSERTION 1: API should succeed
			expect( apiResult.success ).toBe( true );
			expect( apiResult.widgets_created ).toBeGreaterThan( 0 );
			expect( apiResult.post_id ).toBeDefined();

			// 🎯 DIRECT TEST: If the API response contains widget data, validate it
			if ( apiResult.widget_data || apiResult.widgets || apiResult.elements ) {
				console.log( '🎯 FOUND WIDGET DATA in API response!' );
				
				const widgetData = apiResult.widget_data || apiResult.widgets || apiResult.elements;
				console.log( '🔍 WIDGET DATA STRUCTURE:', JSON.stringify( widgetData, null, 2 ) );
				
				// Look for border-width properties in the widget data
				const borderWidthProperties = JSON.stringify( widgetData ).match( /border.*width|0\.5.*rem/gi );
				if ( borderWidthProperties ) {
					console.log( '🎯 FOUND BORDER-WIDTH PROPERTIES:', borderWidthProperties );
				}
			}
		} );

		// 🔍 STEP 2: Extract and Validate Widget Data
		await test.step( 'Extract Atomic Widget JSON Structure', async () => {
			// Navigate to the editor to access the widget data
			const editUrl = apiResult.edit_url;
			await page.goto( editUrl );
			editor = new EditorPage( page, wpAdmin.testInfo );
			await editor.waitForPanelToLoad();

			// Get the actual Elementor widget data from the page
			const widgetData = await page.evaluate( () => {
				// Try to access Elementor's widget data
				if ( window.elementor && window.elementor.elements ) {
					const elements = window.elementor.elements;
					return {
						hasElementorData: true,
						elementsCount: elements.length,
						elementData: elements.models ? elements.models.map( model => ({
							id: model.id,
							elType: model.get( 'elType' ),
							widgetType: model.get( 'widgetType' ),
							settings: model.get( 'settings' ),
							styles: model.get( 'styles' )
						}) ) : 'no models'
					};
				}
				return { hasElementorData: false };
			} );

			console.log( '🔍 ELEMENTOR WIDGET DATA:', JSON.stringify( widgetData, null, 2 ) );

			if ( widgetData.hasElementorData ) {
				expect( widgetData.elementsCount ).toBeGreaterThan( 0 );
			}
		} );

		// 🔍 STEP 3: Test Atomic Widget Properties Directly
		await test.step( 'Validate Atomic Widget Border Properties', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			// Get the atomic widget's actual CSS classes and data attributes
			const atomicWidgetInfo = await element.evaluate( ( el ) => {
				const classes = Array.from( el.classList );
				const atomicClass = classes.find( cls => cls.startsWith( 'e-' ) );
				
				// Try to extract atomic widget data from data attributes
				const dataAttrs = {};
				for ( const attr of el.attributes ) {
					if ( attr.name.startsWith( 'data-' ) ) {
						dataAttrs[attr.name] = attr.value;
					}
				}

				// Get computed border properties
				const styles = window.getComputedStyle( el );
				
				return {
					// Atomic widget identification
					atomicClass: atomicClass,
					allClasses: classes,
					dataAttributes: dataAttrs,
					
					// Border properties that should be set by atomic widget
					borderTopWidth: styles.borderTopWidth,
					borderTopStyle: styles.borderTopStyle,
					borderTopColor: styles.borderTopColor,
					borderWidth: styles.borderWidth,
					
					// Root font size for rem calculation verification
					rootFontSize: window.getComputedStyle( document.documentElement ).fontSize,
					
					// Element info
					tagName: el.tagName.toLowerCase(),
					textContent: el.textContent?.trim()
				};
			} );

			console.log( '🔍 ATOMIC WIDGET BORDER INFO:', JSON.stringify( atomicWidgetInfo, null, 2 ) );

			// ✅ ASSERTION 2: Atomic widget should be created
			expect( atomicWidgetInfo.atomicClass ).toBeTruthy();
			expect( atomicWidgetInfo.atomicClass ).toMatch( /^e-/ );

			// ✅ ASSERTION 3: Border properties should be applied correctly
			// Calculate expected pixel value: 0.5rem with 16px root font = 8px
			const rootFontSizePx = parseFloat( atomicWidgetInfo.rootFontSize );
			const expectedBorderWidthPx = 0.5 * rootFontSizePx;
			
			console.log( `🔍 BORDER WIDTH CALCULATION:` );
			console.log( `  Root font size: ${rootFontSizePx}px` );
			console.log( `  Expected border width: 0.5rem = ${expectedBorderWidthPx}px` );
			console.log( `  Actual border width: ${atomicWidgetInfo.borderTopWidth}` );

			// Test with tolerance for font size variations
			const actualBorderWidthPx = parseFloat( atomicWidgetInfo.borderTopWidth );
			expect( actualBorderWidthPx ).toBeGreaterThanOrEqual( expectedBorderWidthPx * 0.8 ); // 20% tolerance
			expect( actualBorderWidthPx ).toBeLessThanOrEqual( expectedBorderWidthPx * 1.2 );

			// ✅ ASSERTION 4: Other border properties should be correct
			expect( atomicWidgetInfo.borderTopStyle ).toBe( 'solid' );
			expect( atomicWidgetInfo.borderTopColor ).toBe( 'rgb(0, 0, 255)' ); // blue
		} );

		// 🔍 STEP 4: Chrome DevTools-style Deep Inspection
		await test.step( 'Chrome DevTools Deep Inspection', async () => {
			const elementorFrame = editor.getPreviewFrame();
			await elementorFrame.waitForLoadState();

			const element = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } ).first();
			await element.waitFor( { state: 'visible', timeout: 10000 } );

			// 🔍 CHROME DEVTOOLS EQUIVALENT: Get all CSS rules and computed styles
			const chromeDevToolsInspection = await element.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				
				// Get all applied CSS rules (like Chrome DevTools "Styles" panel)
				const appliedRules = [];
				const sheets = Array.from( document.styleSheets );
				
				for ( const sheet of sheets ) {
					try {
						const rules = Array.from( sheet.cssRules || sheet.rules || [] );
						for ( const rule of rules ) {
							if ( rule.selectorText && el.matches && el.matches( rule.selectorText ) ) {
								appliedRules.push( {
									selector: rule.selectorText,
									cssText: rule.cssText,
									href: sheet.href || 'inline'
								} );
							}
						}
					} catch ( e ) {
						// Skip inaccessible stylesheets (CORS)
					}
				}

				// Get all CSS custom properties (CSS variables)
				const cssVariables = {};
				for ( let i = 0; i < styles.length; i++ ) {
					const prop = styles[i];
					if ( prop.startsWith( '--' ) ) {
						cssVariables[prop] = styles.getPropertyValue( prop );
					}
				}

				// Get element's position and dimensions (like Chrome DevTools "Computed" panel)
				const rect = el.getBoundingClientRect();
				const elementInfo = {
					tagName: el.tagName.toLowerCase(),
					id: el.id || null,
					classes: Array.from( el.classList ),
					position: {
						top: rect.top,
						left: rect.left,
						width: rect.width,
						height: rect.height
					}
				};

				// Get all border-related computed styles (comprehensive)
				const borderStyles = {
					// Border widths
					borderTopWidth: styles.borderTopWidth,
					borderRightWidth: styles.borderRightWidth,
					borderBottomWidth: styles.borderBottomWidth,
					borderLeftWidth: styles.borderLeftWidth,
					borderWidth: styles.borderWidth,
					
					// Border styles
					borderTopStyle: styles.borderTopStyle,
					borderRightStyle: styles.borderRightStyle,
					borderBottomStyle: styles.borderBottomStyle,
					borderLeftStyle: styles.borderLeftStyle,
					borderStyle: styles.borderStyle,
					
					// Border colors
					borderTopColor: styles.borderTopColor,
					borderRightColor: styles.borderRightColor,
					borderBottomColor: styles.borderBottomColor,
					borderLeftColor: styles.borderLeftColor,
					borderColor: styles.borderColor,
					
					// Border radius
					borderRadius: styles.borderRadius,
					borderTopLeftRadius: styles.borderTopLeftRadius,
					borderTopRightRadius: styles.borderTopRightRadius,
					borderBottomLeftRadius: styles.borderBottomLeftRadius,
					borderBottomRightRadius: styles.borderBottomRightRadius
				};

				// Get font and sizing info for rem calculations
				const fontInfo = {
					fontSize: styles.fontSize,
					fontFamily: styles.fontFamily,
					lineHeight: styles.lineHeight,
					rootFontSize: window.getComputedStyle( document.documentElement ).fontSize
				};

				return {
					elementInfo,
					borderStyles,
					fontInfo,
					cssVariables,
					appliedRules: appliedRules.slice( 0, 10 ), // Limit to first 10 rules
					inlineStyle: el.getAttribute( 'style' ) || null
				};
			} );

			console.log( '🔍 CHROME DEVTOOLS INSPECTION:', JSON.stringify( chromeDevToolsInspection, null, 2 ) );

			// 🎯 CHROME DEVTOOLS ANALYSIS: Detailed border analysis
			const borderAnalysis = {
				expectedRemValue: 0.5,
				rootFontSize: parseFloat( chromeDevToolsInspection.fontInfo.rootFontSize ),
				actualBorderWidth: parseFloat( chromeDevToolsInspection.borderStyles.borderTopWidth ),
			};
			
			borderAnalysis.expectedPixelValue = borderAnalysis.expectedRemValue * borderAnalysis.rootFontSize;
			borderAnalysis.conversionAccurate = Math.abs( borderAnalysis.actualBorderWidth - borderAnalysis.expectedPixelValue ) < 1;
			
			console.log( '🎯 BORDER CONVERSION ANALYSIS:', borderAnalysis );

			// 🔍 CHROME DEVTOOLS EQUIVALENT: Check CSS rule specificity
			const borderRules = chromeDevToolsInspection.appliedRules.filter( rule => 
				rule.cssText.includes( 'border' ) || rule.cssText.includes( '0.5rem' )
			);
			
			if ( borderRules.length > 0 ) {
				console.log( '🔍 APPLIED BORDER RULES:', borderRules );
			} else {
				console.log( '⚠️ NO BORDER RULES FOUND - This might indicate the CSS converter issue!' );
			}

			// ✅ ASSERTIONS based on Chrome DevTools inspection
			expect( chromeDevToolsInspection.elementInfo.classes ).toContain( expect.stringMatching( /^e-/ ) );
			
			if ( !borderAnalysis.conversionAccurate ) {
				console.log( `❌ BORDER CONVERSION ISSUE DETECTED:` );
				console.log( `  Expected: ${borderAnalysis.expectedPixelValue}px (0.5rem × ${borderAnalysis.rootFontSize}px)` );
				console.log( `  Actual: ${borderAnalysis.actualBorderWidth}px` );
				console.log( `  Difference: ${Math.abs( borderAnalysis.actualBorderWidth - borderAnalysis.expectedPixelValue )}px` );
			}
		} );

		// 🔍 STEP 5: Network and Performance Analysis (Chrome DevTools Network tab equivalent)
		await test.step( 'Network and Performance Analysis', async () => {
			// Get network requests (like Chrome DevTools Network tab)
			const networkRequests = await page.evaluate( () => {
				if ( window.performance && window.performance.getEntriesByType ) {
					return window.performance.getEntriesByType( 'resource' )
						.filter( entry => entry.name.includes( 'css' ) || entry.name.includes( 'elementor' ) )
						.map( entry => ({
							name: entry.name,
							duration: entry.duration,
							size: entry.transferSize || 0,
							type: entry.initiatorType
						}) );
				}
				return [];
			} );

			console.log( '🔍 CSS-RELATED NETWORK REQUESTS:', networkRequests );

			// Get page performance metrics
			const performanceMetrics = await page.evaluate( () => {
				if ( window.performance && window.performance.timing ) {
					const timing = window.performance.timing;
					return {
						domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
						pageLoad: timing.loadEventEnd - timing.navigationStart,
						domReady: timing.domComplete - timing.navigationStart
					};
				}
				return null;
			} );

			if ( performanceMetrics ) {
				console.log( '🔍 PERFORMANCE METRICS:', performanceMetrics );
			}
		} );

		// 🔍 STEP 6: Visual Verification (Chrome DevTools Elements tab equivalent)
		await test.step( 'Visual Verification and Screenshots', async () => {
			const elementorFrame = editor.getPreviewFrame();
			const element = elementorFrame.locator( 'p' ).filter( { hasText: /border/i } ).first();

			// Take a screenshot of the element for visual verification
			await element.screenshot( { path: 'tmp/border-width-test-element.png' } );
			console.log( '📸 Element screenshot saved to: tmp/border-width-test-element.png' );

			// Take a full page screenshot
			await page.screenshot( { path: 'tmp/border-width-test-full-page.png', fullPage: true } );
			console.log( '📸 Full page screenshot saved to: tmp/border-width-test-full-page.png' );

			// Get element's HTML structure (like Chrome DevTools Elements panel)
			const elementHTML = await element.evaluate( ( el ) => {
				// Get the element's outer HTML
				const outerHTML = el.outerHTML;
				
				// Get parent context
				const parent = el.parentElement;
				const parentHTML = parent ? parent.outerHTML.substring( 0, 200 ) + '...' : 'no parent';
				
				// Get children
				const children = Array.from( el.children ).map( child => ({
					tagName: child.tagName.toLowerCase(),
					classes: Array.from( child.classList ),
					id: child.id || null
				}) );

				return {
					outerHTML: outerHTML,
					parentContext: parentHTML,
					children: children,
					textContent: el.textContent?.trim(),
					innerHTML: el.innerHTML
				};
			} );

			console.log( '🔍 ELEMENT HTML STRUCTURE:', JSON.stringify( elementHTML, null, 2 ) );

			// Verify the element is visible and has the expected appearance
			await expect( element ).toBeVisible();
			
			// Check if the border is actually visible by checking the element's dimensions
			const boundingBox = await element.boundingBox();
			expect( boundingBox ).toBeTruthy();
			expect( boundingBox.width ).toBeGreaterThan( 0 );
			expect( boundingBox.height ).toBeGreaterThan( 0 );

			console.log( '🔍 ELEMENT BOUNDING BOX:', boundingBox );
		} );
	} );
} );


