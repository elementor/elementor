import { jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';

import { useSearchState } from '../index';

// Mock localStorage
const mockLocalStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

Object.defineProperty( window, 'localStorage', {
	value: mockLocalStorage,
} );

beforeEach( () => {
	jest.useFakeTimers();
	jest.clearAllMocks();
} );

afterEach( () => {
	jest.runOnlyPendingTimers();
	jest.clearAllTimers();
	jest.clearAllMocks();
} );

describe( 'useSearchState', () => {
	it( 'should initialize with empty values when no localStorage key provided', () => {
		// Arrange
		const { result } = renderHook( () => useSearchState( {} ) );

		// Act & Assert
		expect( result.current.inputValue ).toBe( '' );
		expect( result.current.debouncedValue ).toBe( '' );
		expect( result.current.handleChange ).toBeInstanceOf( Function );
		expect( mockLocalStorage.getItem ).not.toHaveBeenCalled();
	} );

	it( 'should initialize with empty values when localStorage key provided but no stored value', () => {
		// Arrange
		mockLocalStorage.getItem.mockReturnValue( null );
		const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

		// Act & Assert
		expect( result.current.inputValue ).toBe( '' );
		expect( result.current.debouncedValue ).toBe( '' );
		expect( mockLocalStorage.getItem ).toHaveBeenCalledWith( 'test-key' );
		expect( mockLocalStorage.removeItem ).not.toHaveBeenCalled();
	} );

	it( 'should initialize with stored value and remove it from localStorage', () => {
		// Arrange
		const storedValue = 'stored search term';
		mockLocalStorage.getItem.mockReturnValue( storedValue );
		const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

		// Act & Assert
		expect( result.current.inputValue ).toBe( storedValue );
		expect( result.current.debouncedValue ).toBe( storedValue );
		expect( mockLocalStorage.getItem ).toHaveBeenCalledWith( 'test-key' );
		expect( mockLocalStorage.removeItem ).toHaveBeenCalledWith( 'test-key' );
	} );

	it( 'should handle debounced value updates correctly', () => {
		// Arrange
		mockLocalStorage.getItem.mockReturnValue( null );
		const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

		// Act
		act( () => {
			result.current.handleChange( 'new search' );
		} );

		// Assert
		expect( result.current.inputValue ).toBe( 'new search' );
		expect( result.current.debouncedValue ).toBe( '' );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( result.current.debouncedValue ).toBe( 'new search' );
	} );

	it( 'should handle multiple rapid changes and keep the latest debounced value', () => {
		// Arrange
		mockLocalStorage.getItem.mockReturnValue( null );
		const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

		// Act
		act( () => {
			result.current.handleChange( 'first' );
		} );

		act( () => {
			jest.advanceTimersByTime( 100 );
			result.current.handleChange( 'second' );
		} );

		act( () => {
			jest.advanceTimersByTime( 100 );
			result.current.handleChange( 'third' );
		} );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		// Assert
		expect( result.current.inputValue ).toBe( 'third' );
		expect( result.current.debouncedValue ).toBe( 'third' );
	} );

	it( 'should throw error when localStorage.getItem fails', () => {
		// Arrange
		const mockConsoleError = jest.fn();
		window.console.error = mockConsoleError;
		mockLocalStorage.getItem.mockImplementation( () => {
			throw new Error( 'localStorage error' );
		} );

		// Act & Assert
		expect( () => {
			renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );
		} ).toThrow( 'localStorage error' );

		// Suppress console.error from React.
		expect( mockConsoleError ).toHaveBeenCalled();
	} );

	it( 'should handle empty string stored value correctly', () => {
		// Arrange
		mockLocalStorage.getItem.mockReturnValue( '' );
		const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

		// Act & Assert
		expect( result.current.inputValue ).toBe( '' );
		expect( result.current.debouncedValue ).toBe( '' );
		expect( mockLocalStorage.getItem ).toHaveBeenCalledWith( 'test-key' );
		expect( mockLocalStorage.removeItem ).not.toHaveBeenCalled();
	} );

	it( 'should work without localStorage key and handle changes normally', () => {
		// Arrange
		const { result } = renderHook( () => useSearchState( {} ) );

		// Act
		act( () => {
			result.current.handleChange( 'search without storage' );
		} );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		// Assert
		expect( result.current.inputValue ).toBe( 'search without storage' );
		expect( result.current.debouncedValue ).toBe( 'search without storage' );
		expect( mockLocalStorage.getItem ).not.toHaveBeenCalled();
		expect( mockLocalStorage.removeItem ).not.toHaveBeenCalled();
	} );
} );
