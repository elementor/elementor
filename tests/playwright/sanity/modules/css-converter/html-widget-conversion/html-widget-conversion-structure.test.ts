import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

/**
 * HTML to Widget Conversion Structure Tests
 *
 * Tests the HTML to widget conversion process to ensure:
 * 1. Correct widget hierarchy is created from HTML structure
 * 2. CSS classes are properly applied to widgets
 * 3. Nested elements are converted to appropriate atomic widgets
 * 4. Real-world HTML structures (like oboxthemes.com) are handled correctly
 * 5. Widget types match the semantic HTML elements
 */

let cssHelper: CssConverterHelper;
let wpAdmin: WpAdminPage;
let editor: EditorPage;

test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
	const page = await browser.newPage();
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

	await wpAdminPage.setExperiments( {
		e_opt_in_v4_page: 'active',
		e_atomic_elements: 'active',
		e_nested_elements: 'active',
	} );

	await page.close();
	cssHelper = new CssConverterHelper();
} );

test.beforeEach( async ( { page, apiRequests }, testInfo ) => {
	wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
} );

test.describe( 'HTML to Widget Conversion Structure', () => {
	test( 'Simple Div with Paragraph - Correct Widget Hierarchy', async ( { page, request } ) => {
		const htmlContent = `
			<style>
				.my-class {
					background-color: #f8f9fa;
					padding: 20px;
					border: 1px solid #dee2e6;
				}
				.text-styling {
					color: #495057;
					font-size: 16px;
					line-height: 1.5;
				}
			</style>
			<div class="my-class">
				<p class="text-styling">This is a paragraph with text styling inside a div container.</p>
			</div>
		`;

		// Convert HTML structure
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		// Validate API response
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		console.log( 'API Result:', JSON.stringify( {
			success: apiResult.success,
			widgets_created: apiResult.widgets_created,
			global_classes_created: apiResult.global_classes_created,
			post_id: apiResult.post_id,
		}, null, 2 ) );

		// Navigate to editor
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForEditorToLoad();

		// Get the editor frame
		const editorFrame = editor.getPreviewFrame();

		// Find the paragraph element
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /This is a paragraph with text styling/i } );
		await expect( paragraph ).toBeVisible();

		// Verify CSS is applied correctly
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(73, 80, 87)' ); // #495057
		await expect( paragraph ).toHaveCSS( 'font-size', '16px' );
		await expect( paragraph ).toHaveCSS( 'line-height', '1.5' );

		// Check parent container styling
		const container = paragraph.locator( '..' );
		await expect( container ).toHaveCSS( 'background-color', 'rgb(248, 249, 250)' ); // #f8f9fa
		await expect( container ).toHaveCSS( 'padding', '20px' );
		await expect( container ).toHaveCSS( 'border-width', '1px' );

		// Verify HTML structure in editor
		const containerElement = await container.evaluate( ( el ) => {
			return {
				tagName: el.tagName.toLowerCase(),
				className: el.className,
				childCount: el.children.length,
				firstChildTagName: el.children[ 0 ]?.tagName.toLowerCase(),
			};
		} );

		console.log( 'Container Element Structure:', containerElement );

		const paragraphElement = await paragraph.evaluate( ( el ) => {
			return {
				tagName: el.tagName.toLowerCase(),
				className: el.className,
				textContent: el.textContent?.substring( 0, 50 ),
			};
		} );

		console.log( 'Paragraph Element Structure:', paragraphElement );

		// Verify widget types are correct
		// The container should be an e-div-block and paragraph should be e-paragraph
		expect( containerElement.tagName ).toBe( 'div' );
		expect( paragraphElement.tagName ).toBe( 'p' );
	} );

	test( 'Multiple Nested Elements - Complex Widget Hierarchy', async ( { page, request } ) => {
		const htmlContent = `
			<style>
				.outer-container {
					background-color: #ffffff;
					padding: 30px;
					margin: 10px;
				}
				.inner-wrapper {
					border: 2px solid #007cba;
					padding: 15px;
				}
				.heading-style {
					color: #2c3e50;
					font-size: 24px;
					margin-bottom: 10px;
				}
				.content-text {
					color: #34495e;
					font-size: 14px;
					line-height: 1.6;
				}
			</style>
			<div class="outer-container">
				<div class="inner-wrapper">
					<h2 class="heading-style">Section Heading</h2>
					<p class="content-text">This is the content paragraph with specific styling.</p>
				</div>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		console.log( 'Complex Structure API Result:', JSON.stringify( {
			success: apiResult.success,
			widgets_created: apiResult.widgets_created,
			global_classes_created: apiResult.global_classes_created,
		}, null, 2 ) );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForEditorToLoad();

		const editorFrame = editor.getPreviewFrame();

		// Find elements
		const heading = editorFrame.locator( 'h2' ).filter( { hasText: /Section Heading/i } );
		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /This is the content paragraph/i } );

		await expect( heading ).toBeVisible();
		await expect( paragraph ).toBeVisible();

		// Verify heading styles
		await expect( heading ).toHaveCSS( 'color', 'rgb(44, 62, 80)' ); // #2c3e50
		await expect( heading ).toHaveCSS( 'font-size', '24px' );

		// Verify paragraph styles
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(52, 73, 94)' ); // #34495e
		await expect( paragraph ).toHaveCSS( 'font-size', '14px' );
		await expect( paragraph ).toHaveCSS( 'line-height', '1.6' );

		// Check nested container structure
		const innerWrapper = heading.locator( '../..' ); // Go up to inner wrapper
		const outerContainer = innerWrapper.locator( '..' ); // Go up to outer container

		await expect( innerWrapper ).toHaveCSS( 'border-width', '2px' );
		await expect( innerWrapper ).toHaveCSS( 'border-color', 'rgb(0, 124, 186)' ); // #007cba
		await expect( innerWrapper ).toHaveCSS( 'padding', '15px' );

		await expect( outerContainer ).toHaveCSS( 'background-color', 'rgb(255, 255, 255)' ); // #ffffff
		await expect( outerContainer ).toHaveCSS( 'padding', '30px' );
		await expect( outerContainer ).toHaveCSS( 'margin', '10px' );
	} );

	test( 'OboxThemes.com Real-World Structure - Element 6d397c1', async ( { page, request } ) => {
		const oboxUrl = 'https://oboxthemes.com/';
		const targetSelector = '.elementor-element-6d397c1';

		// Convert the real oboxthemes.com content
		const apiResult = await cssHelper.convertHtmlWithCss( request, oboxUrl, targetSelector, {
			createGlobalClasses: true,
		} );

		// Log detailed API response for analysis
		console.log( 'OboxThemes API Result:', JSON.stringify( {
			success: apiResult.success,
			widgets_created: apiResult.widgets_created,
			global_classes_created: apiResult.global_classes_created,
			variables_created: apiResult.variables_created,
			compound_classes_created: apiResult.compound_classes_created,
			post_id: apiResult.post_id,
			warnings: apiResult.warnings,
			errors: apiResult.errors,
		}, null, 2 ) );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForEditorToLoad();

		const editorFrame = editor.getPreviewFrame();

		// Take a screenshot for visual verification
		await page.screenshot( { path: 'oboxthemes-conversion-result.png', fullPage: true } );

		// Find all visible elements in the converted content
		const allElements = await editorFrame.locator( '*' ).evaluateAll( ( elements ) => {
			return elements
				.filter( ( el ) => el.offsetParent !== null ) // Only visible elements
				.map( ( el ) => ( {
					tagName: el.tagName.toLowerCase(),
					className: el.className,
					textContent: el.textContent?.substring( 0, 100 ),
					hasChildren: el.children.length > 0,
					childCount: el.children.length,
				} ) )
				.slice( 0, 20 ); // Limit to first 20 elements for readability
		} );

		console.log( 'OboxThemes Converted Elements:', JSON.stringify( allElements, null, 2 ) );

		// Look for specific content that should be present
		const textElements = await editorFrame.locator( 'p, h1, h2, h3, h4, h5, h6, span, div' )
			.filter( { hasText: /.+/ } ) // Elements with text content
			.evaluateAll( ( elements ) => {
				return elements
					.filter( ( el ) => el.textContent && el.textContent.trim().length > 0 )
					.map( ( el ) => ( {
						tagName: el.tagName.toLowerCase(),
						className: el.className,
						textContent: el.textContent?.trim().substring( 0, 100 ),
						computedStyles: {
							color: window.getComputedStyle( el ).color,
							fontSize: window.getComputedStyle( el ).fontSize,
							fontWeight: window.getComputedStyle( el ).fontWeight,
						},
					} ) )
					.slice( 0, 10 ); // Limit for readability
			} );

		console.log( 'OboxThemes Text Elements:', JSON.stringify( textElements, null, 2 ) );

		// Verify at least some content is visible
		const visibleContent = editorFrame.locator( 'p, h1, h2, h3, h4, h5, h6' ).filter( { hasText: /.+/ } );
		const contentCount = await visibleContent.count();

		console.log( `Found ${ contentCount } text elements in converted content` );
		expect( contentCount ).toBeGreaterThan( 0 );

		// Check for expected styling from oboxthemes
		if ( contentCount > 0 ) {
			const firstTextElement = visibleContent.first();
			await expect( firstTextElement ).toBeVisible();

			// Log the actual styles applied
			const appliedStyles = await firstTextElement.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					color: styles.color,
					fontSize: styles.fontSize,
					fontWeight: styles.fontWeight,
					lineHeight: styles.lineHeight,
					fontFamily: styles.fontFamily,
				};
			} );

			console.log( 'First Text Element Applied Styles:', appliedStyles );
		}
	} );

	test( 'Widget Type Mapping Verification - Semantic Elements', async ( { page, request } ) => {
		const htmlContent = `
			<style>
				.container { background: #f0f0f0; padding: 20px; }
				.title { color: #333; font-size: 28px; }
				.subtitle { color: #666; font-size: 18px; }
				.content { color: #444; font-size: 14px; }
				.button-style { background: #007cba; color: white; padding: 10px 20px; }
			</style>
			<div class="container">
				<h1 class="title">Main Title</h1>
				<h2 class="subtitle">Subtitle</h2>
				<p class="content">This is a paragraph of content.</p>
				<button class="button-style">Click Me</button>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		console.log( 'Semantic Elements API Result:', JSON.stringify( {
			success: apiResult.success,
			widgets_created: apiResult.widgets_created,
			global_classes_created: apiResult.global_classes_created,
		}, null, 2 ) );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForEditorToLoad();

		const editorFrame = editor.getPreviewFrame();

		// Check each semantic element type
		const h1Element = editorFrame.locator( 'h1' ).filter( { hasText: /Main Title/i } );
		const h2Element = editorFrame.locator( 'h2' ).filter( { hasText: /Subtitle/i } );
		const pElement = editorFrame.locator( 'p' ).filter( { hasText: /This is a paragraph/i } );
		const buttonElement = editorFrame.locator( 'button' ).filter( { hasText: /Click Me/i } );

		// Verify all elements are visible
		await expect( h1Element ).toBeVisible();
		await expect( h2Element ).toBeVisible();
		await expect( pElement ).toBeVisible();
		await expect( buttonElement ).toBeVisible();

		// Verify styles are applied
		await expect( h1Element ).toHaveCSS( 'color', 'rgb(51, 51, 51)' ); // #333
		await expect( h1Element ).toHaveCSS( 'font-size', '28px' );

		await expect( h2Element ).toHaveCSS( 'color', 'rgb(102, 102, 102)' ); // #666
		await expect( h2Element ).toHaveCSS( 'font-size', '18px' );

		await expect( pElement ).toHaveCSS( 'color', 'rgb(68, 68, 68)' ); // #444
		await expect( pElement ).toHaveCSS( 'font-size', '14px' );

		await expect( buttonElement ).toHaveCSS( 'background-color', 'rgb(0, 124, 186)' ); // #007cba
		await expect( buttonElement ).toHaveCSS( 'color', 'rgb(255, 255, 255)' ); // White

		// Log the widget structure for analysis
		const widgetStructure = await editorFrame.evaluate( () => {
			const findWidgetInfo = ( element ) => {
				const classList = Array.from( element.classList );
				const widgetClasses = classList.filter( ( cls ) => cls.includes( 'elementor' ) || cls.includes( 'e-' ) );
				return {
					tagName: element.tagName.toLowerCase(),
					classes: classList,
					widgetClasses,
					textContent: element.textContent?.substring( 0, 50 ),
					hasChildren: element.children.length > 0,
				};
			};

			const container = document.querySelector( 'div' );
			const h1 = document.querySelector( 'h1' );
			const h2 = document.querySelector( 'h2' );
			const p = document.querySelector( 'p' );
			const button = document.querySelector( 'button' );

			return {
				container: container ? findWidgetInfo( container ) : null,
				h1: h1 ? findWidgetInfo( h1 ) : null,
				h2: h2 ? findWidgetInfo( h2 ) : null,
				p: p ? findWidgetInfo( p ) : null,
				button: button ? findWidgetInfo( button ) : null,
			};
		} );

		console.log( 'Widget Structure Analysis:', JSON.stringify( widgetStructure, null, 2 ) );
	} );

	test( 'Class Application Verification - CSS Classes on Widgets', async ( { page, request } ) => {
		const htmlContent = `
			<style>
				.my-class {
					background-color: #e3f2fd;
					border-radius: 8px;
					padding: 25px;
				}
				.text-styling {
					color: #1976d2;
					font-size: 18px;
					font-weight: 500;
					text-align: center;
				}
			</style>
			<div class="my-class">
				<p class="text-styling">Styled paragraph with custom classes</p>
			</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForEditorToLoad();

		const editorFrame = editor.getPreviewFrame();

		const paragraph = editorFrame.locator( 'p' ).filter( { hasText: /Styled paragraph with custom classes/i } );
		await expect( paragraph ).toBeVisible();

		// Verify CSS classes are applied and styles work
		await expect( paragraph ).toHaveCSS( 'color', 'rgb(25, 118, 210)' ); // #1976d2
		await expect( paragraph ).toHaveCSS( 'font-size', '18px' );
		await expect( paragraph ).toHaveCSS( 'font-weight', '500' );
		await expect( paragraph ).toHaveCSS( 'text-align', 'center' );

		const container = paragraph.locator( '..' );
		await expect( container ).toHaveCSS( 'background-color', 'rgb(227, 242, 253)' ); // #e3f2fd
		await expect( container ).toHaveCSS( 'border-radius', '8px' );
		await expect( container ).toHaveCSS( 'padding', '25px' );

		// Check if original CSS classes are preserved in the HTML
		const elementClasses = await paragraph.evaluate( ( el ) => {
			const container = el.parentElement;
			return {
				paragraphClasses: Array.from( el.classList ),
				containerClasses: Array.from( container.classList ),
				paragraphHasTextStyling: el.classList.contains( 'text-styling' ),
				containerHasMyClass: container.classList.contains( 'my-class' ),
			};
		} );

		console.log( 'Element Classes Analysis:', JSON.stringify( elementClasses, null, 2 ) );

		// Verify that the original classes are preserved (or appropriate global classes are applied)
		// The exact class names may be different due to global class generation
		expect( elementClasses.paragraphClasses.length ).toBeGreaterThan( 0 );
		expect( elementClasses.containerClasses.length ).toBeGreaterThan( 0 );
	} );
} );
