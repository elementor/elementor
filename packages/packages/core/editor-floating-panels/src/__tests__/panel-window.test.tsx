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
import { type LogicalPosition } from '../types';

const PANEL_ID = 'test-panel';

const defaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
};

const DEFAULT_CORNER = 'block-start-inline-start' as const;

const DEFAULT_POSITION: LogicalPosition = {
	insetBlockStart: 80,
	insetBlockEnd: 0,
	insetInlineStart: 24,
	insetInlineEnd: 0,
};

function renderPanelWindow( isResizable: boolean, visible = true ) {
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
				zIndex={ 1000 }
				size={ { inlineSize: 320, blockSize: 480 } }
				corner={ DEFAULT_CORNER }
				position={ DEFAULT_POSITION }
				visible={ visible }
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

	it( 'applies pointer-events auto when visible', () => {
		renderPanelWindow( false, true );

		const panel = document.querySelector( '[data-floating-panel="test-panel"]' );
		expect( panel ).toHaveStyle( { pointerEvents: 'auto' } );
		expect( panel ).not.toHaveAttribute( 'inert' );
	} );

	it( 'applies pointer-events none and inert when not visible', () => {
		renderPanelWindow( false, false );

		const panel = document.querySelector( '[data-floating-panel="test-panel"]' );
		expect( panel ).toHaveStyle( { pointerEvents: 'none' } );
		expect( panel ).toHaveAttribute( 'inert' );
	} );

	it( 'applies insetInlineEnd and insetBlockEnd for block-end-inline-end', () => {
		__dispatch(
			slice.actions.register( {
				id: PANEL_ID,
				defaults: { ...defaults, corner: 'block-end-inline-end' },
				isResizable: false,
			} )
		);

		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store not initialized' );
		}

		renderWithTheme(
			<StoreProvider store={ store }>
				<PanelWindow
					panelId={ PANEL_ID }
					zIndex={ 1000 }
					size={ { inlineSize: 320, blockSize: 480 } }
					corner="block-end-inline-end"
					position={ {
						insetBlockStart: 0,
						insetBlockEnd: 80,
						insetInlineStart: 0,
						insetInlineEnd: 24,
					} }
					visible
					onFocus={ () => undefined }
				>
					<div>Panel body</div>
				</PanelWindow>
			</StoreProvider>
		);

		const panel = document.querySelector( '[data-floating-panel="test-panel"]' );
		expect( panel ).toHaveStyle( { insetInlineEnd: '24px', insetBlockEnd: '80px' } );
	} );
} );
