import { useCallback, useEffect, useRef } from 'react';

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_TOP = 200;
const POPUP_LEFT = 0;
const POPUP_POLL_INTERVAL_MS = 400;

type JQueryLike = {
	on: ( event: string, handler: ( ...args: unknown[] ) => void ) => unknown;
	off: ( event: string, handler?: ( ...args: unknown[] ) => void ) => unknown;
};

type ElementorConnectWindow = Window & {
	elementorCommon?: {
		elements?: {
			$window?: JQueryLike;
			$body?: JQueryLike;
		};
	};
};

type ConnectPopupOptions = {
	connectUrl: string;
	onSuccess?: () => void | Promise< void >;
	onError?: () => void;
	onPopupBlocked?: ( retryOpen: () => void ) => void;
};

let callbackCounter = 0;

function getConnectWindow(): JQueryLike | undefined {
	return ( window as ElementorConnectWindow ).elementorCommon?.elements?.$window;
}

function getConnectBody(): JQueryLike | undefined {
	return ( window as ElementorConnectWindow ).elementorCommon?.elements?.$body;
}

function buildPopupUrl( connectUrl: string, callbackId: string ): string {
	const separator = connectUrl.includes( '?' ) ? '&' : '?';
	const modeParam = connectUrl.includes( 'mode=popup' ) ? '' : '&mode=popup';

	return `${ connectUrl }${ separator }callback_id=${ encodeURIComponent( callbackId ) }${ modeParam }`;
}

function closePopupWindow( popup: Window | null ) {
	if ( ! popup || popup.closed ) {
		return;
	}

	try {
		popup.close();
	} catch {
		// Popup may be cross-origin while navigating; ignore.
	}
}

export function useElementorConnectPopup( { connectUrl, onSuccess, onError, onPopupBlocked }: ConnectPopupOptions ) {
	const onSuccessRef = useRef( onSuccess );
	const onErrorRef = useRef( onError );
	const onPopupBlockedRef = useRef( onPopupBlocked );
	const activeCallbackRef = useRef< string | null >( null );
	const successHandlerRef = useRef< ( ( ...args: unknown[] ) => void ) | null >( null );
	const errorHandlerRef = useRef< ( ( ...args: unknown[] ) => void ) | null >( null );
	const popupPollRef = useRef< ReturnType< typeof setInterval > | null >( null );
	const popupUrlRef = useRef< string >( '' );
	const popupWindowRef = useRef< Window | null >( null );
	const connectFlowCompletedRef = useRef( false );

	onSuccessRef.current = onSuccess;
	onErrorRef.current = onError;
	onPopupBlockedRef.current = onPopupBlocked;

	const detachListeners = useCallback( () => {
		const callbackId = activeCallbackRef.current;
		const $window = getConnectWindow();
		const $body = getConnectBody();

		if ( popupPollRef.current ) {
			clearInterval( popupPollRef.current );
			popupPollRef.current = null;
		}

		if ( callbackId ) {
			if ( $window ) {
				if ( successHandlerRef.current ) {
					$window.off( `elementor/connect/success/${ callbackId }`, successHandlerRef.current );
				}
				if ( errorHandlerRef.current ) {
					$window.off( `elementor/connect/error/${ callbackId }`, errorHandlerRef.current );
				}
			}

			if ( $body ) {
				if ( successHandlerRef.current ) {
					$body.off( `elementor/connect/success/${ callbackId }`, successHandlerRef.current );
				}
				if ( errorHandlerRef.current ) {
					$body.off( `elementor/connect/error/${ callbackId }`, errorHandlerRef.current );
				}
			}
		}

		activeCallbackRef.current = null;
		successHandlerRef.current = null;
		errorHandlerRef.current = null;
		popupUrlRef.current = '';
		popupWindowRef.current = null;
	}, [] );

	useEffect( () => detachListeners, [ detachListeners ] );

	const finishConnectFlow = useCallback(
		( outcome: 'success' | 'error' ) => {
			if ( connectFlowCompletedRef.current ) {
				return;
			}

			connectFlowCompletedRef.current = true;
			closePopupWindow( popupWindowRef.current );
			detachListeners();

			if ( 'success' === outcome ) {
				void onSuccessRef.current?.();
				return;
			}

			onErrorRef.current?.();
		},
		[ detachListeners ]
	);

	const tryOpenPopupWindow = useCallback( (): boolean => {
		const popupUrl = popupUrlRef.current;

		if ( ! popupUrl ) {
			return false;
		}

		const features = `toolbar=no,menubar=no,width=${ POPUP_WIDTH },height=${ POPUP_HEIGHT },top=${ POPUP_TOP },left=${ POPUP_LEFT }`;
		const popup = window.open( popupUrl, 'elementorConnect', features );

		if ( ! popup ) {
			return false;
		}

		popupWindowRef.current = popup;

		popupPollRef.current = setInterval( () => {
			if ( connectFlowCompletedRef.current ) {
				if ( popupPollRef.current ) {
					clearInterval( popupPollRef.current );
					popupPollRef.current = null;
				}
				return;
			}

			if ( ! popup.closed ) {
				return;
			}

			if ( popupPollRef.current ) {
				clearInterval( popupPollRef.current );
				popupPollRef.current = null;
			}

			if ( ! activeCallbackRef.current ) {
				return;
			}

			finishConnectFlow( 'error' );
		}, POPUP_POLL_INTERVAL_MS );

		return true;
	}, [ finishConnectFlow ] );

	return useCallback( () => {
		if ( ! connectUrl ) {
			return;
		}

		connectFlowCompletedRef.current = false;
		detachListeners();

		const callbackId = `proSetupPromo${ ++callbackCounter }`;
		activeCallbackRef.current = callbackId;

		const successHandler = () => {
			finishConnectFlow( 'success' );
		};

		const errorHandler = () => {
			finishConnectFlow( 'error' );
		};

		successHandlerRef.current = successHandler;
		errorHandlerRef.current = errorHandler;

		const $window = getConnectWindow();
		const $body = getConnectBody();

		if ( ! $window && ! $body ) {
			onErrorRef.current?.();
			return;
		}

		const eventSuffix = callbackId;

		if ( $window ) {
			$window.on( `elementor/connect/success/${ eventSuffix }`, successHandler );
			$window.on( `elementor/connect/error/${ eventSuffix }`, errorHandler );
		}

		if ( $body ) {
			$body.on( `elementor/connect/success/${ eventSuffix }`, successHandler );
			$body.on( `elementor/connect/error/${ eventSuffix }`, errorHandler );
		}

		popupUrlRef.current = buildPopupUrl( connectUrl, callbackId );

		if ( tryOpenPopupWindow() ) {
			return;
		}

		const retryOpen = () => {
			if ( ! activeCallbackRef.current || ! popupUrlRef.current ) {
				return;
			}

			if ( tryOpenPopupWindow() ) {
				return;
			}

			onPopupBlockedRef.current?.( retryOpen );
		};

		onPopupBlockedRef.current?.( retryOpen );
	}, [ connectUrl, detachListeners, finishConnectFlow, tryOpenPopupWindow ] );
}
