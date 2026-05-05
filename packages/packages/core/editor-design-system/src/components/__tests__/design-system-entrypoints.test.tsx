import * as React from 'react';
import { act, render } from '@testing-library/react';

import { usePanelActions, usePanelStatus } from '../../design-system-panel';
import { getActiveDesignSystemTab, setPendingDesignSystemTab } from '../../initial-tab';
import { DesignSystemEntrypoints } from '../design-system-entrypoints';

const EVENT_OPEN_VARIABLES = 'elementor/open-variables-manager';
const EVENT_OPEN_CLASSES = 'elementor/open-global-classes-manager';
const EVENT_TOGGLE = 'elementor/toggle-design-system';
const EVENT_SET_TAB = 'elementor/design-system/set-tab';
const V1_ELEMENTS_PANEL_ROUTE = 'panel/elements/categories';

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

import { __privateListenTo as listenTo, __privateOpenRoute as openRoute } from '@elementor/editor-v1-adapters';

function dispatchWindowEvent( type: string, detail?: Record< string, unknown > ) {
	window.dispatchEvent( new CustomEvent( type, detail ? { detail } : undefined ) );
}

function capturedListenToHandlers( eventKey: string ): Array< () => void > {
	return jest
		.mocked( listenTo )
		.mock.calls.filter( ( [ event ] ) => ( event as unknown as string ) === eventKey )
		.map( ( [ , handler ] ) => handler as () => void );
}

async function fireRoutePanelOpen() {
	const key = `route:open:${ V1_ELEMENTS_PANEL_ROUTE }`;
	const handlers = capturedListenToHandlers( key );
	await act( async () => {
		handlers.forEach( ( h ) => h() );
	} );
}

describe( 'DesignSystemEntrypoints', () => {
	const mockOpen = jest.fn();
	const mockClose = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( usePanelActions ).mockReturnValue( {
			open: mockOpen,
			close: mockClose,
		} );

		jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: false, isBlocked: false } );
		jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'variables' );

		window.history.pushState( {}, '', '/' );
	} );

	describe( 'toggle event — panel is closed', () => {
		it( 'should dispatch open-variables event when toggled with variables tab', () => {
			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'variables' } );
			} );

			const dispatched = dispatchSpy.mock.calls.map( ( [ e ]: [ Event ] ) => ( e as Event ).type );
			expect( dispatched ).toContain( EVENT_OPEN_VARIABLES );

			dispatchSpy.mockRestore();
		} );

		it( 'should dispatch open-classes event when toggled with classes tab', () => {
			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'classes' } );
			} );

			const dispatched = dispatchSpy.mock.calls.map( ( [ e ]: [ Event ] ) => ( e as Event ).type );
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
				.map( ( [ e ]: [ Event ] ) => ( e as Event ).type )
				.filter( ( t: string ) => [ EVENT_OPEN_VARIABLES, EVENT_OPEN_CLASSES, EVENT_SET_TAB ].includes( t ) );
			expect( relevant ).toHaveLength( 0 );

			dispatchSpy.mockRestore();
		} );
	} );

	describe( 'toggle event — panel is open', () => {
		beforeEach( () => {
			jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: true, isBlocked: false } );
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

			const dispatched = dispatchSpy.mock.calls.map( ( [ e ]: [ Event ] ) => ( {
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

			const dispatched = dispatchSpy.mock.calls.map( ( [ e ]: [ Event ] ) => ( {
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

	describe( 'open from variables/classes events (via route handoff)', () => {
		it( 'should call openRoute when open-variables event fires', () => {
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_OPEN_VARIABLES );
			} );

			expect( jest.mocked( openRoute ) ).toHaveBeenCalledWith( V1_ELEMENTS_PANEL_ROUTE );
		} );

		it( 'should call openRoute when open-classes event fires', () => {
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_OPEN_CLASSES );
			} );

			expect( jest.mocked( openRoute ) ).toHaveBeenCalledWith( V1_ELEMENTS_PANEL_ROUTE );
		} );

		it( 'should call setPendingDesignSystemTab("variables") and open() after route resolves for variables', async () => {
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_OPEN_VARIABLES );
			} );

			await fireRoutePanelOpen();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith( 'variables' );
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should call setPendingDesignSystemTab("classes") and open() after route resolves for classes', async () => {
			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_OPEN_CLASSES );
			} );

			await fireRoutePanelOpen();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith( 'classes' );
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should not call open() if route fires without a pending tab', async () => {
			render( <DesignSystemEntrypoints /> );

			await fireRoutePanelOpen();

			expect( mockOpen ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'tab persistence across close and reopen', () => {
		it( 'should reopen with the classes tab after user switched to classes then closed', async () => {
			jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: true, isBlocked: false } );
			jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'variables' );

			const { unmount } = render( <DesignSystemEntrypoints /> );

			const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'classes' } );
			} );

			const setTabCall = dispatchSpy.mock.calls.find(
				( [ e ]: [ Event ] ) => ( e as Event ).type === EVENT_SET_TAB
			);
			expect( setTabCall ).toBeDefined();

			dispatchSpy.mockRestore();
			unmount();

			jest.clearAllMocks();
			jest.mocked( usePanelActions ).mockReturnValue( {
				open: mockOpen,
				close: mockClose,
			} );
			jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: false, isBlocked: false } );
			jest.mocked( getActiveDesignSystemTab ).mockReturnValue( 'classes' );

			const dispatchSpy2 = jest.spyOn( window, 'dispatchEvent' );

			render( <DesignSystemEntrypoints /> );

			act( () => {
				dispatchWindowEvent( EVENT_TOGGLE, { tab: 'classes' } );
			} );

			const dispatched = dispatchSpy2.mock.calls.map( ( [ e ]: [ Event ] ) => ( e as Event ).type );
			expect( dispatched ).toContain( EVENT_OPEN_CLASSES );

			dispatchSpy2.mockRestore();
		} );

	} );

	describe( 'URL parameter handling', () => {
		beforeEach( () => {
			jest.useFakeTimers();
		} );

		afterEach( () => {
			jest.runOnlyPendingTimers();
			jest.useRealTimers();
		} );

		async function fireRoutePanelOpenWithTimers() {
			await fireRoutePanelOpen();
			act( () => {
				jest.runAllTimers();
			} );
		}

		it( 'should open with variables tab from active-panel=design-system&design-system-tab=variables', async () => {
			window.history.pushState( {}, '', '/?active-panel=design-system&design-system-tab=variables' );

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith( 'variables' );
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should open with classes tab from active-panel=design-system&design-system-tab=classes', async () => {
			window.history.pushState( {}, '', '/?active-panel=design-system&design-system-tab=classes' );

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith( 'classes' );
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should default to variables when active-panel=design-system has no tab param', async () => {
			window.history.pushState( {}, '', '/?active-panel=design-system' );

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith( 'variables' );
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should open with classes tab from legacy active-panel=global-classes-manager', async () => {
			window.history.pushState( {}, '', '/?active-panel=global-classes-manager' );

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith( 'classes' );
			expect( mockOpen ).toHaveBeenCalled();
		} );

		it( 'should open with variables tab from legacy active-panel=variables-manager', async () => {
			window.history.pushState( {}, '', '/?active-panel=variables-manager' );

			render( <DesignSystemEntrypoints /> );
			await fireRoutePanelOpenWithTimers();

			expect( jest.mocked( setPendingDesignSystemTab ) ).toHaveBeenCalledWith( 'variables' );
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
			window.history.pushState( {}, '', '/?active-panel=design-system&design-system-tab=variables' );

			render( <DesignSystemEntrypoints /> );

			await fireRoutePanelOpenWithTimers();
			await fireRoutePanelOpenWithTimers();

			expect( mockOpen ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	it( 'should render nothing (null) into the DOM', () => {
		const { container } = render( <DesignSystemEntrypoints /> );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
