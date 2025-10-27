import { useBoundProp } from '@elementor/editor-controls';
import { colorPropTypeUtil, type createPropUtils, stringPropTypeUtil } from '@elementor/editor-props';
import { renderHook } from '@testing-library/react';

import { colorVariablePropTypeUtil } from '../../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../../prop-types/font-variable-prop-type';
import { useInitialValue } from '../use-initial-value';
import { useVariable } from '../use-prop-variables';

type PropTypeUtil = ReturnType< typeof createPropUtils >;

jest.mock( '@elementor/editor-controls', () => ( {
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../../variables-registry/variable-type-registry', () => ( {
	hasVariableType: jest.fn().mockImplementation( ( type: string ) => {
		const variableTypes = [ colorVariablePropTypeUtil, fontVariablePropTypeUtil ];
		return variableTypes.some( ( variableType ) => variableType.key === type );
	} ),
} ) );

jest.mock( '../use-prop-variables', () => ( {
	useVariable: jest.fn(),
} ) );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stubBoundPropValue( props: any ) {
	return {
		bind: 'sample-bind',
		setValue: jest.fn(),
		propType: props.propType as unknown as PropTypeUtil,
		path: [ 'sample-path' ],
		restoreValue: jest.fn(),
		value: props.value,
	};
}

describe( 'useInitialValue for assigned variables', () => {
	it( 'should return value of assigned color variable', () => {
		// Arrange.
		jest.mocked( useBoundProp ).mockReturnValue(
			stubBoundPropValue( {
				propType: colorVariablePropTypeUtil,
				value: colorVariablePropTypeUtil.create( 'e-gv-a01' ),
			} )
		);

		jest.mocked( useVariable ).mockReturnValue( {
			key: 'e-gv-a01',
			type: colorVariablePropTypeUtil.key,
			label: 'primary-text-color',
			value: 'rgba(0, 0, 0, 0.9)',
		} );

		// Act.
		const { result } = renderHook( () => {
			return useInitialValue();
		} );

		// Assert.
		expect( result.current ).toBe( 'rgba(0, 0, 0, 0.9)' );
	} );

	it( 'should return value of assigned font variable', () => {
		// Arrange.
		jest.mocked( useBoundProp ).mockReturnValue(
			stubBoundPropValue( {
				propType: fontVariablePropTypeUtil,
				value: fontVariablePropTypeUtil.create( 'e-gv-a02' ),
			} )
		);

		jest.mocked( useVariable ).mockReturnValue( {
			key: 'e-gv-a02',
			type: fontVariablePropTypeUtil.key,
			label: 'primary-font',
			value: 'Arial',
		} );

		// Act.
		const { result } = renderHook( () => {
			return useInitialValue();
		} );

		// Assert.
		expect( result.current ).toBe( 'Arial' );
	} );

	it( 'should return empty for missing (non-existing) variable', () => {
		// Arrange.
		jest.mocked( useBoundProp ).mockReturnValue(
			stubBoundPropValue( {
				propType: colorVariablePropTypeUtil,
				value: colorVariablePropTypeUtil.create( 'e-gv-a01' ),
			} )
		);

		jest.mocked( useVariable ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => {
			return useInitialValue();
		} );

		// Assert.
		expect( result.current ).toBe( '' );
	} );
} );

describe( 'useInitialValue for non-empty values', () => {
	it( 'should return value of assigned color', () => {
		// Arrange.
		jest.mocked( useBoundProp ).mockReturnValue(
			stubBoundPropValue( {
				propType: colorPropTypeUtil,
				value: colorPropTypeUtil.create( '#000000' ),
			} )
		);

		jest.mocked( useVariable ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => {
			return useInitialValue();
		} );

		// Assert.
		expect( result.current ).toBe( '#000000' );
	} );

	it( 'should return value of assigned font', () => {
		// Arrange.
		jest.mocked( useBoundProp ).mockReturnValue(
			stubBoundPropValue( {
				propType: stringPropTypeUtil,
				value: stringPropTypeUtil.create( 'Arial' ),
			} )
		);

		jest.mocked( useVariable ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => {
			return useInitialValue();
		} );

		// Assert.
		expect( result.current ).toBe( 'Arial' );
	} );
} );

describe( 'useInitialValue for empty values', () => {
	it( 'should return empty value for empty color value', () => {
		// Arrange.
		jest.mocked( useBoundProp ).mockReturnValue(
			stubBoundPropValue( {
				propType: colorPropTypeUtil,
				value: colorPropTypeUtil.create( '' ),
			} )
		);

		jest.mocked( useVariable ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => {
			return useInitialValue();
		} );

		// Assert.
		expect( result.current ).toBe( '' );
	} );

	it( 'should return empty value for empty font value', () => {
		// Arrange.
		jest.mocked( useBoundProp ).mockReturnValue(
			stubBoundPropValue( {
				propType: stringPropTypeUtil,
				value: stringPropTypeUtil.create( '' ),
			} )
		);

		jest.mocked( useVariable ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => {
			return useInitialValue();
		} );

		// Assert.
		expect( result.current ).toBe( '' );
	} );

	it( 'should return empty for unset (null) value', () => {
		// Arrange.
		jest.mocked( useBoundProp ).mockReturnValue(
			stubBoundPropValue( {
				propType: colorPropTypeUtil,
				value: null,
			} )
		);

		jest.mocked( useVariable ).mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => {
			return useInitialValue();
		} );

		// Assert.
		expect( result.current ).toBe( '' );
	} );
} );
