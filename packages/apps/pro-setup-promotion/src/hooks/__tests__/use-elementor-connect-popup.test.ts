import { act, renderHook } from '@testing-library/react';

import { useElementorConnectPopup } from '../use-elementor-connect-popup';

const POPUP_CLOSED_POLL_INTERVAL_MS = 400;

type MockJQuery = {
	on: jest.Mock;
	off: jest.Mock;
	emit: ( event: string ) => void;
};

function createMockJQuery(): MockJQuery {
	const handlers = new Map< string, ( ...args: unknown[] ) => void >();

	return {
		on: jest.fn( ( event: string, handler: ( ...args: unknown[] ) => void ) => {
			handlers.set( event, handler );
		} ),
		off: jest.fn( ( event: string, handler?: ( ...args: unknown[] ) => void ) => {
			if ( ! handler || handlers.get( event ) === handler ) {
				handlers.delete( event );
			}
		} ),
		emit: ( event: string ) => {
			handlers.get( event )?.();
		},
	};
}

function requireConnectEvent( mockJQuery: MockJQuery, kind: 'success' | 'error' ): string {
	const event = mockJQuery.on.mock.calls
		.map( ( [ eventName ] ) => eventName as string )
		.find( ( eventName ) => eventName.includes( `elementor/connect/${ kind }/` ) );

	if ( ! event ) {
		throw new Error( `Expected elementor/connect/${ kind } event` );
	}

	return event;
}

type TestConnectWindow = {
	elementorCommon?: {
		elements?: {
			$body?: MockJQuery;
			$window?: MockJQuery;
		};
	};
};

function setConnectJQueryMocks( $window: MockJQuery, $body: MockJQuery ) {
	( window as unknown as TestConnectWindow ).elementorCommon = {
		elements: { $window, $body },
	};
}

function clearConnectJQueryMocks() {
	delete ( window as unknown as TestConnectWindow ).elementorCommon;
}

describe( 'useElementorConnectPopup', () => {
	let $window: MockJQuery;
	let $body: MockJQuery;
	let popupClose: jest.Mock;
	let popup: { closed: boolean; close: jest.Mock };
	let openSpy: jest.SpyInstance;

	beforeEach( () => {
		jest.useFakeTimers();
		$window = createMockJQuery();
		$body = createMockJQuery();
		popupClose = jest.fn();
		popup = { closed: false, close: popupClose };
		openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => popup as unknown as Window );
		setConnectJQueryMocks( $window, $body );
	} );

	afterEach( () => {
		openSpy.mockRestore();
		clearConnectJQueryMocks();
		jest.useRealTimers();
	} );

	it( 'calls onError and clears listeners when Connect jQuery targets are missing', () => {
		clearConnectJQueryMocks();
		const onError = jest.fn();
		const { result } = renderHook( () =>
			useElementorConnectPopup( {
				connectUrl: 'https://example.com/connect',
				onError,
			} )
		);

		act( () => {
			result.current();
		} );

		expect( onError ).toHaveBeenCalledTimes( 1 );
		expect( openSpy ).not.toHaveBeenCalled();

		act( () => {
			result.current();
		} );

		expect( onError ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'completes success once, closes popup, and ignores duplicate success events', () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		const { result } = renderHook( () =>
			useElementorConnectPopup( {
				connectUrl: 'https://example.com/connect',
				onSuccess,
				onError,
			} )
		);

		act( () => {
			result.current();
		} );

		const successEvent = requireConnectEvent( $body, 'success' );

		act( () => {
			$body.emit( successEvent );
		} );

		expect( onSuccess ).toHaveBeenCalledTimes( 1 );
		expect( onError ).not.toHaveBeenCalled();
		expect( popupClose ).toHaveBeenCalledTimes( 1 );

		act( () => {
			$body.emit( successEvent );
		} );

		expect( onSuccess ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls onError when the user closes the popup before Connect completes', () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		const { result } = renderHook( () =>
			useElementorConnectPopup( {
				connectUrl: 'https://example.com/connect',
				onSuccess,
				onError,
			} )
		);

		act( () => {
			result.current();
		} );

		popup.closed = true;

		act( () => {
			jest.advanceTimersByTime( POPUP_CLOSED_POLL_INTERVAL_MS );
		} );

		expect( onError ).toHaveBeenCalledTimes( 1 );
		expect( onSuccess ).not.toHaveBeenCalled();
	} );

	it( 'does not call onError when popup closes after success', () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		const { result } = renderHook( () =>
			useElementorConnectPopup( {
				connectUrl: 'https://example.com/connect',
				onSuccess,
				onError,
			} )
		);

		act( () => {
			result.current();
		} );

		const successEvent = requireConnectEvent( $window, 'success' );

		act( () => {
			$window.emit( successEvent );
		} );

		popup.closed = true;

		act( () => {
			jest.advanceTimersByTime( POPUP_CLOSED_POLL_INTERVAL_MS );
		} );

		expect( onSuccess ).toHaveBeenCalledTimes( 1 );
		expect( onError ).not.toHaveBeenCalled();
	} );

	it( 'calls onSuccess when popup closes if verifyConnectComplete succeeds', async () => {
		const onSuccess = jest.fn();
		const onError = jest.fn();
		const verifyConnectComplete = jest.fn().mockResolvedValue( true );
		const { result } = renderHook( () =>
			useElementorConnectPopup( {
				connectUrl: 'https://example.com/connect',
				onSuccess,
				onError,
				verifyConnectComplete,
			} )
		);

		act( () => {
			result.current();
		} );

		popup.closed = true;

		await act( async () => {
			jest.advanceTimersByTime( POPUP_CLOSED_POLL_INTERVAL_MS );
			await Promise.resolve();
		} );

		expect( verifyConnectComplete ).toHaveBeenCalled();
		expect( onSuccess ).toHaveBeenCalledTimes( 1 );
		expect( onError ).not.toHaveBeenCalled();
	} );
} );
