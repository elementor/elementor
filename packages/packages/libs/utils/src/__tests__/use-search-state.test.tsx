import { renderHook } from '@testing-library/react';

import { useSearchState } from '../index';

describe( 'useSearchState', () => {
	it( 'should return the expected interface', () => {
		const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

		expect( result.current ).toHaveProperty( 'debouncedValue' );
		expect( result.current ).toHaveProperty( 'inputValue' );
		expect( result.current ).toHaveProperty( 'handleChange' );
		expect( result.current ).toHaveProperty( 'setInputValue' );

		expect( typeof result.current.handleChange ).toBe( 'function' );
		expect( typeof result.current.setInputValue ).toBe( 'function' );
		expect( typeof result.current.debouncedValue ).toBe( 'string' );
		expect( typeof result.current.inputValue ).toBe( 'string' );
	} );

	it( 'should accept localStorageKey parameter', () => {
		const { result } = renderHook( () => useSearchState( { localStorageKey: 'custom-key' } ) );

		expect( result.current ).toBeDefined();
	} );
} );
