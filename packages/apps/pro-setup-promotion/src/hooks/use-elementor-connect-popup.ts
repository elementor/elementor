import { useCallback, useEffect, useRef } from 'react';

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_TOP = 200;
const POPUP_LEFT = 0;

type JQueryWindow = {
	on: ( event: string, handler: ( ...args: unknown[] ) => void ) => unknown;
	off: ( event: string, handler?: ( ...args: unknown[] ) => void ) => unknown;
};

type ElementorConnectWindow = Window & {
	elementorCommon?: {
		elements?: {
			$window?: JQueryWindow;
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

function getConnectWindow(): JQueryWindow | undefined {
	return ( window as ElementorConnectWindow ).elementorCommon?.elements?.$window;
}

function buildPopupUrl( connectUrl: string, callbackId: string ): string {
	const separator = connectUrl.includes( '?' ) ? '&' : '?';
	const modeParam = connectUrl.includes( 'mode=popup' ) ? '' : '&mode=popup';

	return `${ connectUrl }${ separator }callback_id=${ encodeURIComponent( callbackId ) }${ modeParam }`;
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

	onSuccessRef.current = onSuccess;
	onErrorRef.current = onError;
	onPopupBlockedRef.current = onPopupBlocked;

	const detachListeners = useCallback( () => {
		const callbackId = activeCallbackRef.current;
		const $window = getConnectWindow();

		if ( popupPollRef.current ) {
			clearInterval( popupPollRef.current );
			popupPollRef.current = null;
		}

		if ( ! $window || ! callbackId ) {
			activeCallbackRef.current = null;
			successHandlerRef.current = null;
			errorHandlerRef.current = null;
			popupUrlRef.current = '';
			return;
		}

		if ( successHandlerRef.current ) {
			$window.off( `elementor/connect/success/${ callbackId }`, successHandlerRef.current );
		}

		if ( errorHandlerRef.current ) {
			$window.off( `elementor/connect/error/${ callbackId }`, errorHandlerRef.current );
		}

		activeCallbackRef.current = null;
		successHandlerRef.current = null;
		errorHandlerRef.current = null;
		popupUrlRef.current = '';
	}, [] );

	useEffect( () => detachListeners, [ detachListeners ] );

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

		popupPollRef.current = setInterval( () => {
			if ( ! popup.closed ) {
				return;
			}

			if ( ! activeCallbackRef.current ) {
				if ( popupPollRef.current ) {
					clearInterval( popupPollRef.current );
					popupPollRef.current = null;
				}
				return;
			}

			detachListeners();
			onErrorRef.current?.();
		}, 400 );

		return true;
	}, [ detachListeners ] );

	return useCallback( () => {
		if ( ! connectUrl ) {
			return;
		}

		detachListeners();

		const callbackId = `proSetupPromo${ ++callbackCounter }`;
		activeCallbackRef.current = callbackId;

		const successHandler = () => {
			detachListeners();
			void onSuccessRef.current?.();
		};

		const errorHandler = () => {
			detachListeners();
			onErrorRef.current?.();
		};

		successHandlerRef.current = successHandler;
		errorHandlerRef.current = errorHandler;

		const $window = getConnectWindow();

		if ( ! $window ) {
			onErrorRef.current?.();
			return;
		}

		$window.on( `elementor/connect/success/${ callbackId }`, successHandler );
		$window.on( `elementor/connect/error/${ callbackId }`, errorHandler );

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
	}, [ connectUrl, detachListeners, tryOpenPopupWindow ] );
}
