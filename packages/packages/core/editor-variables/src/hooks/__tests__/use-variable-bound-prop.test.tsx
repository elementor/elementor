import { createMockPropType } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { colorPropTypeUtil } from '@elementor/editor-props';
import { BrushIcon } from '@elementor/icons';
import { renderHook } from '@testing-library/react';

import { ColorField } from '../../components/fields/color-field';
import { useVariableType } from '../../context/variable-type-context';
import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { resolveBoundPropAndSetValue, useVariableBoundProp } from '../use-variable-bound-prop';

// Mock dependencies
jest.mock( '@elementor/editor-controls', () => ( {
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../../context/variable-type-context', () => ( {
	useVariableType: jest.fn(),
} ) );

const mockUseBoundProp = jest.mocked( useBoundProp );
const mockUseVariableType = jest.mocked( useVariableType );

function createMockBoundProp( overrides: Partial< Record< string, string > > = {} ): ReturnType< typeof useBoundProp > {
	return {
		bind: 'test-bind',
		setValue: jest.fn(),
		value: null,
		propType: createMockPropType(),
		placeholder: null,
		path: [ 'background', 'color' ],
		restoreValue: jest.fn(),
		isDisabled: jest.fn(),
		disabled: false,
		...overrides,
	};
}

describe( 'useVariableBoundProp', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		mockUseVariableType.mockReturnValue( {
			propTypeUtil: colorVariablePropTypeUtil,
			icon: BrushIcon,
			valueField: ColorField,
			variableType: 'color',
			startIcon: () => ( { type: 'div' } ) as JSX.Element,
			fallbackPropTypeUtil: colorPropTypeUtil,
		} );
	} );

	it( 'should return bounded prop with custom setValue function', () => {
		// Arrange
		const mockBoundProp = createMockBoundProp( {
			value: 'e-gv-a01',
			placeholder: 'e-gv-placeholder',
		} );

		mockUseBoundProp.mockReturnValue( mockBoundProp );

		// Act
		const { result } = renderHook( () => useVariableBoundProp() );

		// Assert
		expect( result.current ).toEqual( {
			...mockBoundProp,
			setValue: expect.any( Function ),
			value: 'e-gv-a01',
		} );
	} );

	it( 'should use placeholder when value is null', () => {
		// Arrange
		const mockBoundProp = createMockBoundProp( {
			placeholder: 'e-gv-placeholder',
		} );

		mockUseBoundProp.mockReturnValue( mockBoundProp );

		// Act
		const { result } = renderHook( () => useVariableBoundProp() );

		// Assert
		expect( result.current.value ).toBe( 'e-gv-placeholder' );
	} );

	it( 'should use placeholder when value is undefined', () => {
		// Arrange
		const mockBoundProp = createMockBoundProp( {
			value: undefined,
			placeholder: 'e-gv-placeholder',
		} );

		mockUseBoundProp.mockReturnValue( mockBoundProp );

		// Act
		const { result } = renderHook( () => useVariableBoundProp() );

		// Assert
		expect( result.current.value ).toBe( 'e-gv-placeholder' );
	} );

	it( 'should call resolveBoundPropAndSetValue when setValue is called', () => {
		// Arrange
		const mockBoundProp = createMockBoundProp();
		mockUseBoundProp.mockReturnValue( mockBoundProp );

		// Act
		const { result } = renderHook( () => useVariableBoundProp() );
		result.current.setValue( 'new-value' );

		// Assert
		expect( mockBoundProp.setValue ).toHaveBeenCalledWith( 'new-value' );
	} );
} );

describe( 'resolveBoundPropAndSetValue', () => {
	let mockBoundProp: ReturnType< typeof createMockBoundProp >;

	beforeEach( () => {
		mockBoundProp = createMockBoundProp();
	} );

	it( 'should set null when no current value and new value matches placeholder', () => {
		// Arrange
		mockBoundProp.value = null;
		mockBoundProp.placeholder = 'e-gv-placeholder';

		// Act
		resolveBoundPropAndSetValue( 'e-gv-placeholder', mockBoundProp );

		// Assert
		expect( mockBoundProp.setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should set value when no current value and new value does not match placeholder', () => {
		// Arrange
		mockBoundProp.value = null;
		mockBoundProp.placeholder = 'e-gv-placeholder';

		// Act
		resolveBoundPropAndSetValue( 'e-gv-new-value', mockBoundProp );

		// Assert
		expect( mockBoundProp.setValue ).toHaveBeenCalledWith( 'e-gv-new-value' );
	} );

	it( 'should set value when current value exists', () => {
		// Arrange
		mockBoundProp.value = 'e-gv-current';
		mockBoundProp.placeholder = 'e-gv-placeholder';

		// Act
		resolveBoundPropAndSetValue(
			{
				$$type: 'size-variable',
				value: 'e-gv-current',
			},
			mockBoundProp
		);

		// Assert
		expect( mockBoundProp.setValue ).toHaveBeenCalledWith( {
			$$type: 'size-variable',
			value: 'e-gv-current',
		} );
	} );

	it( 'should handle object values with value property', () => {
		// Arrange
		mockBoundProp.value = null;
		mockBoundProp.placeholder = { value: 'e-gv-placeholder' };

		// Act
		resolveBoundPropAndSetValue( { value: 'e-gv-placeholder' }, mockBoundProp );

		// Assert
		expect( mockBoundProp.setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should handle mixed string and object values', () => {
		// Arrange
		mockBoundProp.value = null;
		mockBoundProp.placeholder = 'e-gv-placeholder';

		// Act
		resolveBoundPropAndSetValue( { value: 'e-gv-placeholder' }, mockBoundProp );

		// Assert
		expect( mockBoundProp.setValue ).toHaveBeenCalledWith( null );
	} );
} );
