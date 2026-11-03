import { useCallback, useEffect, useRef } from 'react';

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_TOP = 200;
const POPUP_LEFT = 0;
const POPUP_CLOSED_POLL_INTERVAL_MS = 400;
const SETUP_VERIFY_POLL_INTERVAL_MS = 1500;
const POPUP_CLOSED_VERIFY_ATTEMPTS = 10;
const POPUP_CLOSED_VERIFY_DELAY_MS = 800;

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
	verifyConnectComplete?: () => Promise< boolean >;
};

let callbackCounter = 0;

function delay( ms: number ): Promise< void > {
	return new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );
}

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

export function useElementorConnectPopup( {
	connectUrl,
	onSuccess,
	onError,
	onPopupBlocked,
	verifyConnectComplete,
}: ConnectPopupOptions ) {
	const onSuccessRef = useRef( onSuccess );
	const onErrorRef = useRef( onError );
	const onPopupBlockedRef = useRef( onPopupBlocked );
	const verifyConnectCompleteRef = useRef( verifyConnectComplete );
	const activeCallbackRef = useRef< string | null >( null );
	const successHandlerRef = useRef< ( ( ...args: unknown[] ) => void ) | null >( null );
	const errorHandlerRef = useRef< ( ( ...args: unknown[] ) => void ) | null >( null );
	const popupClosedPollRef = useRef< ReturnType< typeof setInterval > | null >( null );
	const setupVerifyPollRef = useRef< ReturnType< typeof setInterval > | null >( null );
	const popupUrlRef = useRef< string >( '' );
	const popupWindowRef = useRef< Window | null >( null );
	const connectFlowCompletedRef = useRef( false );
	const verifyInFlightRef = useRef( false );
	const flowGenerationRef = useRef( 0 );

	onSuccessRef.current = onSuccess;
	onErrorRef.current = onError;
	onPopupBlockedRef.current = onPopupBlocked;
	verifyConnectCompleteRef.current = verifyConnectComplete;

	const clearPopupClosedPoll = useCallback( () => {
		if ( popupClosedPollRef.current ) {
			clearInterval( popupClosedPollRef.current );
			popupClosedPollRef.current = null;
		}
	}, [] );

	const clearSetupVerifyPoll = useCallback( () => {
		if ( setupVerifyPollRef.current ) {
			clearInterval( setupVerifyPollRef.current );
			setupVerifyPollRef.current = null;
		}
	}, [] );

	const detachListeners = useCallback( () => {
		const callbackId = activeCallbackRef.current;
		const $window = getConnectWindow();
		const $body = getConnectBody();

		clearPopupClosedPoll();
		clearSetupVerifyPoll();

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
		verifyInFlightRef.current = false;
	}, [ clearPopupClosedPoll, clearSetupVerifyPoll ] );

	useEffect(
		() => () => {
			flowGenerationRef.current += 1;
			connectFlowCompletedRef.current = true;
			detachListeners();
		},
		[ detachListeners ]
	);

	const isFlowStillActive = useCallback( ( flowGeneration: number, callbackId: string | null ) => {
		return (
			! connectFlowCompletedRef.current &&
			flowGeneration === flowGenerationRef.current &&
			callbackId === activeCallbackRef.current
		);
	}, [] );

	const verifySetupComplete = useCallback( async (): Promise< boolean > => {
		const verify = verifyConnectCompleteRef.current;

		if ( ! verify ) {
			return true;
		}

		return verify();
	}, [] );

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

	const tryCompleteConnectFlow = useCallback( async () => {
		if ( connectFlowCompletedRef.current || ! activeCallbackRef.current || verifyInFlightRef.current ) {
			return;
		}

		const verify = verifyConnectCompleteRef.current;

		if ( ! verify ) {
			finishConnectFlow( 'success' );
			return;
		}

		verifyInFlightRef.current = true;

		try {
			if ( await verifySetupComplete() ) {
				finishConnectFlow( 'success' );
			}
		} catch {
			// Keep listening while the connect popup is open.
		} finally {
			verifyInFlightRef.current = false;
		}
	}, [ finishConnectFlow, verifySetupComplete ] );

	const handlePopupClosed = useCallback( () => {
		if ( connectFlowCompletedRef.current || ! activeCallbackRef.current ) {
			return;
		}

		const callbackId = activeCallbackRef.current;
		const flowGeneration = flowGenerationRef.current;

		clearPopupClosedPoll();
		clearSetupVerifyPoll();

		void ( async () => {
			const verify = verifyConnectCompleteRef.current;

			if ( verify ) {
				for ( let attempt = 0; attempt < POPUP_CLOSED_VERIFY_ATTEMPTS; attempt++ ) {
					if ( ! isFlowStillActive( flowGeneration, callbackId ) ) {
						return;
					}

					try {
						if ( await verifySetupComplete() ) {
							finishConnectFlow( 'success' );
							return;
						}
					} catch {
						// Retry while license state catches up.
					}

					if ( attempt < POPUP_CLOSED_VERIFY_ATTEMPTS - 1 ) {
						await delay( POPUP_CLOSED_VERIFY_DELAY_MS );

						if ( ! isFlowStillActive( flowGeneration, callbackId ) ) {
							return;
						}
					}
				}
			}

			if ( ! isFlowStillActive( flowGeneration, callbackId ) ) {
				return;
			}

			finishConnectFlow( 'error' );
		} )();
	}, [ clearPopupClosedPoll, clearSetupVerifyPoll, finishConnectFlow, isFlowStillActive, verifySetupComplete ] );

	const startSetupVerifyPoll = useCallback( () => {
		clearSetupVerifyPoll();

		setupVerifyPollRef.current = setInterval( () => {
			const popup = popupWindowRef.current;

			if ( connectFlowCompletedRef.current || ! popup || popup.closed ) {
				return;
			}

			void tryCompleteConnectFlow();
		}, SETUP_VERIFY_POLL_INTERVAL_MS );
	}, [ clearSetupVerifyPoll, tryCompleteConnectFlow ] );

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
		startSetupVerifyPoll();

		popupClosedPollRef.current = setInterval( () => {
			if ( connectFlowCompletedRef.current ) {
				clearPopupClosedPoll();
				return;
			}

			if ( ! popup.closed ) {
				return;
			}

			handlePopupClosed();
		}, POPUP_CLOSED_POLL_INTERVAL_MS );

		return true;
	}, [ clearPopupClosedPoll, handlePopupClosed, startSetupVerifyPoll ] );

	return useCallback(
		( connectUrlOverride?: string ) => {
			const activeConnectUrl = connectUrlOverride ?? connectUrl;

			if ( ! activeConnectUrl ) {
				detachListeners();
				return;
			}

			connectFlowCompletedRef.current = false;
			detachListeners();
			flowGenerationRef.current += 1;

			const callbackId = `proSetupPromo${ ++callbackCounter }`;
			activeCallbackRef.current = callbackId;

			const successHandler = () => {
				void tryCompleteConnectFlow();
			};

			const errorHandler = () => {
				finishConnectFlow( 'error' );
			};

			successHandlerRef.current = successHandler;
			errorHandlerRef.current = errorHandler;

			const $window = getConnectWindow();
			const $body = getConnectBody();

			if ( ! $window && ! $body ) {
				detachListeners();
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

			popupUrlRef.current = buildPopupUrl( activeConnectUrl, callbackId );

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
		},
		[ connectUrl, detachListeners, finishConnectFlow, tryCompleteConnectFlow, tryOpenPopupWindow ]
	);
}
