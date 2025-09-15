import { act, renderHook } from '@testing-library/react';

import { useSearchState } from '../index';

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

Object.defineProperty( window, 'localStorage', {
	value: localStorageMock,
} );

beforeEach( () => {
	jest.useFakeTimers();
	localStorageMock.getItem.mockClear();
	localStorageMock.removeItem.mockClear();
} );

afterEach( () => {
	jest.runOnlyPendingTimers();
	jest.clearAllTimers();
	jest.clearAllMocks();
} );

describe( 'useSearchState', () => {
	it( 'should initialize with empty values by default', () => {
		const { result } = renderHook( () => useSearchState( {} ) );

		expect( result.current.inputValue ).toBe( '' );
		expect( result.current.debouncedValue ).toBe( '' );
	} );

	it( 'should initialize with value from localStorage when localStorageKey is provided', () => {
		localStorageMock.getItem.mockReturnValue( 'stored-search-value' );

		const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

		expect( localStorageMock.getItem ).toHaveBeenCalledWith( 'test-key' );
		expect( localStorageMock.removeItem ).toHaveBeenCalledWith( 'test-key' );
		expect( result.current.inputValue ).toBe( 'stored-search-value' );
		expect( result.current.debouncedValue ).toBe( 'stored-search-value' );
	} );

	it( 'should not call localStorage when localStorageKey is not provided', () => {
		const { result } = renderHook( () => useSearchState( {} ) );

		expect( localStorageMock.getItem ).not.toHaveBeenCalled();
		expect( localStorageMock.removeItem ).not.toHaveBeenCalled();
		expect( result.current.inputValue ).toBe( '' );
		expect( result.current.debouncedValue ).toBe( '' );
	} );

	it( 'should handle localStorage when no stored value exists', () => {
		localStorageMock.getItem.mockReturnValue( null );

		const { result } = renderHook( () => useSearchState( { localStorageKey: 'test-key' } ) );

		expect( localStorageMock.getItem ).toHaveBeenCalledWith( 'test-key' );
		expect( localStorageMock.removeItem ).not.toHaveBeenCalled();
		expect( result.current.inputValue ).toBe( '' );
		expect( result.current.debouncedValue ).toBe( '' );
	} );

	it( 'should update inputValue immediately when handleChange is called', () => {
		const { result } = renderHook( () => useSearchState( {} ) );

		act( () => {
			result.current.handleChange( 'test search' );
		} );

		expect( result.current.inputValue ).toBe( 'test search' );
		expect( result.current.debouncedValue ).toBe( '' );
	} );

	it( 'should update debouncedValue after delay', () => {
		const { result } = renderHook( () => useSearchState( {} ) );

		act( () => {
			result.current.handleChange( 'debounced search' );
		} );

		expect( result.current.inputValue ).toBe( 'debounced search' );
		expect( result.current.debouncedValue ).toBe( '' );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( result.current.debouncedValue ).toBe( 'debounced search' );
	} );

	it( 'should cancel previous debounce and keep the latest value', () => {
		const { result } = renderHook( () => useSearchState( {} ) );

		act( () => {
			result.current.handleChange( 'first search' );
		} );

		act( () => {
			result.current.handleChange( 'second search' );
		} );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( result.current.inputValue ).toBe( 'second search' );
		expect( result.current.debouncedValue ).toBe( 'second search' );
	} );
} );
