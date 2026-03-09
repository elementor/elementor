import { type SizePropValue } from '@elementor/editor-props';
import { act, renderHook } from '@testing-library/react';

import { isExtendedUnit } from '../../utils/is-extended-unit';
import { useSizeValue } from '../use-size-value';

jest.mock( '../../utils/is-extended-unit' );

const mockIsExtendedUnit = jest.mocked( isExtendedUnit );

const renderSizeValueHook = ( props = {} ) => {
	const onChange = jest.fn();

	return renderHook( () =>
		useSizeValue( {
			value: null,
			onChange,
			units: [ 'px' ],
			...props,
		} )
	);
};

describe( 'useSizeValue', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsExtendedUnit.mockReturnValue( false );
	} );

	describe( 'Initial state', () => {
		it( 'should return unit, size, setSize and setUnit from the hook', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'rem',
				},
				units: [ 'rem' ],
			} );

			// Assert.
			expect( result.current ).toEqual( {
				size: 10,
				unit: 'rem',
				setSize: expect.any( Function ),
				setUnit: expect.any( Function ),
			} );
		} );

		it( 'should return empty size and unit auto when unit is auto (extended)', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 5,
					unit: 'auto',
				},
				units: [ 'auto' ],
			} );

			// Assert.
			expect( result.current.size ).toBe( '' );
			expect( result.current.unit ).toBe( 'auto' );
		} );

		it( 'should return empty size and unit auto when unit is auto and size is null', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: null,
					unit: 'auto',
				},
				units: [ 'auto' ],
			} );

			// Assert.
			expect( result.current.size ).toBe( '' );
			expect( result.current.unit ).toBe( 'auto' );
		} );

		it( 'should return string size and unit custom when unit is custom', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 'calc(100% - 10px)',
					unit: 'custom',
				},
				units: [ 'custom' ],
			} );

			// Assert.
			expect( result.current.size ).toBe( 'calc(100% - 10px)' );
			expect( result.current.unit ).toBe( 'custom' );
		} );

		it( 'should return empty size for custom unit when size is null', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: null,
					unit: 'custom',
				},
				units: [ 'custom' ],
			} );

			// Assert.
			expect( result.current.size ).toBe( '' );
			expect( result.current.unit ).toBe( 'custom' );
		} );

		it( 'should return empty size when size is null and unit is standard', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: null,
					unit: 'px',
				},
				units: [ 'px' ],
			} );

			// Assert.
			expect( result.current.size ).toBe( '' );
			expect( result.current.unit ).toBe( 'px' );
		} );

		it( 'should return empty size when size is undefined and unit is standard', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: undefined,
					unit: 'px',
				},
				units: [ 'px' ],
			} );

			// Assert.
			expect( result.current.size ).toBe( '' );
			expect( result.current.unit ).toBe( 'px' );
		} );

		it( 'should use defaultUnit when value is null', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				units: [ 'px', 'em' ],
				defaultUnit: 'em',
			} );

			// Assert.
			expect( result.current.unit ).toBe( 'em' );
			expect( result.current.size ).toBe( '' );
		} );

		it( 'should use first unit in units list as default when value is null and defaultUnit is not provided', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				units: [ 'px' ],
			} );

			// Assert.
			expect( result.current.unit ).toBe( 'px' );
			expect( result.current.size ).toBe( '' );
		} );
	} );

	describe( 'resolveSizeValue', () => {
		it( 'should resolve unit to defaultUnit when value unit is not in units list', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 1,
					unit: 'ch',
				},
				units: [ 'px', 'vh', 'vw' ],
				defaultUnit: 'vw',
			} );

			expect( result.current.unit ).toBe( 'vw' );
			expect( result.current.size ).toBe( 1 );
		} );

		it( 'should fallback to first unit in units list as default if provided default unit and value unit doesnt conform to units list', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 2,
					unit: 'deg',
				},
				units: [ 'ch', 'vh', 'vw' ],
				defaultUnit: 'turn',
			} );

			expect( result.current.unit ).toBe( 'ch' );
			expect( result.current.size ).toBe( 2 );
		} );

		it( 'should fallback to first unit in unit list if provided default unit and value unit conform to units list', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 3,
					unit: 'grad',
				},
				units: [ 'deg', 'turn', 'rad' ],
				defaultUnit: 'ch',
			} );

			expect( result.current.unit ).toBe( 'deg' );
			expect( result.current.size ).toBe( 3 );
		} );

		it( 'should fallback to empty unit value if provided units list is empty', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 3,
					unit: 'grad',
				},
				units: [],
				defaultUnit: 'ch',
			} );

			expect( result.current.unit ).toBe( '' );
			expect( result.current.size ).toBe( 3 );
		} );

		it( 'should resolve unit first unit in units list when value unit is not in units list and defaultUnit is not provided', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 90,
					unit: 'ch',
				},
				units: [ 'rem', 'px', 'vh' ],
			} );

			expect( result.current.unit ).toBe( 'rem' );
			expect( result.current.size ).toBe( 90 );
		} );
	} );

	describe( 'setSize', () => {
		it( 'should update size with number and call onChange', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 0,
					unit: 'px',
				},
				units: [ 'px' ],
				onChange,
			} );

			act( () => {
				result.current.setSize( '42' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: 42, unit: 'px' } );
		} );

		it( 'should not call onChange with null when input is cleared and external size is also empty', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: '',
					unit: 'px',
				},
				onChange,
			} );

			act( () => result.current.setSize( '' ) );

			// Assert — should not revert to external (no null signal) while mid-edit
			expect( onChange ).not.toHaveBeenCalledWith( null );
		} );

		it( 'should set size to empty string when value is empty string and call onChange', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				units: [ 'px' ],
				onChange,
			} );

			act( () => {
				result.current.setSize( '' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: '', unit: 'px' } );
			expect( result.current.size ).toBe( '' );
		} );

		it( 'should trim whitespace and convert to number', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 0,
					unit: 'px',
				},
				units: [ 'px' ],
				onChange,
			} );

			act( () => {
				result.current.setSize( '  24  ' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: 24, unit: 'px' } );
			expect( result.current.unit ).toBe( 'px' );
		} );

		it( 'should call onChange with size empty string when setSize with non-numeric string', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				units: [ 'px' ],
				onChange,
			} );

			act( () => {
				result.current.setSize( 'abc' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: '', unit: 'px' } );
		} );

		it( 'should accept zero as valid size', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				units: [ 'px' ],
				onChange,
			} );

			act( () => {
				result.current.setSize( '0' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: 0, unit: 'px' } );
		} );

		it( 'should set size to empty string when value is only whitespace', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				units: [ 'px' ],
				onChange,
			} );

			act( () => {
				result.current.setSize( '   ' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: '', unit: 'px' } );
		} );

		it( 'should accept decimal size', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 0,
					unit: 'px',
				},
				units: [ 'px' ],
				onChange,
			} );

			act( () => {
				result.current.setSize( '12.5' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: 12.5, unit: 'px' } );
		} );

		it( 'should accept negative size', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				units: [ 'px' ],
				onChange,
			} );

			act( () => {
				result.current.setSize( '-10' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: -10, unit: 'px' } );
		} );

		it( 'should not call onChange with size when unit is auto', () => {
			// Arrange.
			mockIsExtendedUnit.mockReturnValue( true );
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: '',
					unit: 'auto',
				},
				units: [ 'px', 'auto' ],
				onChange,
			} );

			act( () => result.current.setSize( '50' ) );

			// Assert.
			expect( onChange ).not.toHaveBeenCalled();
			expect( result.current.unit ).toBe( 'auto' );
			expect( result.current.size ).toBe( '' );
		} );

		it( 'should not call onChange with string size while unit is custom', () => {
			// Arrange.
			mockIsExtendedUnit.mockReturnValue( true );
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 'calc(100% - 10px)',
					unit: 'custom',
				},
				units: [ 'px', 'custom' ],
				onChange,
			} );

			act( () => result.current.setSize( 'calc(50% + 5px)' ) );

			// Assert.
			expect( onChange ).not.toHaveBeenCalledWith( { size: '', unit: 'custom' } );
			expect( result.current.unit ).toBe( 'custom' );
			expect( result.current.size ).toBe( 'calc(100% - 10px)' );
		} );

		it( 'should not call onChange with null when setSize sets same value as external ( hasChanged = false )', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				onChange,
			} );

			act( () => result.current.setSize( '42' ) );
			expect( onChange ).toHaveBeenLastCalledWith( { size: 42, unit: 'px' } );

			act( () => result.current.setSize( '10' ) );
			expect( onChange ).not.toHaveBeenLastCalledWith( null );
		} );
	} );

	describe( 'setUnit', () => {
		it( 'should update unit and call onChange with new unit', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				units: [ 'px', 'rem' ],
				onChange,
			} );

			act( () => {
				result.current.setUnit( 'rem' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: 10, unit: 'rem' } );
			expect( result.current.unit ).toBe( 'rem' );
		} );

		it( 'should update unit to extended unit auto and call onChange', () => {
			// Arrange.
			mockIsExtendedUnit.mockReturnValue( true );
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 234,
					unit: 'px',
				},
				units: [ 'px', 'auto' ],
				onChange,
			} );

			act( () => {
				result.current.setUnit( 'auto' );
			} );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( { size: '', unit: 'auto' } );
			expect( result.current.unit ).toBe( 'auto' );
		} );

		it( 'should update unit to custom and call onChange', () => {
			// Arrange.
			mockIsExtendedUnit.mockReturnValue( true );
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 'calc(10px * 2)',
					unit: 'px',
				},
				units: [ 'px', 'custom' ],
				onChange,
			} );

			act( () => {
				result.current.setUnit( 'custom' );
			} );

			expect( onChange ).toHaveBeenCalledWith( { size: '', unit: 'custom' } );
			expect( result.current.unit ).toBe( 'custom' );
		} );

		it( 'should not call onChange with null when setUnit sets same unit as external ( hasChanged = false )', () => {
			// Arrange.
			const onChange = jest.fn();

			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				units: [ 'px', 'rem' ],
				onChange,
			} );

			act( () => result.current.setUnit( 'rem' ) );
			expect( onChange ).toHaveBeenLastCalledWith( { size: 10, unit: 'rem' } );

			act( () => result.current.setUnit( 'px' ) );
			expect( onChange ).not.toHaveBeenLastCalledWith( null );
		} );
	} );

	describe( 'sync from external', () => {
		it( 'should update size and unit when externalValue changes', () => {
			// Arrange.
			const onChange = jest.fn();
			const { result, rerender } = renderHook(
				( { value } ) => useSizeValue( { value, onChange, units: [ 'px', '%' ] } ),
				{
					initialProps: {
						value: { size: 5, unit: 'px' },
					},
				}
			);

			expect( result.current.unit ).toBe( 'px' );
			expect( result.current.size ).toBe( 5 );

			// Act.
			rerender( {
				value: { size: 10, unit: '%' },
			} );

			// Assert.
			expect( result.current.unit ).toBe( '%' );
			expect( result.current.size ).toBe( 10 );
		} );

		it( 'should show empty size and unit auto when externalValue switches to auto', () => {
			// Arrange.
			const onChange = jest.fn();
			const { result, rerender } = renderHook(
				( { value } ) => useSizeValue( { value, onChange, units: [ 'px', 'auto' ] } ),
				{
					initialProps: {
						value: { size: 10, unit: 'px' },
					},
				}
			);

			rerender( {
				value: { size: 10, unit: 'auto' },
			} );

			expect( result.current.size ).toBe( '' );
			expect( result.current.unit ).toBe( 'auto' );
		} );

		it( 'should keep reflecting same size and unit when externalValue is rerendered with same value', () => {
			// Arrange.
			const onChange = jest.fn();
			const value = { size: 10, unit: 'px' };

			const { result, rerender } = renderHook(
				( { value: ext } ) => useSizeValue( { value: ext, onChange, units: [ 'px' ] } ),
				{
					initialProps: { value },
				}
			);

			expect( result.current.size ).toBe( 10 );
			expect( result.current.unit ).toBe( 'px' );

			rerender( { value: { size: 10, unit: 'px' } } );

			expect( result.current.size ).toBe( 10 );
			expect( result.current.unit ).toBe( 'px' );
		} );

		it( 'should reflect fallback state when externalValue is null and defaultUnit is provided after rerender', () => {
			// Arrange.
			const onChange = jest.fn();

			const { result, rerender } = renderHook(
				( { value } ) => useSizeValue( { value, onChange, units: [ 'px', 'em' ], defaultUnit: 'em' } ),
				{ initialProps: { value: null } }
			);

			expect( result.current.unit ).toBe( 'em' );
			expect( result.current.size ).toBe( '' );

			rerender( { value: null } );

			expect( result.current.unit ).toBe( 'em' );
			expect( result.current.size ).toBe( '' );
		} );

		it( 'should reflect fallback state with first unit picked when externalValue is null and defaultUnit is not provided', () => {
			// Arrange.
			const onChange = jest.fn();

			const { result } = renderHook(
				( { value } ) => useSizeValue( { value, onChange, units: [ 'vh', 'em' ] } ),
				{ initialProps: { value: null } }
			);

			expect( result.current.unit ).toBe( 'vh' );
			expect( result.current.size ).toBe( '' );
		} );

		it( 'should reflect fallback state with first unit picked when externalValue is null and defaultUnit is not in the units lists', () => {
			// Arrange.
			const onChange = jest.fn();

			const { result } = renderHook(
				( { value } ) => useSizeValue( { value, onChange, units: [ '%', 'em' ], defaultUnit: 'ch' } ),
				{ initialProps: { value: null } }
			);

			expect( result.current.unit ).toBe( '%' );
			expect( result.current.size ).toBe( '' );
		} );

		it( 'should reflect fallback state when externalValue changes from non-null to null', () => {
			// Arrange.
			type ExternalValue = { size: number; unit: string } | null;
			const onChange = jest.fn();

			const { result, rerender } = renderHook(
				( { value }: { value: ExternalValue } ) =>
					useSizeValue( { value, onChange, units: [ 'px' ], defaultUnit: 'vw' } ),
				{ initialProps: { value: { size: 20, unit: 'px' } as ExternalValue } }
			);

			expect( result.current.size ).toBe( 20 );
			expect( result.current.unit ).toBe( 'px' );

			rerender( { value: null } );

			expect( result.current.size ).toBe( '' );
			expect( result.current.unit ).toBe( 'px' );
		} );

		it( 'should reflect custom unit and string size when externalValue switches to custom', () => {
			// Arrange.
			const onChange = jest.fn();
			const { result, rerender } = renderHook(
				( { value }: { value: SizePropValue[ 'value' ] } ) =>
					useSizeValue( { value, onChange, units: [ 'px', 'custom' ] } ),
				{
					initialProps: {
						value: { size: 10, unit: 'px' },
					},
				}
			);

			rerender( {
				value: { size: 'calc(100% - 20px)', unit: 'custom' },
			} );

			expect( result.current.size ).toBe( 'calc(100% - 20px)' );
			expect( result.current.unit ).toBe( 'custom' );
		} );

		it( 'should overwrite internal state when externalValue changes to different value', () => {
			// Arrange.
			const onChange = jest.fn();

			const { result, rerender } = renderHook(
				( { value } ) => useSizeValue( { value, onChange, units: [ 'px' ] } ),
				{
					initialProps: {
						value: { size: 10, unit: 'px' },
					},
				}
			);

			act( () => result.current.setSize( '99' ) );
			expect( result.current.size ).toBe( 99 );

			rerender( { value: { size: 5, unit: 'px' } } );

			expect( result.current.size ).toBe( 5 );
			expect( result.current.unit ).toBe( 'px' );
		} );
	} );

	describe( 'negative and edge cases', () => {
		it( 'should return size and unit when external size is NaN and unit is standard', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: NaN,
					unit: 'px',
				},
			} );

			expect( result.current.size ).toBe( '' );
			expect( result.current.unit ).toBe( 'px' );
		} );

		it( 'should not throw when onChange is called multiple times in sequence', () => {
			// Act.
			const { result } = renderSizeValueHook( {
				value: {
					size: 10,
					unit: 'px',
				},
				units: [ 'px', 'rem', '%' ],
			} );

			expect( () => {
				act( () => result.current.setSize( '20' ) );
				act( () => result.current.setUnit( 'rem' ) );
				act( () => result.current.setSize( '30' ) );
				act( () => result.current.setUnit( '%' ) );
			} ).not.toThrow();

			expect( result.current.size ).toBe( 30 );
			expect( result.current.unit ).toBe( '%' );
		} );
	} );
} );
