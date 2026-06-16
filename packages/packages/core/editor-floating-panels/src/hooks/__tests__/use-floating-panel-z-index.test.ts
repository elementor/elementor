import { renderHookWithStore } from 'test-utils';
import {
	__createStore,
	__deleteStore,
	__dispatch,
	__getStore,
	__registerSlice,
} from '@elementor/store';

import { slice } from '../../store/slice';
import { type FloatingPanelDefaults } from '../../types';
import { FLOATING_PANEL_Z_INDEX_BASE } from '../../utils/constants';
import { useFloatingPanelZIndex } from '../use-floating-panel-z-index';

const PANEL_ID = 'panel';

const defaults: FloatingPanelDefaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
};

describe( 'useFloatingPanelZIndex', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();
		__dispatch( slice.actions.register( { id: PANEL_ID, defaults } ) );
		__dispatch( slice.actions.open( PANEL_ID ) );
		__dispatch( slice.actions.bringToFront( PANEL_ID ) );
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'returns one above the panel z-index', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		// Act.
		const { result } = renderHookWithStore( () => useFloatingPanelZIndex( PANEL_ID ), store );

		// Assert.
		expect( result.current ).toBe( FLOATING_PANEL_Z_INDEX_BASE + 1 + 1 );
	} );
} );
