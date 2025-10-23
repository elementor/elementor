import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import { CssConverterHelper } from '../helper';

test.describe( 'Class Duplicate Detection @duplicate-detection', () => {
	let cssHelper: CssConverterHelper;

	test.beforeAll( async () => {
		cssHelper = new CssConverterHelper();
	} );

	test( 'should reuse identical classes', async ( { request } ) => {
		const css = `.button { background-color: blue; padding: 10px; }\n.button { background-color: blue; padding: 10px; }`;
		const result = await cssHelper.convertCssToClasses( request, css, false );
		expect( result.success ).toBe( true );
		expect( result.data.stats.classes_converted ).toBe( 1 );
		expect( result.data.stats.classes_reused ).toBe( 1 );
	} );

	test( 'should create suffixed class for different styles', async ( { request } ) => {
		const css = `.header { font-size: 20px; }\n.header { font-size: 22px; }`;
		const result = await cssHelper.convertCssToClasses( request, css, false );
		expect( result.success ).toBe( true );
		expect( result.data.stats.classes_converted ).toBe( 2 );
		expect( result.data.stats.classes_reused ).toBe( 0 );
		const labels = result.data.converted_classes.map( ( c: any ) => c.label ).sort();
		expect( labels ).toEqual( [ 'header', 'header-1' ] );
	} );

	test( 'should increment suffixes correctly', async ( { request } ) => {
		const css = `.item { color: black; }\n.item { color: red; }\n.item { color: green; }\n.item { color: blue; }`;
		const result = await cssHelper.convertCssToClasses( request, css, false );
		expect( result.success ).toBe( true );
		expect( result.data.stats.classes_converted ).toBe( 4 );
		const labels = result.data.converted_classes.map( ( c: any ) => c.label ).sort();
		expect( labels ).toEqual( [ 'item', 'item-1', 'item-2', 'item-3' ] );
	} );
} );
