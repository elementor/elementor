import syncStore from '../sync-store';
import { createSlice } from '../../store';
import { ExtendedWindow, Slice } from '../../types';
import { createStore, dispatch, SliceState, Store } from '@elementor/store';
import { selectActiveBreakpoint, selectEntities } from '../../store/selectors';

describe( '@elementor/responsive - Sync Store', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;
	let extendedWindow: ExtendedWindow;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();

		syncStore( slice );

		extendedWindow = ( window as unknown as ExtendedWindow );
	} );

	it( 'should initialize the store when V1 is ready', () => {
		// Arrange.
		mockV1BreakpointsConfig();

		// Act.
		dispatchEvent( new CustomEvent( 'elementor/initialized' ) );

		// Assert.
		expect( selectEntities( store.getState() ) ).toEqual( {
			desktop: { id: 'desktop' },
			mobile: { id: 'mobile', width: 767, type: 'max-width' },
			tablet: { id: 'tablet', width: 1024, type: 'max-width' },
			laptop: { id: 'laptop', width: 1366, type: 'max-width' },
			widescreen: { id: 'widescreen', width: 2400, type: 'min-width' },
			mobile_extra: { id: 'mobile_extra', width: 880, type: 'max-width' },
			tablet_extra: { id: 'tablet_extra', width: 1200, type: 'max-width' },
		} );

		expect( extendedWindow.elementor.channels.deviceMode.request ).toHaveBeenCalledTimes( 1 );
		expect( extendedWindow.elementor.channels.deviceMode.request ).toHaveBeenCalledWith( 'currentMode' );

		expect( selectActiveBreakpoint( store.getState() ) ).toEqual( {
			id: 'mobile',
			width: 767,
			type: 'max-width',
		} );
	} );

	it( 'should initialize an empty store when V1 breakpoints config is not available', () => {
		// Act.
		dispatchEvent( new CustomEvent( 'elementor/initialized' ) );

		// Assert.
		expect( selectEntities( store.getState() ) ).toEqual( {} );
	} );

	it( 'should sync the active breakpoint on change', () => {
		// Arrange.
		mockV1BreakpointsConfig();

		dispatch( slice.actions.init( {
			entities: [
				{ id: 'desktop' },
				{ id: 'mobile', width: 767, type: 'max-width' },
			],
			activeId: 'mobile',
		} ) );

		// Act - Mock a change.
		jest.mocked( extendedWindow.elementor.channels.deviceMode.request ).mockReturnValue( 'desktop' );
		dispatchEvent( new CustomEvent( 'elementor/device-mode/change' ) );

		// Assert.
		expect( selectActiveBreakpoint( store.getState() ) ).toEqual( { id: 'desktop' } );
	} );
} );

function mockV1BreakpointsConfig() {
	( window as unknown as ExtendedWindow ).elementor = {
		channels: {
			deviceMode: { request: jest.fn( () => 'mobile' ) },
		},
		config: {
			responsive: {
				breakpoints: {
					mobile: {
						value: 767,
						direction: 'max',
						is_enabled: true,
					},
					mobile_extra: {
						value: 880,
						direction: 'max',
						is_enabled: true,
					},
					tablet: {
						value: 1024,
						direction: 'max',
						is_enabled: true,
					},
					tablet_extra: {
						value: 1200,
						direction: 'max',
						is_enabled: true,
					},
					laptop: {
						value: 1366,
						direction: 'max',
						is_enabled: true,
					},
					widescreen: {
						value: 2400,
						direction: 'min',
						is_enabled: true,
					},
				} as const,
			},
		},
	};
}
