import { act } from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { getSessionStorageItem, setSessionStorageItem } from '@elementor/session';
import { renderHook } from '@testing-library/react';

import { useElement } from '../../contexts/element-context';
import { useStateByElement } from '../use-state-by-element';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../contexts/element-context' );
jest.mock( '@elementor/session' );

describe( 'useStateByElement', () => {
	let store: Record< string, unknown > = {};
	beforeEach( () => {
		store = {};
		jest.mocked( isExperimentActive ).mockReturnValue( true );
		jest.mocked( useElement ).mockReturnValue( {
			element: {
				id: 'test-element-id',
			},
		} as unknown as ReturnType< typeof useElement > );
		jest.mocked( getSessionStorageItem ).mockImplementation( ( key: string ) => store[ key ] );
		jest.mocked( setSessionStorageItem ).mockImplementation( ( key: string, value: unknown ) => {
			store[ key ] = value;
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return the initial value when no session storage item is found', () => {
		// Arrange
		const key = 'testKey';
		const initialValue = 'initial';

		// Act
		const { result } = renderHook( () => useStateByElement( key, initialValue ) );

		// Assert
		expect( result.current[ 0 ] ).toStrictEqual( initialValue );
	} );

	it( 'should return the stored value when it exists in session storage', () => {
		// Arrange
		const key = 'testKey';
		const initialValue = 'initial';
		const storedValue = 'storedValue';
		store[ `elementor/editor-state/test-element-id/${ key }` ] = storedValue;

		// Act
		const { result } = renderHook( () => useStateByElement( key, initialValue ) );

		// Assert
		expect( result.current[ 0 ] ).toStrictEqual( storedValue );
	} );

	it( 'should update the session storage and state when the value changes', () => {
		// Arrange
		const key = 'testKey';
		const initialValue = 'initial';
		const { result } = renderHook( () => useStateByElement( key, initialValue ) );
		const value1 = 'value1';
		const value2 = 'value2';

		// Act
		act( () => {
			result.current[ 1 ]( value1 );
		} );
		const result1 = result.current[ 0 ];
		act( () => {
			result.current[ 1 ]( value2 );
		} );
		const result2 = result.current[ 0 ];

		// Assert
		expect( result1 ).toStrictEqual( value1 );
		expect( result2 ).toStrictEqual( value2 );
	} );
} );
