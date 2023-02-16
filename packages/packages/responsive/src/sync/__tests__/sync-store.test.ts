import syncStore from '../sync-store';
import { createSlice } from '../../store';
import { ExtendedWindow, Slice } from '../../types';
import { createStore, dispatch, SliceState, Store } from '@elementor/store';
import { selectActiveBreakpoint, selectEntities } from '../../store/selectors';
import { getBreakpointsConfig, getNormalizedBreakpointsConfig } from '../../__tests__/breakpoints-config';

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
		mockBreakpointsConfig();

		// Act.
		dispatchEvent( new CustomEvent( 'elementor/initialized' ) );

		// Assert.
		expect( selectEntities( store.getState() ) ).toEqual( getNormalizedBreakpointsConfig() );

		expect( extendedWindow.elementor.channels.deviceMode.request ).toHaveBeenCalledTimes( 1 );
		expect( extendedWindow.elementor.channels.deviceMode.request ).toHaveBeenCalledWith( 'currentMode' );

		expect( selectActiveBreakpoint( store.getState() ) ).toEqual( {
			id: 'mobile',
			size: 767,
			type: 'up-to',
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
		mockBreakpointsConfig();

		dispatch( slice.actions.init( {
			entities: Object.values( getNormalizedBreakpointsConfig() ),
			activeId: 'mobile',
		} ) );

		// Act - Mock a change.
		jest.mocked( extendedWindow.elementor.channels.deviceMode.request ).mockReturnValue( 'desktop' );
		dispatchEvent( new CustomEvent( 'elementor/device-mode/change' ) );

		// Assert.
		expect( selectActiveBreakpoint( store.getState() ) ).toEqual( {
			id: 'desktop',
		} );
	} );
} );

function mockBreakpointsConfig() {
	( window as unknown as ExtendedWindow ).elementor = {
		channels: {
			deviceMode: { request: jest.fn( () => 'mobile' ) },
		},
		config: {
			responsive: {
				breakpoints: getBreakpointsConfig(),
			},
		},
	};
}
