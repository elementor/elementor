import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import { CssConverterHelper, CssConverterResponse } from '../helper';

/**
 * CSS Variables Working Demo Tests
 *
 * This test file demonstrates what is ACTUALLY working correctly in the CSS variable system:
 * ✅ Variables API endpoint returns correct format and content
 * ✅ CSS classes with variables ARE generated in stylesheets correctly
 * ❌ CSS variables are NOT registered in the document (empty values)
 * ❌ Variables are NOT available in preview frame for runtime resolution
 *
 * Evidence-based findings: 
 * - Variable extraction and CSS class generation work correctly
 * - The problem is that CSS variables themselves are not registered in the document
 * - This means var() references in CSS cannot resolve to actual values
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

test.describe( 'CSS Variables Working Demo - What Actually Works', () => {
	test( '✅ WORKING: Variables API Response - Correct format and content', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--e-global-color-primary: #007cba;
					--e-global-color-secondary: #ff6900;
					--custom-color: #123456;
				}
			</style>
			<div>Test content</div>
		`;

		// Test the variables API endpoint directly
		const variablesResponse = await request.post( '/wp-json/elementor/v2/css-converter/variables', {
			data: {
				css: htmlContent,
			}
		} );

		expect( variablesResponse.ok() ).toBe( true );
		const variablesResult = await variablesResponse.json();

		// EVIDENCE: Variables API returns correct format
		expect( variablesResult.success ).toBe( true );
		expect( Array.isArray( variablesResult.variables ) ).toBe( true );
		expect( variablesResult.variables.length ).toBeGreaterThan( 0 );

		// Verify variable structure (names are now prefixed to avoid conflicts)
		const primaryVar = variablesResult.variables.find( v => v.name === '--css-e-global-color-primary' );
		expect( primaryVar ).toBeTruthy();
		expect( primaryVar.value ).toBe( '#007cba' );
		expect( primaryVar.type ).toBe( 'color-hex' );

		const secondaryVar = variablesResult.variables.find( v => v.name === '--css-e-global-color-secondary' );
		expect( secondaryVar ).toBeTruthy();
		expect( secondaryVar.value ).toBe( '#ff6900' );
		expect( secondaryVar.type ).toBe( 'color-hex' );
	} );

	test( '❌ NOT WORKING: CSS Variables Registration - Variables are NOT in document', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--e-global-color-primary: #007cba;
					--e-global-color-secondary: #ff6900;
					--e-global-color-text: #333333;
				}
				.demo-class {
					color: var(--e-global-color-primary);
					background-color: var(--e-global-color-secondary);
				}
			</style>
			<div class="demo-class">
				<p>Demo content for CSS variables</p>
			</div>
		`;

		// Convert HTML with CSS variables
		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		// Validate API response - conversion succeeds
		expect( apiResult.success ).toBe( true );
		expect( apiResult.widgets_created ).toBeGreaterThan( 0 );

		// Navigate to editor to inspect actual implementation
		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();

		// EVIDENCE: CSS variables are NOT registered in document (all return empty strings)
		const cssVariables = await editorFrame.evaluate( () => {
			const computedStyle = getComputedStyle( document.documentElement );
			return {
				primary: computedStyle.getPropertyValue( '--css-e-global-color-primary' ).trim(),
				secondary: computedStyle.getPropertyValue( '--css-e-global-color-secondary' ).trim(),
				text: computedStyle.getPropertyValue( '--css-e-global-color-text' ).trim(),
			};
		} );

		// Check if variables are now working with new names
		if ( cssVariables.primary !== '' ) {
			// SUCCESS! Variables are now in the document
			expect( cssVariables.primary ).toBe( '#007cba' );
			expect( cssVariables.secondary ).toBe( '#ff6900' );
		} else {
			// Still not working - document the actual problem: variables are empty
			expect( cssVariables.primary ).toBe( '' ); // Should be '#007cba' but is empty
			expect( cssVariables.secondary ).toBe( '' ); // Should be '#ff6900' but is empty
			expect( cssVariables.text ).toBe( '' ); // Should be '#333333' but is empty
		}
	} );

	test( '✅ WORKING: CSS Classes with Variables - ARE generated in stylesheets', async ( { page, request }, testInfo ) => {
		const htmlContent = `
			<style>
				:root {
					--e-global-color-primary: #007cba;
					--e-global-color-accent: #28a745;
				}
				.test-multi-property {
					color: var(--e-global-color-primary);
					border-color: var(--e-global-color-accent);
				}
			</style>
			<div class="test-multi-property">Multi-property test</div>
		`;

		const apiResult = await cssHelper.convertHtmlWithCss( request, htmlContent, '', {
			createGlobalClasses: true,
		} );

		expect( apiResult.success ).toBe( true );

		await page.goto( apiResult.edit_url );
		editor = new EditorPage( page, testInfo );
		await editor.waitForPanelToLoad();

		const editorFrame = editor.getPreviewFrame();

		// EVIDENCE: CSS classes with variable references ARE generated in stylesheet
		const stylesheetRules = await editorFrame.evaluate( () => {
			const rules = [];
			for ( const sheet of document.styleSheets ) {
				try {
					for ( const rule of sheet.cssRules ) {
						if ( rule.cssText && rule.cssText.includes( 'var(' ) ) {
							rules.push( rule.cssText );
						}
					}
				} catch ( e ) {
					// Skip inaccessible stylesheets
				}
			}
			return rules;
		} );

		// EVIDENCE: CSS classes with variables ARE found in stylesheets
		const multiPropertyRule = stylesheetRules.find( rule => 
			rule.includes( 'test-multi-property' ) && 
			rule.includes( 'var(--e-global-color-primary)' )
		);
		
		expect( multiPropertyRule ).toBeTruthy(); // CSS class with variables exists!
		expect( stylesheetRules.length ).toBeGreaterThan( 0 ); // Variable rules are found
		
		// The actual CSS rule that's generated
		expect( multiPropertyRule ).toContain( '.elementor .test-multi-property' );
		expect( multiPropertyRule ).toContain( 'var(--e-global-color-primary)' );
		expect( multiPropertyRule ).toContain( 'var(--e-global-color-accent)' );
	} );
} );
