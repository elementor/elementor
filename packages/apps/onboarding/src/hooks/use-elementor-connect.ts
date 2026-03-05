import { useCallback, useEffect, useRef } from 'react';

import type { ConnectSuccessData } from '../analytics';

interface ConnectOptions {
	connectUrl: string;
	onSuccess?: ( data: ConnectSuccessData ) => void;
}

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_TOP = 200;
const POPUP_LEFT = 0;

let callbackCounter = 0;

export function useElementorConnect( { connectUrl, onSuccess }: ConnectOptions ) {
	const onSuccessRef = useRef( onSuccess );
	onSuccessRef.current = onSuccess;

	const callbackIdRef = useRef( `ob${ ++callbackCounter }` );

	useEffect( () => {
		const cbId = callbackIdRef.current;
		const nativeEventName = `elementor/connect/success/${ cbId }`;

		const handleNativeSuccess = ( event: Event ) => {
			const data = ( event as CustomEvent ).detail as ConnectSuccessData;
			onSuccessRef.current?.( data ?? {} );
		};

		window.addEventListener( nativeEventName, handleNativeSuccess );

		return () => {
			window.removeEventListener( nativeEventName, handleNativeSuccess );
		};
	}, [] );

	const triggerConnect = useCallback( () => {
		if ( ! connectUrl ) {
			return;
		}

		const cbId = callbackIdRef.current;
		const separator = connectUrl.includes( '?' ) ? '&' : '?';
		const popupUrl = `${ connectUrl }${ separator }mode=popup&callback_id=${ cbId }`;

		const features = `toolbar=no,menubar=no,width=${ POPUP_WIDTH },height=${ POPUP_HEIGHT },top=${ POPUP_TOP },left=${ POPUP_LEFT }`;

		const popup = window.open( popupUrl, 'elementorConnect', features );

		if ( ! popup ) {
			window.location.href = connectUrl;
		}
	}, [ connectUrl ] );

	return triggerConnect;
}
