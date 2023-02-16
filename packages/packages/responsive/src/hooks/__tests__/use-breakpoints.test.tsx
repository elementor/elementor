import { PropsWithChildren } from 'react';
import { createSlice } from '../../store';
import { Breakpoint, Slice } from '../../types';
import useBreakpoints from '../use-breakpoints';
import { runCommand } from '@elementor/v1-adapters';
import { renderHook } from '@testing-library/react-hooks';
import { createStore, dispatch, SliceState, Store, StoreProvider } from '@elementor/store';
import { getNormalizedBreakpointsConfig, getSortedBreakpoints } from '../../__tests__/breakpoints-config';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
} ) );

describe( '@elementor/responsive - useBreakpoints', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();
	} );

	it( 'should return all breakpoints sorted by size', () => {
		// Arrange.
		const entities = Object.values( getNormalizedBreakpointsConfig() );

		dispatch( slice.actions.init( {
			activeId: null,
			entities,
		} ) );

		// Act.
		const { result } = renderHookWithStore( () => useBreakpoints(), store );

		// Assert.
		expect( result.current.all ).toEqual( getSortedBreakpoints() );
	} );

	it( 'should return the active breakpoint', () => {
		// Arrange.
		const entities: Breakpoint[] = [
			{
				id: 'desktop',
			},
			{
				id: 'tablet',
				type: 'up-to',
				size: 1024,
			},
		];

		dispatch( slice.actions.init( {
			activeId: 'tablet',
			entities,
		} ) );

		// Act.
		const { result } = renderHookWithStore( () => useBreakpoints(), store );

		// Assert.
		expect( result.current.active ).toEqual( entities[ 1 ] );
	} );

	it( 'should activate a breakpoint', () => {
		// Act.
		const { result } = renderHookWithStore( () => useBreakpoints(), store );

		result.current.activate( 'tablet' );

		// Assert.
		expect( jest.mocked( runCommand ) ).toHaveBeenCalledTimes( 1 );
		expect( jest.mocked( runCommand ) ).toHaveBeenCalledWith( 'panel/change-device-mode', {
			device: 'tablet',
		} );
	} );
} );

function renderHookWithStore<T>( hook: () => T, store: Store ) {
	const wrapper = ( { children }: PropsWithChildren<unknown> ) => (
		<StoreProvider store={ store }>
			{ children }
		</StoreProvider>
	);

	return renderHook( hook, { wrapper } );
}
