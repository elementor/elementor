import { type SizePropValue } from '@elementor/editor-props';
import { act, renderHook } from '@testing-library/react';

import { useUnitSync } from '../use-unit-sync';

const sizeValue: SizePropValue[ 'value' ] = {
	unit: 'px',
	size: 0,
};

describe( 'useUnitSync', () => {
	it( 'should initialize state from unit prop', () => {
		// Arrange.
		const setUnit = jest.fn();

		// Act.
		const { result } = renderHook( () =>
			useUnitSync( {
				sizeValue,
				setUnit,
				persistWhen: () => true,
			} )
		);

		// Assert.
		expect( result.current[ 0 ] ).toBe( 'px' );
		expect( result.current[ 1 ] ).toEqual( expect.any( Function ) );
	} );

	it( 'should call setUnit when persistWhen returns true', () => {
		// Arrange.
		const setUnit = jest.fn();

		const { result } = renderHook( () =>
			useUnitSync( {
				sizeValue,
				setUnit,
				persistWhen: () => true,
			} )
		);

		// Act.
		act( () => result.current[ 1 ]( 'rem' ) );

		// Assert.
		expect( setUnit ).toHaveBeenCalledTimes( 1 );
		expect( setUnit ).toHaveBeenCalledWith( 'rem' );
		expect( result.current[ 0 ] ).toBe( 'rem' );
	} );

	it( 'should not call setUnit when persistWhen returns false', () => {
		// Arrange.
		const setUnit = jest.fn();

		const { result } = renderHook( () =>
			useUnitSync( {
				sizeValue,
				setUnit,
				persistWhen: () => false,
			} )
		);

		// Act.
		act( () => result.current[ 1 ]( 'rem' ) );

		// Assert.
		expect( setUnit ).not.toHaveBeenCalled();
		expect( result.current[ 0 ] ).toBe( 'rem' );
	} );

	it.each( [ 'auto', 'custom' ] as const )(
		'should call setUnit when selecting extended unit %s even if persistWhen returns false',
		( extendedUnit ) => {
			// Arrange.
			const setUnit = jest.fn();

			const { result } = renderHook( () =>
				useUnitSync( {
					sizeValue,
					setUnit,
					persistWhen: () => false,
				} )
			);

			// Act.
			act( () => result.current[ 1 ]( extendedUnit ) );

			// Assert.
			expect( setUnit ).toHaveBeenCalledTimes( 1 );
			expect( setUnit ).toHaveBeenCalledWith( extendedUnit );
			expect( result.current[ 0 ] ).toBe( extendedUnit );
		}
	);

	it( 'should sync state when unit prop changes', () => {
		// Arrange.
		const setUnit = jest.fn();

		const { result, rerender } = renderHook(
			( { propSizeValue }: { propSizeValue: SizePropValue[ 'value' ] } ) =>
				useUnitSync( {
					sizeValue: propSizeValue,
					setUnit,
					persistWhen: () => true,
				} ),
			{ initialProps: { propSizeValue: { unit: 'px', size: 0 } } }
		);

		expect( result.current[ 0 ] ).toBe( 'px' );

		// Act.
		rerender( { propSizeValue: { unit: 'em', size: 0 } } );

		// Assert.
		expect( result.current[ 0 ] ).toBe( 'em' );
	} );

	it( 'should overwrite local state when unit prop changes after a non-persisted selection', () => {
		// Arrange.
		const setUnit = jest.fn();

		const { result, rerender } = renderHook(
			( { propSizeValue }: { propSizeValue: SizePropValue[ 'value' ] } ) =>
				useUnitSync( {
					sizeValue: propSizeValue,
					setUnit,
					persistWhen: () => false,
				} ),
			{ initialProps: { propSizeValue: { unit: 'px', size: 0 } } }
		);

		act( () => result.current[ 1 ]( 'rem' ) );
		expect( result.current[ 0 ] ).toBe( 'rem' );
		expect( setUnit ).not.toHaveBeenCalled();

		// Act.
		rerender( { propSizeValue: { unit: 'em', size: 0 } } );

		// Assert.
		expect( result.current[ 0 ] ).toBe( 'em' );
	} );

	it( 'should reflect external unit when parent rerenders with same prop after non-persisted % selection', () => {
		// Arrange.
		const setUnit = jest.fn();

		const { result, rerender } = renderHook(
			( { propSizeValue }: { propSizeValue: SizePropValue[ 'value' ] } ) =>
				useUnitSync( {
					sizeValue: propSizeValue,
					setUnit,
					persistWhen: () => false,
				} ),
			{ initialProps: { propSizeValue: { unit: 'rem', size: 0 } } }
		);

		expect( result.current[ 0 ] ).toBe( 'rem' );

		// Act.
		act( () => result.current[ 1 ]( '%' ) );

		// Assert.
		expect( setUnit ).not.toHaveBeenCalled();
		expect( result.current[ 0 ] ).toBe( '%' );

		// Act.
		rerender( { propSizeValue: { unit: 'rem', size: 3 } } );

		// Assert.
		expect( result.current[ 0 ] ).toBe( 'rem' );
	} );

	it( 'should call persistWhen on each selection without stale closure from previous render', () => {
		// Arrange.
		const setUnit = jest.fn();
		const persistWhen = jest.fn().mockReturnValueOnce( false ).mockReturnValue( true );

		const { result, rerender } = renderHook(
			( { propSizeValue }: { propSizeValue: SizePropValue[ 'value' ] } ) =>
				useUnitSync( {
					sizeValue: propSizeValue,
					setUnit,
					persistWhen,
				} ),
			{ initialProps: { propSizeValue: { unit: 'px', size: 0 } } }
		);

		// Act.
		act( () => result.current[ 1 ]( 'rem' ) );
		rerender( { propSizeValue: { unit: 'rem', size: 0 } } );
		act( () => result.current[ 1 ]( 'em' ) );

		// Assert.
		expect( setUnit ).toHaveBeenCalledTimes( 1 );
		expect( setUnit ).toHaveBeenCalledWith( 'em' );
		expect( result.current[ 0 ] ).toBe( 'em' );
	} );
} );
