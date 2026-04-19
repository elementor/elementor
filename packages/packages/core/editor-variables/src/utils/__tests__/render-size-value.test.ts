import { sizePropTypeUtil } from '@elementor/editor-props';

import { getVariable } from '../../hooks/use-prop-variables';
import { customSizeVariablePropTypeUtil, sizeVariablePropTypeUtil } from '../../prop-types';
import { renderSizeValue } from '../render-size-value';

jest.mock( '../../hooks/use-prop-variables' );

const CUSTOM_SIZE_EMPTY_LABEL = 'fx';
const CUSTOM_SIZE_VARIABLE_ID = 'custom-size-var-1';
const RESOLVED_CUSTOM_SIZE = '12%';
const RESOLVED_SIZE = '8px';
const SIZE_VARIABLE_ID = 'size-var-1';

describe( 'renderSizeValue', () => {
	beforeEach( () => {
		jest.mocked( getVariable ).mockReset();
	} );

	it( 'should return the registry value for a size variable', () => {
		// Arrange
		jest.mocked( getVariable ).mockReturnValue( { value: RESOLVED_SIZE } as ReturnType< typeof getVariable > );
		const value = sizeVariablePropTypeUtil.create( SIZE_VARIABLE_ID );

		// Act
		const result = renderSizeValue( value );

		// Assert
		expect( getVariable ).toHaveBeenCalledWith( SIZE_VARIABLE_ID );
		expect( result ).toBe( RESOLVED_SIZE );
	} );

	it( 'should return the registry value for a custom size variable', () => {
		// Arrange
		jest.mocked( getVariable ).mockReturnValue( {
			value: RESOLVED_CUSTOM_SIZE,
		} as ReturnType< typeof getVariable > );
		const value = customSizeVariablePropTypeUtil.create( CUSTOM_SIZE_VARIABLE_ID );

		// Act
		const result = renderSizeValue( value );

		// Assert
		expect( getVariable ).toHaveBeenCalledWith( CUSTOM_SIZE_VARIABLE_ID );
		expect( result ).toBe( RESOLVED_CUSTOM_SIZE );
	} );

	it( 'should concatenate numeric size and unit for a plain size prop', () => {
		// Arrange
		const value = sizePropTypeUtil.create( { size: 16, unit: 'px' } );

		// Act
		const result = renderSizeValue( value );

		// Assert
		expect( result ).toBe( '16px' );
	} );

	it( 'should use the custom empty label when unit is custom and size is empty', () => {
		// Arrange
		const value = sizePropTypeUtil.create( { size: '', unit: 'custom' } );

		// Act
		const result = renderSizeValue( value );

		// Assert
		expect( result ).toBe( CUSTOM_SIZE_EMPTY_LABEL );
	} );

	it( 'should render custom unit text when unit is custom and size is non-empty', () => {
		// Arrange
		const customExpression = 'calc(10px + 1vw)';
		const value = sizePropTypeUtil.create( { size: customExpression, unit: 'custom' } );

		// Act
		const result = renderSizeValue( value );

		// Assert
		expect( result ).toBe( customExpression );
	} );

	it( 'should render auto when unit is auto and size is empty', () => {
		// Arrange
		const value = sizePropTypeUtil.create( { size: '', unit: 'auto' } );

		// Act
		const result = renderSizeValue( value );

		// Assert
		expect( result ).toBe( 'auto' );
	} );

	it( 'should return an empty string when the value is not a size or size variable', () => {
		// Arrange
		const value = { $$type: 'color' as const, value: '#000000' };

		// Act
		const result = renderSizeValue( value );

		// Assert
		expect( result ).toBe( '' );
	} );
} );
