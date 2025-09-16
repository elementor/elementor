import { act, renderHook } from '@testing-library/react';

import { useSearchState } from '../use-search-state';

const mockLocalStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

Object.defineProperty( window, 'localStorage', {
	value: mockLocalStorage,
} );

describe( 'useSearchState', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	describe( 'Basic functionality', () => {
		it( 'should return initial values when no localStorage key is provided', () => {
			// Act
			const { result } = renderHook( () => useSearchState( {} ) );

			// Assert
			expect( result.current.inputValue ).toBe( '' );
			expect( result.current.debouncedValue ).toBe( '' );
			expect( typeof result.current.handleChange ).toBe( 'function' );
		} );

		it( 'should handle input changes and update inputValue immediately', () => {
			// Arrange
			const { result } = renderHook( () => useSearchState( {} ) );

			// Act
			act( () => {
				result.current.handleChange( 'test search' );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( 'test search' );
		} );

		it( 'should debounce the debouncedValue with 300ms delay', () => {
			// Arrange
			const { result } = renderHook( () => useSearchState( {} ) );

			// Act
			act( () => {
				result.current.handleChange( 'test search' );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( 'test search' );
			expect( result.current.debouncedValue ).toBe( '' );

			// Act
			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( result.current.debouncedValue ).toBe( 'test search' );
		} );

		it( 'should cancel previous debounced calls when new input is provided', () => {
			// Arrange
			const { result } = renderHook( () => useSearchState( {} ) );

			// Act
			act( () => {
				result.current.handleChange( 'first search' );
			} );

			act( () => {
				jest.advanceTimersByTime( 200 );
			} );

			act( () => {
				result.current.handleChange( 'second search' );
			} );

			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( result.current.debouncedValue ).toBe( 'second search' );
		} );
	} );

	describe( 'localStorage integration', () => {
		it( 'should not interact with localStorage when no key is provided', () => {
			// Act
			renderHook( () => useSearchState( {} ) );

			// Assert
			expect( mockLocalStorage.getItem ).not.toHaveBeenCalled();
			expect( mockLocalStorage.removeItem ).not.toHaveBeenCalled();
		} );

		it( 'should return empty string when localStorage key is provided but no stored value exists', () => {
			// Arrange
			mockLocalStorage.getItem.mockReturnValue( null );

			// Act
			const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

			// Assert
			expect( mockLocalStorage.getItem ).toHaveBeenCalledWith( 'test-key' );
			expect( result.current.inputValue ).toBe( '' );
			expect( result.current.debouncedValue ).toBe( '' );
		} );

		it( 'should return stored value from localStorage and remove it', () => {
			// Arrange
			const storedValue = 'stored search term';
			mockLocalStorage.getItem.mockReturnValue( storedValue );

			// Act
			const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

			// Assert
			expect( mockLocalStorage.getItem ).toHaveBeenCalledWith( 'test-key' );
			expect( mockLocalStorage.removeItem ).toHaveBeenCalledWith( 'test-key' );
			expect( result.current.inputValue ).toBe( storedValue );
			expect( result.current.debouncedValue ).toBe( storedValue );
		} );

		it( 'should handle empty string stored in localStorage', () => {
			// Arrange
			mockLocalStorage.getItem.mockReturnValue( '' );

			// Act
			const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

			// Assert
			expect( mockLocalStorage.getItem ).toHaveBeenCalledWith( 'test-key' );
			expect( mockLocalStorage.removeItem ).not.toHaveBeenCalled();
			expect( result.current.inputValue ).toBe( '' );
			expect( result.current.debouncedValue ).toBe( '' );
		} );

		it( 'should handle localStorage with non-string values', () => {
			// Arrange
			mockLocalStorage.getItem.mockReturnValue( null );

			// Act
			const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

			// Assert
			expect( mockLocalStorage.getItem ).toHaveBeenCalledWith( 'test-key' );
			expect( mockLocalStorage.removeItem ).not.toHaveBeenCalled();
			expect( result.current.inputValue ).toBe( '' );
			expect( result.current.debouncedValue ).toBe( '' );
		} );
	} );

	describe( 'Debounce behavior', () => {
		it( 'should maintain separate input and debounced values during typing', () => {
			// Arrange
			const { result } = renderHook( () => useSearchState( {} ) );

			// Act
			act( () => {
				result.current.handleChange( 'a' );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( 'a' );
			expect( result.current.debouncedValue ).toBe( '' );

			// Act
			act( () => {
				result.current.handleChange( 'ab' );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( 'ab' );
			expect( result.current.debouncedValue ).toBe( '' );

			// Act
			act( () => {
				result.current.handleChange( 'abc' );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( 'abc' );
			expect( result.current.debouncedValue ).toBe( '' );

			// Act
			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( 'abc' );
			expect( result.current.debouncedValue ).toBe( 'abc' );
		} );

		it( 'should handle rapid successive changes correctly', () => {
			// Arrange
			const { result } = renderHook( () => useSearchState( {} ) );

			// Act
			act( () => {
				result.current.handleChange( 'h' );
			} );
			act( () => {
				result.current.handleChange( 'he' );
			} );
			act( () => {
				result.current.handleChange( 'hel' );
			} );
			act( () => {
				result.current.handleChange( 'hell' );
			} );
			act( () => {
				result.current.handleChange( 'hello' );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( 'hello' );
			expect( result.current.debouncedValue ).toBe( '' );

			// Act
			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( result.current.debouncedValue ).toBe( 'hello' );
		} );
	} );

	describe( 'Edge cases', () => {
		it( 'should handle undefined localStorageKey', () => {
			// Act
			const { result } = renderHook( () => useSearchState( { localStorageKey: undefined } ) );

			// Assert
			expect( result.current.inputValue ).toBe( '' );
			expect( result.current.debouncedValue ).toBe( '' );
			expect( mockLocalStorage.getItem ).not.toHaveBeenCalled();
		} );

		it( 'should handle empty localStorageKey', () => {
			// Act
			const { result } = renderHook( () => useSearchState( { localStorageKey: '' } ) );

			// Assert
			expect( result.current.inputValue ).toBe( '' );
			expect( result.current.debouncedValue ).toBe( '' );
			expect( mockLocalStorage.getItem ).not.toHaveBeenCalled();
		} );

		it( 'should handle special characters in search terms', () => {
			// Arrange
			const { result } = renderHook( () => useSearchState( {} ) );
			const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

			// Act
			act( () => {
				result.current.handleChange( specialChars );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( specialChars );

			// Act
			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( result.current.debouncedValue ).toBe( specialChars );
		} );

		it( 'should handle very long search terms', () => {
			// Arrange
			const { result } = renderHook( () => useSearchState( {} ) );
			const longSearchTerm = 'a'.repeat( 1000 );

			// Act
			act( () => {
				result.current.handleChange( longSearchTerm );
			} );

			// Assert
			expect( result.current.inputValue ).toBe( longSearchTerm );

			// Act
			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( result.current.debouncedValue ).toBe( longSearchTerm );
		} );

		it( 'should handle multiple hook instances independently', () => {
			// Arrange
			mockLocalStorage.getItem.mockReturnValue( null );

			const { result: result1 } = renderHook( () => useSearchState( { localStorageKey: 'key1' } ) );
			const { result: result2 } = renderHook( () => useSearchState( { localStorageKey: 'key2' } ) );

			// Act
			act( () => {
				result1.current.handleChange( 'search1' );
				result2.current.handleChange( 'search2' );
			} );

			// Assert
			expect( result1.current.inputValue ).toBe( 'search1' );
			expect( result2.current.inputValue ).toBe( 'search2' );

			// Act
			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( result1.current.debouncedValue ).toBe( 'search1' );
			expect( result2.current.debouncedValue ).toBe( 'search2' );
		} );
	} );
} );
