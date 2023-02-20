import { PropsWithChildren } from 'react';
import { createSlice } from '../../store';
import { Breakpoint, Slice } from '../../types';
import useBreakpoints from '../use-breakpoints';
import { runCommand } from '@elementor/v1-adapters';
import { renderHook } from '@testing-library/react-hooks';
import { createStore, dispatch, SliceState, Store, StoreProvider } from '@elementor/store';

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
		dispatch( slice.actions.init( {
			activeId: null,
			entities: [
				{ id: 'tablet', width: 1024, type: 'max-width' },
				{ id: 'mobile', width: 767, type: 'max-width' },
				{ id: 'widescreen', width: 2400, type: 'min-width' },
				{ id: 'desktop' },
			],
		} ) );

		// Act.
		const { result } = renderHookWithStore( () => useBreakpoints(), store );

		// Assert.
		expect( result.current.all ).toEqual( [
			{ id: 'widescreen', width: 2400, type: 'min-width' },
			{ id: 'desktop' },
			{ id: 'tablet', width: 1024, type: 'max-width' },
			{ id: 'mobile', width: 767, type: 'max-width' },
		] );
	} );

	it( 'should return the active breakpoint', () => {
		// Arrange.
		dispatch( slice.actions.init( {
			activeId: 'tablet',
			entities: [
				{ id: 'desktop' },
				{ id: 'tablet', type: 'max-width', width: 1024 },
			],
		} ) );

		// Act.
		const { result } = renderHookWithStore( () => useBreakpoints(), store );

		// Assert.
		expect( result.current.active ).toEqual( {
			id: 'tablet',
			type: 'max-width',
			width: 1024,
		} );
	} );

	it( 'should activate a breakpoint', () => {
		// Act.
		const { result } = renderHookWithStore( () => useBreakpoints(), store );

		result.current.activate( 'tablet' );

		// Assert.
		expect( jest.mocked( runCommand ) ).toHaveBeenCalledTimes( 1 );
		expect( jest.mocked( runCommand ) ).toHaveBeenCalledWith(
			'panel/change-device-mode', { device: 'tablet' }
		);
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
