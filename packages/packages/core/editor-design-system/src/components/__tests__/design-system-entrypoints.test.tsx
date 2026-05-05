import * as React from 'react';
import { act, render } from '@testing-library/react';

import { DesignSystemEntrypoints } from '../design-system-entrypoints';
import {
	getActiveDesignSystemTab,
	setPendingDesignSystemTab,
} from '../../initial-tab';
import { usePanelActions, usePanelStatus } from '../../design-system-panel';

/**
 * Event constants — mirror the component-internal constants to keep tests
 * readable without importing private symbols.
 */
const EVENT_OPEN_VARIABLES = 'elementor/open-variables-manager';
const EVENT_OPEN_CLASSES = 'elementor/open-global-classes-manager';
const EVENT_TOGGLE = 'elementor/toggle-design-system';
const EVENT_SET_TAB = 'elementor/design-system/set-tab';
const V1_ELEMENTS_PANEL_ROUTE = 'panel/elements/categories';

// ---- Mocks -------------------------------------------------------------------

jest.mock( '../../design-system-panel', () => ( {
	usePanelActions: jest.fn(),
	usePanelStatus: jest.fn(),
} ) );

jest.mock( '../../initial-tab', () => ( {
	getActiveDesignSystemTab: jest.fn( () => 'variables' ),
	setPendingDesignSystemTab: jest.fn(),
	getInitialDesignSystemTab: jest.fn( () => 'variables' ),
	persistDesignSystemTab: jest.fn(),
	notifyDesignSystemTabChange: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateListenTo: jest.fn( () => jest.fn() ),
	__privateOpenRoute: jest.fn(),
	routeOpenEvent: jest.fn( ( route: string ) => `route:open:${ route }` ),
} ) );

// ---- Helper imports (post-mock) ----------------------------------------------

import {
	__privateListenTo as listenTo,
	__privateOpenRoute as openRoute,
} from '@elementor/editor-v1-adapters';

// ---- Helpers -----------------------------------------------------------------

function dispatchWindowEvent( type: string, detail?: Record< string, unknown > ) {
	window.dispatchEvent( new CustomEvent( type, detail ? { detail } : undefined ) );
}

/**
 * Returns all handlers registered via `listenTo` for a given event key
 * (e.g. `route:open:panel/elements/categories`).
 */
function capturedListenToHandlers( eventKey: string ): Array< () => void > {
	return jest
		.mocked( listenTo )
		.mock.calls.filter( ( [ event ] ) => event === eventKey )
		.map( ( [ , handler ] ) => handler as () => void );
}

/** Fires all `listenTo` handlers registered for the elements-panel route. */
async function fireRoutePanelOpen() {
	const key = `route:open:${ V1_ELEMENTS_PANEL_ROUTE }`;
	const handlers = capturedListenToHandlers( key );
	await act( async () => {
		handlers.forEach( ( h ) => h() );
	} );
}

// ---- Test suite --------------------------------------------------------------

describe( 'DesignSystemEntrypoints', () => {
	const mockOpen = jest.fn();
	const mockClose = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( usePanelActions ).mockReturnValue( {
			open: mockOpen,
			close: mockClose,
		} );

		jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: false } );
		jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'variables' );

		// Reset URL to plain root
		window.history.pushState( {}, '', '/' );
	} );

	// -------------------------------------------------------------------------
	// Toggle event: panel is CLOSED
	// -------------------------------------------------------------------------

	describe( 'toggle event — panel is closed', () => {
		it( 'should dispatch open-variables event when toggled with variables tab', () => {
			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'variables' } );
			} );

			const dispatched = dispatchSpy.mock.calls
				.map( ( [ e ] ) => ( e as Event ).type );
			expect( dispatched ).toContain( EVENT_OPEN_VARIABLES );

			dispatchSpy.mockRestore();
		} );

		it( 'should dispatch open-classes event when toggled with classes tab', () => {
			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'classes' } );
			} );

			const dispatched = dispatchSpy.mock.calls
				.map( ( [ e ] ) => ( e as Event ).type );
			expect( dispatched ).toContain( EVENT_OPEN_CLASSES );

			dispatchSpy.mockRestore();
		} );

		it( 'should ignore toggle events with an invalid tab value', () => {
			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'invalid' } );
			} );

			const relevant = dispatchSpy.mock.calls
				.map( ( [ e ] ) => ( e as Event ).type )
				.filter( ( t ) =>
					[ EVENT_OPEN_VARIABLES, EVENT_OPEN_CLASSES, EVENT_SET_TAB ].includes( t )
				);
			expect( relevant ).toHaveLength( 0 );

			dispatchSpy.mockRestore();
		} );
	} );

	// -------------------------------------------------------------------------
	// Toggle event: panel is OPEN
	// -------------------------------------------------------------------------

	describe( 'toggle event — panel is open', () => {
		beforeEach( () => {
			jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: true } );
		} );

		it( 'should close the panel when toggled with the same tab that is already active', () => {
			jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'variables' );

			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'variables' } );
			} );

			expect( mockClose ).toHaveBeenCalled();
		} );

		it( 'should dispatch set-tab event (not close) when toggled with a different tab', () => {
			jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'variables' );
			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'classes' } );
			} );

			const dispatched = dispatchSpy.mock.calls.map( ( [ e ] ) => ( {
				type: ( e as Event ).type,
				detail: ( e as CustomEvent ).detail,
			} ) );

			expect( dispatched ).toContainEqual(
				expect.objectContaining( {
					type: EVENT_SET_TAB,
					detail: { tab: 'classes' },
				} )
			);
			expect( mockClose ).not.toHaveBeenCalled();

			dispatchSpy.mockRestore();
		} );

		it( 'should close classes panel when toggled with classes while classes is active', () => {
			jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'classes' );

			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'classes' } );
			} );

			expect( mockClose ).toHaveBeenCalled();
		} );

		it( 'should switch to variables via set-tab when panel is open on classes', () => {
			jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'classes' );
			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'variables' } );
			} );

			const dispatched = dispatchSpy.mock.calls.map( ( [ e ] ) => ( {
				type: ( e as Event ).type,
				detail: ( e as CustomEvent ).detail,
			} ) );

			expect( dispatched ).toContainEqual(
				expect.objectContaining( {
					type: EVENT_SET_TAB,
					detail: { tab: 'variables' },
				} )
			);

			dispatchSpy.mockRestore();
		} );
	} );

	// -------------------------------------------------------------------------
	// Open from specific panel events + route handoff
	// -------------------------------------------------------------------------

	describe( 'open from variables/classes events (via route handoff)', () => {
		it( 'should call openRoute when open-variables event fires', () => {
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_OPEN_VARIABLES );
			} );

			expect( jest.mocked( openRoute ) ).toHaveBeenCalledWith(
				V1_ELEMENTS_PANEL_ROUTE
			);
		} );

		it( 'should call openRoute when open-classes event fires', () => {
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_OPEN_CLASSES );
			} );

			expect( jest.mocked( openRoute ) ).toHaveBeenCalledWith(
				V1_ELEMENTS_PANEL_ROUTE
			);
		} );

		it( 'should call setPendingDesignSystemTab("variables") and open() after route resolves for variables', async () => {
			render( <DesignSystemEntrypoints /> );

			// Trigger the open-variables flow which sets the pending ref
			act( () => {
				dispatchWindowEvent( EVENT_OPEN_VARIABLES );
			} );

			// Simulate the V1 route-open event firing (e.g. panel nav completed)
			await fireRoutePanelOpen();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith(
				'variables'
			);
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should call setPendingDesignSystemTab("classes") and open() after route resolves for classes', async () => {
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_OPEN_CLASSES );
			} );

			await fireRoutePanelOpen();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith(
				'classes'
			);
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should not call open() if route fires without a pending tab', async () => {
			render( <DesignSystemEntrypoints /> );

			// Fire route open WITHOUT a prior open-variables/classes dispatch
			await fireRoutePanelOpen();

			expect( mockOpen ).not.toHaveBeenCalled();
		} );
	} );

	// -------------------------------------------------------------------------
	// Tab persistence: switch → close → reopen from top bar
	// -------------------------------------------------------------------------

	describe( 'tab persistence across close and reopen', () => {
		it( 'should reopen with the classes tab after user switched to classes then closed', async () => {
			// First session: open on variables, switch to classes via toggle
			jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: true } );
			jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'variables' );

			const { unmount } = render( <DesignSystemEntrypoints /> );

			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

			act( () => {
				// User clicks the Classes button in the top bar which triggers toggle
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'classes' } );
			} );

			// The panel should have dispatched set-tab (confirming the switch)
			const setTabCall = dispatchSpy.mock.calls.find(
				( [ e ] ) => ( e as Event ).type === EVENT_SET_TAB
			);
			expect( setTabCall ).toBeDefined();

			dispatchSpy.mockRestore();
			unmount();

			// Second session: panel closed, toggle fires with classes  tab
			// getActiveDesignSystemTab now returns 'classes' (as notified during the session)
			jest.clearAllMocks();
			jest.mocked( usePanelActions ).mockReturnValue( {
				open: mockOpen,
				close: mockClose,
			} );
			jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: false } );
			jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'classes' );

			const dispatchSpy2 = jest.spyOn( window, 'dispatchEvent' );

			render( <DesignSystemEntrypoints /> );

			act( () => {
				// Top-bar re-open: toggle fires with the classes tab
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'classes' } );
			} );

			// Panel was closed so it should dispatch the open-classes event
			const dispatched = dispatchSpy2.mock.calls.map( ( [ e ] ) => ( e as Event ).type );
			expect( dispatched ).toContain( EVENT_OPEN_CLASSES );

			dispatchSpy2.mockRestore();
		} );

		it( 'should reopen with variables tab when explicitly opened from variables after switching to classes', async () => {
			render( <DesignSystemEntrypoints /> );

			// Explicitly open via the variables panel event
			act( () => {
				dispatchWindowEvent( EVENT_OPEN_VARIABLES );
			} );

			await fireRoutePanelOpen();

			// Pending tab should be forced to variables
			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith(
				'variables'
			);
			expect( mockOpen ).toHaveBeenCalled();
		} );
	} );

	// -------------------------------------------------------------------------
	// URL parameter — deep-link opening
	//
	// The URL-based handler wraps its work in requestAnimationFrame (jsdom
	// polyfills this as setTimeout(fn, 0)), so these tests use fake timers to
	// advance the event loop after the route fires.
	// -------------------------------------------------------------------------

	describe( 'URL parameter handling', () => {
		beforeEach( () => {
			jest.useFakeTimers();
		} );

		afterEach( () => {
			jest.runOnlyPendingTimers();
			jest.useRealTimers();
		} );

		/** Fire route handlers and flush any pending RAF/timeout callbacks. */
		async function fireRoutePanelOpenWithTimers() {
			await fireRoutePanelOpen();
			act( () => {
				jest.runAllTimers();
			} );
		}

		it( 'should open with variables tab from active-panel=design-system&design-system-tab=variables', async () => {
			window.history.pushState(
				{},
				'',
				'/?active-panel=design-system&design-system-tab=variables'
			);

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith(
				'variables'
			);
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should open with classes tab from active-panel=design-system&design-system-tab=classes', async () => {
			window.history.pushState(
				{},
				'',
				'/?active-panel=design-system&design-system-tab=classes'
			);

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith(
				'classes'
			);
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should default to variables when active-panel=design-system has no tab param', async () => {
			window.history.pushState( {}, '', '/?active-panel=design-system' );

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith(
				'variables'
			);
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should open with classes tab from legacy active-panel=global-classes-manager', async () => {
			window.history.pushState(
				{},
				'',
				'/?active-panel=global-classes-manager'
			);

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith(
				'classes'
			);
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should open with variables tab from legacy active-panel=variables-manager', async () => {
			window.history.pushState(
				{},
				'',
				'/?active-panel=variables-manager'
			);

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith(
				'variables'
			);
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should not open when active-panel param is an unrecognised value', async () => {
			window.history.pushState( {}, '', '/?active-panel=something-else' );

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).not.toHaveBeenCalled();
			expect( mockOpen ).not.toHaveBeenCalled();
		} );

		it( 'should only open once even if routeOpenEvent fires multiple times', async () => {
			window.history.pushState(
				{},
				'',
				'/?active-panel=design-system&design-system-tab=variables'
			);

			render( <DesignSystemEntrypoints /> );

			// Fire the route open event twice — guard should prevent double open
			await fireRoutePanelOpenWithTimers();
			await fireRoutePanelOpenWithTimers();

			expect( mockOpen ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	// -------------------------------------------------------------------------
	// Component renders null — no visual output
	// -------------------------------------------------------------------------

	it( 'should render nothing (null) into the DOM', () => {
		const { container } = render( <DesignSystemEntrypoints /> );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
