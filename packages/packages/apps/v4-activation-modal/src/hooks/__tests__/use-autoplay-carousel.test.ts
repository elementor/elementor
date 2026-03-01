import { act, renderHook } from '@testing-library/react';

import { useAutoplayCarousel } from '../use-autoplay-carousel';

const ITEMS = [ 'a', 'b', 'c' ] as const;

beforeEach( () => {
	jest.useFakeTimers();
} );

afterEach( () => {
	jest.runOnlyPendingTimers();
	jest.clearAllTimers();
} );

describe( 'useAutoplayCarousel', () => {
	it( 'should initialize with the first item selected', () => {
		const { result } = renderHook( () => useAutoplayCarousel( ITEMS ) );

		expect( result.current.selectedItem ).toBe( 'a' );
	} );

	it( 'should advance to the next item after the default interval', () => {
		const { result } = renderHook( () => useAutoplayCarousel( ITEMS ) );

		act( () => {
			jest.advanceTimersByTime( 5000 );
		} );

		expect( result.current.selectedItem ).toBe( 'b' );
	} );

	it( 'should cycle back to the first item after reaching the last', () => {
		const { result } = renderHook( () => useAutoplayCarousel( ITEMS ) );

		act( () => {
			jest.advanceTimersByTime( 5000 * ITEMS.length );
		} );

		expect( result.current.selectedItem ).toBe( 'a' );
	} );

	it( 'should stop autoplay when an item is manually selected', () => {
		const { result } = renderHook( () => useAutoplayCarousel( ITEMS ) );

		act( () => {
			result.current.selectItem( 'c' );
		} );

		expect( result.current.selectedItem ).toBe( 'c' );

		act( () => {
			jest.advanceTimersByTime( 10_000 );
		} );

		expect( result.current.selectedItem ).toBe( 'c' );
	} );
} );
