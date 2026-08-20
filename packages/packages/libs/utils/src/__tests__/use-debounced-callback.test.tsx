import { act, renderHook } from '@testing-library/react';

import { useDebouncedCallback } from '../use-debounced-callback';

beforeEach( () => {
	jest.useFakeTimers();
} );

afterEach( () => {
	jest.runOnlyPendingTimers();
	jest.clearAllTimers();
	jest.clearAllMocks();
} );

describe( 'useDebouncedCallback', () => {
	it( 'should debounce calls and run only the last one', () => {
		const fn = jest.fn();
		const { result } = renderHook( () => useDebouncedCallback( fn, 300 ) );

		act( () => {
			result.current( 'a' );
			result.current( 'b' );
			result.current( 'c' );
		} );

		expect( fn ).not.toHaveBeenCalled();

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( fn ).toHaveBeenCalledTimes( 1 );
		expect( fn ).toHaveBeenCalledWith( 'c' );
	} );

	it( 'should keep a stable identity across renders even when callback identity changes', () => {
		let value = 0;
		const { result, rerender } = renderHook( () => useDebouncedCallback( () => value, 300 ) );
		const first = result.current;

		value = 1;
		rerender();

		expect( result.current ).toBe( first );
	} );

	it( 'should always invoke the latest callback closure', () => {
		const calls: number[] = [];
		const { result, rerender } = renderHook(
			( { v }: { v: number } ) => useDebouncedCallback( () => calls.push( v ), 300 ),
			{ initialProps: { v: 1 } }
		);

		act( () => {
			result.current();
		} );

		rerender( { v: 2 } );

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( calls ).toEqual( [ 2 ] );
	} );

	it( 'should cancel pending invocation on unmount', () => {
		const fn = jest.fn();
		const { result, unmount } = renderHook( () => useDebouncedCallback( fn, 300 ) );

		act( () => {
			result.current();
		} );

		unmount();

		act( () => {
			jest.advanceTimersByTime( 300 );
		} );

		expect( fn ).not.toHaveBeenCalled();
	} );
} );
