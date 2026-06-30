import * as React from 'react';
import { useContext } from 'react';
import { act, renderHook } from '@testing-library/react';

import { getSessionStorageItem, removeSessionStorageItem, setSessionStorageItem } from '../session-storage';
import { Context, SessionStorageProvider } from '../session-storage-context';
import { useSessionStorage } from '../use-session-storage';

jest.mock( '../session-storage' );

describe( 'useSessionStorage', () => {
	const key = 'testKey';
	const fullKey = `/${ key }`;

	it( 'should return value from session storage if available', () => {
		// Arrange.
		const storedValue = 'storedValue';
		jest.mocked( getSessionStorageItem ).mockReturnValue( storedValue );

		// Act.
		const { result } = renderHook( () => useSessionStorage( key ) );
		const [ value ] = result.current;

		// Assert.
		expect( getSessionStorageItem ).toHaveBeenCalledWith( fullKey );
		expect( value ).toBe( storedValue );
	} );

	it( 'should return null if session storage is empty', () => {
		// Arrange.
		jest.mocked( getSessionStorageItem ).mockReturnValue( undefined );

		// Act.
		const { result } = renderHook( () => useSessionStorage( key ) );
		const [ value ] = result.current;

		// Assert.
		expect( getSessionStorageItem ).toHaveBeenCalledWith( fullKey );
		expect( value ).toBe( null );
	} );

	it( 'should update value and save to session storage', () => {
		// Arrange.
		let sessionStorageReturnValue: unknown;
		jest.mocked( getSessionStorageItem ).mockImplementation( () => sessionStorageReturnValue );
		jest.mocked( setSessionStorageItem ).mockImplementation( ( eventKey: string, item: unknown ) => {
			sessionStorageReturnValue = item;
			window.dispatchEvent(
				new StorageEvent( 'storage', {
					key: eventKey,
					storageArea: sessionStorage,
				} )
			);
		} );

		const newValue = 'newValue';
		const { result } = renderHook( () => useSessionStorage( key ) );

		// Act.
		act( () => {
			const [ , setValue ] = result.current;
			setValue( newValue );
		} );
		const [ value ] = result.current;

		// Assert.
		expect( value ).toBe( newValue );
		expect( setSessionStorageItem ).toHaveBeenCalledWith( fullKey, newValue );
	} );

	it( 'should remove value and return null', () => {
		// Arrange.
		let sessionStorageReturnValue: unknown = 'storedValue';
		jest.mocked( getSessionStorageItem ).mockImplementation( () => sessionStorageReturnValue );
		jest.mocked( removeSessionStorageItem ).mockImplementation( ( eventKey: string ) => {
			sessionStorageReturnValue = undefined;
			window.dispatchEvent(
				new StorageEvent( 'storage', {
					key: eventKey,
					storageArea: sessionStorage,
				} )
			);
		} );

		const { result } = renderHook( () => useSessionStorage( key ) );

		// Act.
		act( () => {
			const [ , , removeValue ] = result.current;
			removeValue();
		} );
		const [ value ] = result.current;

		// Assert.
		expect( removeSessionStorageItem ).toHaveBeenCalledWith( fullKey );
		expect( value ).toBe( null );
	} );

	it( 'should chain prefixes', () => {
		// Arrange.
		jest.mocked( getSessionStorageItem ).mockReturnValue( undefined );

		// Act.
		const { result } = renderHook( () => useContext( Context ), {
			wrapper: ( { children } ) => (
				<SessionStorageProvider prefix={ 'testy' }>
					<SessionStorageProvider prefix={ 'test' }>{ children }</SessionStorageProvider>
				</SessionStorageProvider>
			),
		} );

		const value = result.current;

		// Assert.
		expect( value ).toEqual( { prefix: 'testy/test' } );
	} );
} );
