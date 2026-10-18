import { getElementStateParamsInScope } from '@elementor/editor-elements';

import { getStateVariables, isStateVariableKey } from '../state-variables';

jest.mock( '@elementor/editor-elements' );

const ELEMENT_ID = 'element-1';

describe( 'state variables', () => {
	beforeEach( () => {
		jest.mocked( getElementStateParamsInScope ).mockReturnValue( [
			{
				key: 'tint',
				label: 'Tint',
				type: 'string',
				prop_type: 'color',
				default: { $$type: 'color', value: '#fff' },
			},
			{ key: 'progress', label: 'Progress', type: 'number', prop_type: 'number', default: 40 },
			{
				key: 'gap',
				label: 'Gap',
				type: 'json',
				prop_type: 'size',
				default: { $$type: 'size', value: { size: 4, unit: 'px' } },
			},
			{ key: 'open', label: 'Open', type: 'boolean', prop_type: 'boolean', default: false },
		] );
	} );

	it( 'should offer color state keys only to color variable controls', () => {
		// Act
		const result = getStateVariables( ELEMENT_ID, 'color' );

		// Assert
		expect( result ).toEqual( [ { key: 'e-state-tint', label: 'State: Tint', value: '#fff' } ] );
	} );

	it( 'should offer number and size state keys to size variable controls', () => {
		// Act
		const result = getStateVariables( ELEMENT_ID, 'size' );

		// Assert
		expect( result.map( ( { key, value } ) => [ key, value ] ) ).toEqual( [
			[ 'e-state-progress', '40' ],
			[ 'e-state-gap', '4px' ],
		] );
	} );

	it( 'should return nothing without a selected element', () => {
		// Act
		const result = getStateVariables( undefined, 'color' );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should recognize state variable keys', () => {
		// Assert
		expect( isStateVariableKey( 'e-state-tint' ) ).toBe( true );
		expect( isStateVariableKey( 'e-gv-123' ) ).toBe( false );
	} );
} );
