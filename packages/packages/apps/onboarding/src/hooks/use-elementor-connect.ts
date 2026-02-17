import { useCallback, useEffect, useRef } from 'react';

interface ConnectOptions {
	connectUrl: string;
	onSuccess?: () => void;
}

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_TOP = 200;
const POPUP_LEFT = 0;

export function useElementorConnect( { connectUrl, onSuccess }: ConnectOptions ) {
	const onSuccessRef = useRef( onSuccess );
	onSuccessRef.current = onSuccess;

	useEffect( () => {
		const handleSuccess = () => {
			onSuccessRef.current?.();
		};

		window.addEventListener( 'elementor/connect/success', handleSuccess );

		return () => {
			window.removeEventListener( 'elementor/connect/success', handleSuccess );
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
