import { Slice } from '../../types';
import { PropsWithChildren } from 'react';
import { createSlice } from '../../store';
import useBreakpoints from '../use-breakpoints';
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
				{ id: 'tablet', label: 'Tablet Portrait', width: 1024, type: 'max-width' },
				{ id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
				{ id: 'widescreen', label: 'Widescreen', width: 2400, type: 'min-width' },
				{ id: 'desktop', label: 'Desktop' },
			],
		} ) );

		// Act.
		const { result } = renderHookWithStore( () => useBreakpoints(), store );

		// Assert.
		expect( result.current.all ).toEqual( [
			{ id: 'widescreen', label: 'Widescreen', width: 2400, type: 'min-width' },
			{ id: 'desktop', label: 'Desktop' },
			{ id: 'tablet', label: 'Tablet Portrait', width: 1024, type: 'max-width' },
			{ id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
		] );
	} );

	it( 'should return the active breakpoint', () => {
		// Arrange.
		dispatch( slice.actions.init( {
			activeId: 'tablet',
			entities: [
				{ id: 'desktop', label: 'Desktop' },
				{ id: 'tablet', label: 'Tablet Portrait', type: 'max-width', width: 1024 },
			],
		} ) );

		// Act.
		const { result } = renderHookWithStore( () => useBreakpoints(), store );

		// Assert.
		expect( result.current.active ).toEqual( {
			id: 'tablet',
			label: 'Tablet Portrait',
			type: 'max-width',
			width: 1024,
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
