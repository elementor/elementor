import type { SizePropValue } from '@elementor/editor-props';

import { resolveBoundPropValue } from '../resolve-bound-prop-value';

describe( 'resolveBoundPropValue', () => {
	describe( 'sizeValue', () => {
		it( 'should return null sizeValue when value is null and no bound placeholder', () => {
			// Arrange.
			const value = null;

			// Act.
			const result = resolveBoundPropValue( value );

			// Assert.
			expect( result.sizeValue ).toEqual( null );
		} );

		it( 'should return sizeValue with size and unit when value has both', () => {
			// Arrange.
			const value = { size: 42, unit: 'px' };

			// Act.
			const result = resolveBoundPropValue( value as SizePropValue[ 'value' ] );

			// Assert.
			expect( result.sizeValue ).toEqual( { size: 42, unit: 'px' } );
		} );

		it( 'should return null sizeValue when value is invalid size', () => {
			// Arrange.
			const value = { size: 0, unit: null } as unknown as SizePropValue[ 'value' ];

			// Act.
			const result = resolveBoundPropValue( value );

			// Assert.
			expect( result.sizeValue ).toEqual( null );
		} );

		it( 'should use boundPropPlaceholder unit when value has no unit', () => {
			// Arrange.
			const value = { size: 10, unit: null } as unknown as SizePropValue[ 'value' ];
			const boundPropPlaceholder = { size: 0, unit: 'rem' as const };

			// Act.
			const result = resolveBoundPropValue( value, boundPropPlaceholder );

			// Assert.
			expect( result.sizeValue ).toEqual( { size: '', unit: 'rem' } );
		} );

		it( 'should return sizeValue with null when value has no size and no unit', () => {
			// Arrange.
			const value = { size: null, unit: null } as unknown as SizePropValue[ 'value' ];

			// Act.
			const result = resolveBoundPropValue( value );

			// Assert.
			expect( result.sizeValue ).toEqual( null );
		} );

		it( 'should return null sizeValue when value && boundPropPlaceholder are invalid size', () => {
			// Arrange.
			const value = null;
			const boundPropPlaceholder = { size: undefined, unit: 'em' } as unknown as SizePropValue[ 'value' ];

			// Act.
			const result = resolveBoundPropValue( value, boundPropPlaceholder );

			// Assert.
			expect( result.sizeValue ).toEqual( null );
		} );
	} );

	describe( 'placeholder', () => {
		it( 'should return propPlaceholder when provided', () => {
			// Arrange.
			const value = null;
			const propPlaceholder = 'Custom placeholder';

			// Act.
			const result = resolveBoundPropValue( value, undefined, propPlaceholder );

			// Assert.
			expect( result.placeholder ).toBe( 'Custom placeholder' );
		} );

		it( 'should return undefined when no placeholders provided', () => {
			// Arrange.
			const value = { size: 10, unit: 'px' as const };

			// Act.
			const result = resolveBoundPropValue( value );

			// Assert.
			expect( result.placeholder ).toBeUndefined();
		} );

		it( 'should derive placeholder from boundPropPlaceholder size when number', () => {
			// Arrange.
			const value = null;
			const boundPropPlaceholder = { size: 50, unit: 'px' as const };

			// Act.
			const result = resolveBoundPropValue( value, boundPropPlaceholder );

			// Assert.
			expect( result.placeholder ).toBe( '50' );
		} );

		it( 'should derive placeholder from boundPropPlaceholder size when string', () => {
			// Arrange.
			const value = null;
			const boundPropPlaceholder = { size: 'calc(100% - 10px)', unit: 'custom' as const };

			// Act.
			const result = resolveBoundPropValue( value, boundPropPlaceholder );

			// Assert.
			expect( result.placeholder ).toBe( 'calc(100% - 10px)' );
		} );

		it( 'should return undefined when boundPropPlaceholder size is undefined', () => {
			// Arrange.
			const value = null;
			const boundPropPlaceholder = { size: undefined, unit: 'px' } as unknown as SizePropValue[ 'value' ];

			// Act.
			const result = resolveBoundPropValue( value, boundPropPlaceholder );

			// Assert.
			expect( result.placeholder ).toBeUndefined();
		} );

		it( 'should prefer propPlaceholder over boundPropPlaceholder', () => {
			// Arrange.
			const value = null;
			const boundPropPlaceholder = { size: 99, unit: 'px' as const };
			const propPlaceholder = 'Prop wins';

			// Act.
			const result = resolveBoundPropValue( value, boundPropPlaceholder, propPlaceholder );

			// Assert.
			expect( result.placeholder ).toBe( 'Prop wins' );
		} );

		it( 'should derive placeholder from propPlaceholder when it is a SizeValue', () => {
			// Arrange.
			const value = null;
			const propPlaceholder = { size: 12, unit: 'rem' as const };

			// Act.
			const result = resolveBoundPropValue( value, undefined, propPlaceholder );

			// Assert.
			expect( result.placeholder ).toBe( '12' );
		} );
	} );

	describe( 'propPlaceholder as SizeValue', () => {
		it( 'should use propPlaceholder as sizeValue with empty size when value is null', () => {
			// Arrange.
			const value = null;
			const propPlaceholder = { size: 16, unit: 'px' as const };

			// Act.
			const result = resolveBoundPropValue( value, undefined, propPlaceholder );

			// Assert.
			expect( result.sizeValue ).toEqual( { size: '', unit: 'px' } );
		} );

		it( 'should prefer propPlaceholder SizeValue over boundPropPlaceholder for sizeValue', () => {
			// Arrange.
			const value = null;
			const boundPropPlaceholder = { size: 8, unit: 'em' as const };
			const propPlaceholder = { size: 24, unit: 'rem' as const };

			// Act.
			const result = resolveBoundPropValue( value, boundPropPlaceholder, propPlaceholder );

			// Assert.
			expect( result.sizeValue ).toEqual( { size: '', unit: 'rem' } );
			expect( result.placeholder ).toBe( '24' );
		} );

		it( 'should not use propPlaceholder SizeValue when value is valid', () => {
			// Arrange.
			const value = { size: 5, unit: 'px' as const };
			const propPlaceholder = { size: 99, unit: 'rem' as const };

			// Act.
			const result = resolveBoundPropValue( value, undefined, propPlaceholder );

			// Assert.
			expect( result.sizeValue ).toEqual( { size: 5, unit: 'px' } );
			expect( result.placeholder ).toBe( undefined );
		} );
	} );
} );
