import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import {
	__createStore,
	__deleteStore,
	__dispatch,
	__getStore,
	__registerSlice,
	__StoreProvider as StoreProvider,
} from '@elementor/store';

import PanelWindow from '../components/internal/panel-window';
import { slice } from '../store/slice';

const PANEL_ID = 'test-panel';

const defaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
};

function renderPanelWindow( isResizable: boolean ) {
	__dispatch(
		slice.actions.register( {
			id: PANEL_ID,
			defaults,
			isResizable,
		} )
	);

	const store = __getStore();

	if ( ! store ) {
		throw new Error( 'Store not initialized' );
	}

	return renderWithTheme(
		<StoreProvider store={ store }>
			<PanelWindow
				panelId={ PANEL_ID }
				position={ { insetInlineStart: 24, insetBlockStart: 80 } }
				size={ { inlineSize: 320, blockSize: 480 } }
				zIndex={ 1000 }
				visible
				onFocus={ () => undefined }
			>
				<div>Panel body</div>
			</PanelWindow>
		</StoreProvider>
	);
}

describe( 'PanelWindow', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'renders resize handles when isResizable is true', () => {
		renderPanelWindow( true );

		expect( document.querySelectorAll( '[data-resize-edge]' ).length ).toBe( 4 );
		expect( document.querySelectorAll( '[data-resize-corner]' ).length ).toBe( 4 );
	} );

	it( 'does not render resize handles when isResizable is false', () => {
		renderPanelWindow( false );

		expect( document.querySelectorAll( '[data-resize-edge]' ).length ).toBe( 0 );
		expect( document.querySelectorAll( '[data-resize-corner]' ).length ).toBe( 0 );
	} );
} );
