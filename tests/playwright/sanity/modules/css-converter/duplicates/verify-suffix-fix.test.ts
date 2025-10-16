import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import { CssConverterHelper } from '../helper';

test.describe( 'VERIFY Suffix Fix @verify', () => {
	let cssHelper: CssConverterHelper;

	test.beforeAll( async () => {
		cssHelper = new CssConverterHelper();
	} );

	test.skip( 'First class should have NO suffix, second should be -1', async ( { request } ) => {
		const css1 = '.persist-test { color: red; }';
		const result1 = await cssHelper.convertCssToClasses( request, css1, true );
		console.log( 'Result 1 label:', result1.data?.converted_classes?.[ 0 ]?.label );
		console.log( 'Result 1 stored:', result1.data?.storage?.stored );
		expect( result1.data.converted_classes[ 0 ].label ).toBe( 'persist-test' );
		expect( result1.data.storage.stored ).toBe( 1 );
	} );
} );
