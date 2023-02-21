import syncStore from '../sync-store';
import { createSlice } from '../../store';
import { BreakpointId, ExtendedWindow, Slice } from '../../types';
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
			desktop: { id: 'desktop', label: 'Desktop' },
			mobile: { id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
			tablet: { id: 'tablet', label: 'Tablet Portrait', width: 1024, type: 'max-width' },
			laptop: { id: 'laptop', label: 'Laptop', width: 1366, type: 'max-width' },
			widescreen: { id: 'widescreen', label: 'Widescreen', width: 2400, type: 'min-width' },
			mobile_extra: { id: 'mobile_extra', label: 'Mobile Landscape', width: 880, type: 'max-width' },
			tablet_extra: { id: 'tablet_extra', label: 'Tablet Landscape', width: 1200, type: 'max-width' },
		} );

		expect( extendedWindow.elementor.channels.deviceMode.request ).toHaveBeenCalledTimes( 1 );
		expect( extendedWindow.elementor.channels.deviceMode.request ).toHaveBeenCalledWith( 'currentMode' );

		expect( selectActiveBreakpoint( store.getState() ) ).toEqual( {
			id: 'mobile',
			label: 'Mobile Portrait',
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
				{ id: 'desktop', label: 'Desktop' },
				{ id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
			],
			activeId: 'mobile',
		} ) );

		// Act - Mock a change.
		jest.mocked( extendedWindow.elementor.channels.deviceMode.request ).mockReturnValue( 'desktop' );
		dispatchEvent( new CustomEvent( 'elementor/device-mode/change' ) );

		// Assert.
		expect( selectActiveBreakpoint( store.getState() ) ).toEqual( { id: 'desktop', label: 'Desktop' } );
	} );

	it( "should not change the active breakpoint when it's empty", () => {
		// Arrange.
		mockV1BreakpointsConfig();

		dispatch( slice.actions.init( {
			entities: [
				{ id: 'desktop', label: 'Desktop' },
				{ id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
			],
			activeId: 'desktop',
		} ) );

		// Act - Mock a change.
		jest.mocked( extendedWindow.elementor.channels.deviceMode.request ).mockReturnValue( '' as BreakpointId );
		dispatchEvent( new CustomEvent( 'elementor/device-mode/change' ) );

		// Assert.
		expect( selectActiveBreakpoint( store.getState() ) ).toEqual( { id: 'desktop', label: 'Desktop' } );
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
						label: 'Mobile Portrait',
						value: 767,
						direction: 'max',
						is_enabled: true,
					},
					mobile_extra: {
						label: 'Mobile Landscape',
						value: 880,
						direction: 'max',
						is_enabled: true,
					},
					tablet: {
						label: 'Tablet Portrait',
						value: 1024,
						direction: 'max',
						is_enabled: true,
					},
					tablet_extra: {
						label: 'Tablet Landscape',
						value: 1200,
						direction: 'max',
						is_enabled: true,
					},
					laptop: {
						label: 'Laptop',
						value: 1366,
						direction: 'max',
						is_enabled: true,
					},
					widescreen: {
						label: 'Widescreen',
						value: 2400,
						direction: 'min',
						is_enabled: true,
					},
				} as const,
			},
		},
	};
}
