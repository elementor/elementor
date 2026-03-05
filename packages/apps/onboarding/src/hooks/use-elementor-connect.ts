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

const CONNECT_SUCCESS_EVENT = 'elementor/connect/success';

export function useElementorConnect( {
	connectUrl,
	onSuccess,
}: ConnectOptions ) {
	const onSuccessRef = useRef( onSuccess );
	onSuccessRef.current = onSuccess;

	useEffect( () => {
		const handleNativeSuccess = ( event: Event ) => {
			const detail = ( event as CustomEvent ).detail;
			const data = ( detail ?? {} ) as ConnectSuccessData;
			onSuccessRef.current?.( data );
		};

		window.addEventListener(
			CONNECT_SUCCESS_EVENT,
			handleNativeSuccess
		);

		return () => {
			window.removeEventListener(
				CONNECT_SUCCESS_EVENT,
				handleNativeSuccess
			);
		};
	}, [] );

	const triggerConnect = useCallback( () => {
		if ( ! connectUrl ) {
			return;
		}

		const separator = connectUrl.includes( '?' ) ? '&' : '?';
		const popupUrl = `${ connectUrl }${ separator }mode=popup`;

		const features = `toolbar=no,menubar=no,width=${ POPUP_WIDTH },height=${ POPUP_HEIGHT },top=${ POPUP_TOP },left=${ POPUP_LEFT }`;

		const popup = window.open( popupUrl, 'elementorConnect', features );

		if ( ! popup ) {
			window.location.href = connectUrl;
		}
	}, [ connectUrl ] );

	return triggerConnect;
}
