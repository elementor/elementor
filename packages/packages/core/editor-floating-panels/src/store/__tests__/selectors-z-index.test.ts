import { __createStore, __deleteStore, __dispatch, __getState, __registerSlice } from '@elementor/store';

import { FLOATING_PANEL_Z_INDEX_BASE } from '../../constants';
import { resolvePanelZIndex } from '../selectors';
import { slice } from '../slice';

const defaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
};

describe( 'resolvePanelZIndex', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'raises floating panels above an open docked panel', () => {
		__dispatch( slice.actions.register( { id: 'docked', defaults, isDocked: true } ) );
		__dispatch( slice.actions.register( { id: 'navigator', defaults, isDraggable: true } ) );
		__dispatch( slice.actions.open( 'docked' ) );
		__dispatch( slice.actions.open( 'navigator' ) );

		const dockedZIndex = resolvePanelZIndex( __getState(), 'docked' );
		const navigatorZIndex = resolvePanelZIndex( __getState(), 'navigator' );

		expect( dockedZIndex ).toBe( FLOATING_PANEL_Z_INDEX_BASE );
		expect( navigatorZIndex ).toBeGreaterThan( dockedZIndex );
	} );
} );
