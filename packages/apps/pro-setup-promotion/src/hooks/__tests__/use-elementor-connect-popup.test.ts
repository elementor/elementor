import { act, renderHook } from '@testing-library/react';
import { useElementorConnectPopup } from '../use-elementor-connect-popup';

const POPUP_POLL_INTERVAL_MS = 400;

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

function findConnectEvent( mockJQuery: MockJQuery, kind: 'success' | 'error' ): string | undefined {
	return mockJQuery.on.mock.calls
		.map( ( [ event ] ) => event as string )
		.find( ( event ) => event.includes( `elementor/connect/${ kind }/` ) );
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
		( window as Window & { elementorCommon?: unknown } ).elementorCommon = {
			elements: { $window, $body },
		};
	} );

	afterEach( () => {
		openSpy.mockRestore();
		delete ( window as Window & { elementorCommon?: unknown } ).elementorCommon;
		jest.useRealTimers();
	} );

	it( 'calls onError and clears listeners when Connect jQuery targets are missing', () => {
		delete ( window as Window & { elementorCommon?: unknown } ).elementorCommon;
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

		const successEvent = findConnectEvent( $body, 'success' );
		expect( successEvent ).toBeDefined();

		act( () => {
			$body.emit( successEvent! );
		} );

		expect( onSuccess ).toHaveBeenCalledTimes( 1 );
		expect( onError ).not.toHaveBeenCalled();
		expect( popupClose ).toHaveBeenCalledTimes( 1 );

		act( () => {
			$body.emit( successEvent! );
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
			jest.advanceTimersByTime( POPUP_POLL_INTERVAL_MS );
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

		const successEvent = findConnectEvent( $window, 'success' );

		act( () => {
			$window.emit( successEvent! );
		} );

		popup.closed = true;

		act( () => {
			jest.advanceTimersByTime( POPUP_POLL_INTERVAL_MS );
		} );

		expect( onSuccess ).toHaveBeenCalledTimes( 1 );
		expect( onError ).not.toHaveBeenCalled();
	} );
} );
