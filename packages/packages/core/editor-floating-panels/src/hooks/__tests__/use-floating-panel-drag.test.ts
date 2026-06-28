import type { PointerEvent } from 'react';
import { renderHookWithStore } from 'test-utils';
import { __createStore, __deleteStore, __dispatch, __getState, __getStore, __registerSlice } from '@elementor/store';
import { act } from '@testing-library/react';

import { selectPosition } from '../../store/selectors';
import { slice } from '../../store/slice';
import { type FloatingPanelDefaults } from '../../types';
import { APP_BAR_HEIGHT_PX } from '../../utils/viewport-bounds';
import { useFloatingPanelDrag } from '../use-floating-panel-drag';

const PANEL_ID = 'drag-panel';
const SIDE_PANEL_WIDTH_PX = 280;
const VIEWPORT_WIDTH_PX = 1200;
const VIEWPORT_HEIGHT_PX = 800;
const POINTER_ID = 1;

const defaults: FloatingPanelDefaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
	corner: 'block-start-inline-start',
};

const startPosition = {
	insetInlineStart: 400,
	insetInlineEnd: 0,
	insetBlockStart: 120,
	insetBlockEnd: 0,
};

let sidePanelElement: HTMLElement;

function createPointerTarget() {
	const target = document.createElement( 'div' );
	target.setPointerCapture = jest.fn();

	return target;
}

function createPointerEvent(
	target: HTMLElement,
	overrides: Partial< { pointerId: number; clientX: number; clientY: number } > = {}
) {
	return {
		pointerId: POINTER_ID,
		clientX: 0,
		clientY: 0,
		currentTarget: target,
		...overrides,
	} as unknown as PointerEvent< HTMLElement >;
}

function setupViewport() {
	Object.defineProperty( window, 'innerWidth', { configurable: true, value: VIEWPORT_WIDTH_PX } );
	Object.defineProperty( window, 'innerHeight', { configurable: true, value: VIEWPORT_HEIGHT_PX } );

	const sidePanel = document.createElement( 'div' );
	sidePanel.id = 'elementor-panel';
	jest.spyOn( sidePanel, 'getBoundingClientRect' ).mockReturnValue( { width: SIDE_PANEL_WIDTH_PX } as DOMRect );
	document.body.appendChild( sidePanel );
	sidePanelElement = sidePanel;
}

describe( 'useFloatingPanelDrag', () => {
	beforeEach( () => {
		setupViewport();
		__registerSlice( slice );
		__createStore();
		__dispatch( slice.actions.register( { id: PANEL_ID, defaults } ) );
		__dispatch( slice.actions.open( PANEL_ID ) );
		__dispatch( slice.actions.setPosition( { id: PANEL_ID, position: startPosition } ) );
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		__deleteStore();
	} );

	it( 'updates panel position while dragging', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => useFloatingPanelDrag( PANEL_ID ), store );

		// Act.
		act( () => {
			result.current.onPointerDown( createPointerEvent( target, { clientX: 100, clientY: 200 } ) );
			result.current.onPointerMove( createPointerEvent( target, { clientX: 150, clientY: 230 } ) );
		} );

		// Assert.
		expect( selectPosition( __getState(), PANEL_ID ) ).toEqual( {
			insetInlineStart: 450,
			insetInlineEnd: 0,
			insetBlockStart: 150,
			insetBlockEnd: 0,
		} );
		expect( target.setPointerCapture ).toHaveBeenCalledWith( POINTER_ID );
	} );

	it( 'clamps drag position to viewport bounds', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => useFloatingPanelDrag( PANEL_ID ), store );

		// Act.
		act( () => {
			result.current.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			result.current.onPointerMove( createPointerEvent( target, { clientX: -10_000, clientY: -10_000 } ) );
		} );

		// Assert.
		expect( selectPosition( __getState(), PANEL_ID ) ).toEqual( {
			insetInlineStart: SIDE_PANEL_WIDTH_PX,
			insetInlineEnd: 0,
			insetBlockStart: APP_BAR_HEIGHT_PX,
			insetBlockEnd: 0,
		} );
	} );

	it( 'ignores pointer move events from a different pointer id', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => useFloatingPanelDrag( PANEL_ID ), store );

		// Act.
		act( () => {
			result.current.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			result.current.onPointerMove( createPointerEvent( target, { pointerId: 2, clientX: 500, clientY: 500 } ) );
		} );

		// Assert.
		expect( selectPosition( __getState(), PANEL_ID ) ).toEqual( startPosition );
	} );

	it( 'snapshots viewport bounds at pointer down', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const getBoundingClientRect = jest.spyOn( sidePanelElement, 'getBoundingClientRect' );
		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => useFloatingPanelDrag( PANEL_ID ), store );

		// Act.
		act( () => {
			result.current.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			getBoundingClientRect.mockClear();
			result.current.onPointerMove( createPointerEvent( target, { clientX: 50, clientY: 50 } ) );
			result.current.onPointerMove( createPointerEvent( target, { clientX: 100, clientY: 100 } ) );
		} );

		// Assert.
		expect( getBoundingClientRect ).not.toHaveBeenCalled();
	} );

	it( 'clears the drag session on pointer up', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => useFloatingPanelDrag( PANEL_ID ), store );

		// Act.
		act( () => {
			result.current.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			result.current.onPointerUp( createPointerEvent( target ) );
			result.current.onPointerMove( createPointerEvent( target, { clientX: 500, clientY: 500 } ) );
		} );

		// Assert.
		expect( selectPosition( __getState(), PANEL_ID ) ).toEqual( startPosition );
	} );

	it( 'clears the drag session on pointer cancel', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => useFloatingPanelDrag( PANEL_ID ), store );

		// Act.
		act( () => {
			result.current.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			result.current.onPointerCancel( createPointerEvent( target ) );
			result.current.onPointerMove( createPointerEvent( target, { clientX: 500, clientY: 500 } ) );
		} );

		// Assert.
		expect( selectPosition( __getState(), PANEL_ID ) ).toEqual( startPosition );
	} );
} );
