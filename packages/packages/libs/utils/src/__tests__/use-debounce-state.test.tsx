import { act, renderHook } from '@testing-library/react';

import { useDebounceState } from '../index';

beforeEach( () => {
	jest.useFakeTimers();
} );

afterEach( () => {
	jest.runOnlyPendingTimers();
	jest.clearAllTimers();
	jest.clearAllMocks();
} );

describe( 'useDebounceState (hook only)', () => {
	it( 'should initialize with default empty values', () => {
		const { result } = renderHook( () => useDebounceState() );
		expect( result.current.inputValue ).toBe( '' );
		expect( result.current.debouncedValue ).toBe( '' );
	} );

	it( 'should initialize with provided initial value', () => {
		const { result } = renderHook( () => useDebounceState( { initialValue: 'start' } ) );
		expect( result.current.inputValue ).toBe( 'start' );
		expect( result.current.debouncedValue ).toBe( 'start' );
	} );

	it( 'should update inputValue immediately', () => {
		const { result } = renderHook( () => useDebounceState() );

		act( () => {
			result.current.handleChange( 'hello' );
		} );

		expect( result.current.inputValue ).toBe( 'hello' );
		expect( result.current.debouncedValue ).toBe( '' );
	} );

	it( 'should update debouncedValue after delay', () => {
		const { result } = renderHook( () => useDebounceState( { delay: 300 } ) );

		act( () => {
			result.current.handleChange( 'debounced!' );
		} );

		expect( result.current.inputValue ).toBe( 'debounced!' );
		expect( result.current.debouncedValue ).toBe( '' );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( result.current.debouncedValue ).toBe( 'debounced!' );
	} );

	it( 'should cancel previous debounce and keep the latest', () => {
		const { result } = renderHook( () => useDebounceState( { delay: 300 } ) );

		act( () => {
			result.current.handleChange( 'first' );
		} );

		act( () => {
			jest.advanceTimersByTime( 100 ); // not enough to trigger debounce
			result.current.handleChange( 'second' );
		} );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( result.current.debouncedValue ).toBe( 'second' );
	} );
} );
