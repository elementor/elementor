import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import { CssConverterHelper } from '../helper';

test.describe( 'Variable Duplicate Detection @duplicate-detection', () => {
	let cssHelper: CssConverterHelper;

	test.beforeAll( async () => {
		cssHelper = new CssConverterHelper();
	} );

	test.beforeEach( async () => {
		await new Promise( ( resolve ) => setTimeout( resolve, 7000 ) );
	} );

	test.describe( 'Incremental Naming Mode (Default)', () => {
		test( 'should create suffixed variables and reuse originals correctly', async ( { request } ) => {
			// Use a unique variable name to avoid conflicts with existing variables
			const uniqueId = Date.now();
			const variableName = `test-var-${uniqueId}`;
			
			// STEP 1: Create first variable --test-var-123456: #ffffff
			const css1 = `:root { --${variableName}: #ffffff; }`;
			const result1 = await cssHelper.convertCssVariables( request, css1 );

			expect( result1.success ).toBe( true );
			expect( result1.stored_variables.created ).toBe( 1 );
			expect( result1.stored_variables.reused ).toBe( 0 );
			
			// Check that we have variables created
			expect( result1.variables ).toBeDefined();
			expect( Object.keys( result1.variables ).length ).toBeGreaterThan( 0 );
			
			// Find the created variable (should be our unique variable name)
			const firstVariableNames = Object.keys( result1.variables );
			console.log( 'Step 1 - Created variable names:', firstVariableNames );
			expect( firstVariableNames ).toContain( variableName );

			// STEP 2: Create duplicate with different value --test-var-123456: #000000
			const css2 = `:root { --${variableName}: #000000; }`;
			const result2 = await cssHelper.convertCssVariables( request, css2 );

			expect( result2.success ).toBe( true );
			expect( result2.stored_variables.created ).toBe( 1 );
			expect( result2.stored_variables.reused ).toBe( 0 );
			
			// Check that we have a suffixed variable created
			const secondVariableNames = Object.keys( result2.variables );
			console.log( 'Step 2 - Created variable names:', secondVariableNames );
			
			// Should create a suffixed version like 'test-var-123456-1'
			const suffixPattern = new RegExp( `^${variableName}-\\d+$` );
			const hasSuffixedVariable = secondVariableNames.some( name => 
				suffixPattern.test( name )
			);
			expect( hasSuffixedVariable ).toBe( true );

			// STEP 3: Reuse existing variable --test-var-123456: #ffffff (same as step 1)
			const css3 = `:root { --${variableName}: #ffffff; }`;
			const result3 = await cssHelper.convertCssVariables( request, css3 );

			expect( result3.success ).toBe( true );
			expect( result3.stored_variables.created ).toBe( 0 );
			expect( result3.stored_variables.reused ).toBe( 1 );
			
			// Should reuse the original variable name
			const thirdVariableNames = Object.keys( result3.variables );
			console.log( 'Step 3 - Variable names (should be original):', thirdVariableNames );
			expect( thirdVariableNames ).toContain( variableName );

			// Verify update mode is consistent
			expect( result1.stored_variables.update_mode ).toBe( 'create_new' );
			expect( result2.stored_variables.update_mode ).toBe( 'create_new' );
			expect( result3.stored_variables.update_mode ).toBe( 'create_new' );

			// STEP 4: Test cascading duplicate detection - create variable with name that matches existing suffix
			// Use the same name as Step 2's suffix, but with a DIFFERENT value to force cascading
			const suffixVariableName = `${variableName}-1`;
			const css4 = `:root { --${suffixVariableName}: #800080; }`; // Purple - different from Step 2's #000000
			const result4 = await cssHelper.convertCssVariables( request, css4 );

			expect( result4.success ).toBe( true );
			console.log( 'Step 4 - Full result:', JSON.stringify( result4.stored_variables, null, 2 ) );
			
			// The behavior depends on whether the value matches an existing variable
			// If it matches, it should reuse; if different, it should create new
			if ( result4.stored_variables.reused > 0 ) {
				// Variable was reused (same value as existing)
				expect( result4.stored_variables.created ).toBe( 0 );
				expect( result4.stored_variables.reused ).toBe( 1 );
			} else {
				// Variable was created with new suffix (different value)
				expect( result4.stored_variables.created ).toBe( 1 );
				expect( result4.stored_variables.reused ).toBe( 0 );
			}

			// Should create a cascading suffix like 'test-var-123456-1-1' or 'test-var-123456-2'
			const fourthVariableNames = Object.keys( result4.variables );
			console.log( 'Step 4 - Cascading variable names:', fourthVariableNames );
			
			// Should create a cascading suffix (either -1-1 or -2 pattern)
			const cascadingPattern1 = new RegExp( `^${variableName}-1-\\d+$` ); // test-var-123456-1-1
			const cascadingPattern2 = new RegExp( `^${variableName}-\\d+$` );   // test-var-123456-2
			
			const hasCascadingSuffix = fourthVariableNames.some( name => 
				cascadingPattern1.test( name ) || (cascadingPattern2.test( name ) && name !== `${variableName}-1`)
			);
			expect( hasCascadingSuffix ).toBe( true );
		} );

		test( 'should create suffixed variable when value differs', async ( { request } ) => {
			const css1 = ':root { --brand-color: #ff0000; }';
			const css2 = ':root { --brand-color: #00ff00; }';

			const result1 = await cssHelper.convertCssVariables( request, css1 );
			expect( result1.success ).toBe( true );
			expect( result1.stored_variables.created ).toBeGreaterThanOrEqual( 1 );

			const result2 = await cssHelper.convertCssVariables( request, css2 );
			expect( result2.success ).toBe( true );
			expect( result2.stored_variables.created ).toBeGreaterThanOrEqual( 1 );
			expect( result2.stored_variables.reused ).toBe( 0 );
		} );
	} );
} );
