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
		test.skip( 'should create new variable on first import', async ( { request } ) => {
			const css = ':root { --primary-color: #ff0000; }';
			const result = await cssHelper.convertCssVariables( request, css );

			expect( result.success ).toBe( true );
			expect( result.stored_variables.created ).toBeGreaterThanOrEqual( 1 );
		} );

		test.skip( 'should reuse existing variable with identical value', async ( { request } ) => {
			const css = ':root { --test-color: #ff0000; }';

			await cssHelper.convertCssVariables( request, css );
			const result = await cssHelper.convertCssVariables( request, css );

			expect( result.success ).toBe( true );
			expect( result.stored_variables.reused ).toBeGreaterThanOrEqual( 1 );
			expect( result.stored_variables.created ).toBe( 0 );
			expect( result.stored_variables.update_mode ).toBe( 'create_new' );
		} );

		test.skip( 'should create suffixed variable when value differs', async ( { request } ) => {
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
