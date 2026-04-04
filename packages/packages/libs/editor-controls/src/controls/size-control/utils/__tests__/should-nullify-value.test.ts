import { type SizePropValue } from '@elementor/editor-props';

import { shouldNullifyValue } from '../should-nullify-value';

describe( 'shouldNullifyValue', () => {
	it( 'should return true when value is null', () => {
		// Arrange.
		const value = null;

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( true );
	} );

	it( 'should return true when value has no size and unit is not auto or custom', () => {
		// Arrange.
		const value = { size: '', unit: 'px' } as unknown as SizePropValue[ 'value' ];

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( true );
	} );

	it( 'should return true when size is null and unit is standard', () => {
		// Arrange.
		const value = { size: null, unit: 'rem' } as unknown as SizePropValue[ 'value' ];

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( true );
	} );

	it( 'should return true when size is undefined and unit is standard', () => {
		// Arrange.
		const value = { size: undefined, unit: 'em' } as unknown as SizePropValue[ 'value' ];

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( true );
	} );

	it( 'should return false when value has numeric size', () => {
		// Arrange.
		const value = { size: 42, unit: 'px' } as unknown as SizePropValue[ 'value' ];

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( false );
	} );

	it( 'should return true when value has size zero and unit is standard', () => {
		// Arrange.
		const value = { size: 0, unit: 'px' as const };

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( false );
	} );

	it( 'should return false when unit is auto even without size', () => {
		// Arrange.
		const value = { size: '', unit: 'auto' } as unknown as SizePropValue[ 'value' ];

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( false );
	} );

	it( 'should return false when unit is custom even without size', () => {
		// Arrange.
		const value = { size: null, unit: 'custom' } as unknown as SizePropValue[ 'value' ];

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( false );
	} );

	it( 'should return false when unit is custom with string size', () => {
		// Arrange.
		const value = { size: 'calc(100% - 10px)', unit: 'custom' as const };

		// Act.
		const result = shouldNullifyValue( value );

		// Assert.
		expect( result ).toBe( false );
	} );
} );
