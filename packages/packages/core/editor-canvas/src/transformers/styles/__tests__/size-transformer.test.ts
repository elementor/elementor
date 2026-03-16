import { sizeTransformer } from '../size-transformer';

function run( val: { size?: number; unit?: string } ) {
	return sizeTransformer( val, { key: 'width', signal: undefined } );
}

describe( 'sizeTransformer', () => {
	it( 'returns "auto" when unit is auto and size is null', () => {
		expect( run( { size: null, unit: 'auto' } ) ).toBe( 'auto' );
	} );

	it( 'returns "auto" when unit is auto and size is undefined', () => {
		expect( run( { unit: 'auto' } ) ).toBe( 'auto' );
	} );

	it( 'concatenates size and unit for normal units', () => {
		expect( run( { size: 100, unit: 'px' } ) ).toBe( '100px' );
		expect( run( { size: 50, unit: '%' } ) ).toBe( '50%' );
	} );

	it( 'returns only size for custom unit', () => {
		expect( run( { size: 100, unit: 'custom' } ) ).toBe( 100 );
	} );
} );
