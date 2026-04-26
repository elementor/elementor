import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { deployWebsite } from '../deploy';

const iframeStyle: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100vw',
	height: '100vh',
	border: 'none',
	zIndex: 10000,
};

function getConfig() {
	return window.elementorAppConfig?.[ 'site-builder' ];
}

function getElementorAiCurrentContext() {
	return getConfig()?.elementorAiCurrentContext || {};
}

function sendReferrerInfo( iframe: HTMLIFrameElement, event: MessageEvent, targetOrigin: string ) {
	const config = getConfig();

	iframe.contentWindow?.postMessage(
		{
			type: 'referrer/info',
			instanceId: event.data?.payload?.instanceId ?? '',
			info: {
				connectAuth: config?.connectAuth,
				page: {
					url: window.location.href,
					elementorAiCurrentContext: getElementorAiCurrentContext(),
				},
				user: { isAdmin: config?.isAdmin ?? false },
			},
		},
		targetOrigin
	);
}

async function handleDeploy( iframe: HTMLIFrameElement | null, event: MessageEvent ) {
	const origin = event.origin || '*';

	try {
		const result = await deployWebsite( event.data.payload );

		iframe?.contentWindow?.postMessage(
			{
				type: 'site-planner/deploy-website/result',
				payload: result,
			},
			origin
		);

		if ( result.status === 'success' && result.homePageId ) {
			window.location.href = `/wp-admin/post.php?post=${ result.homePageId }&action=elementor`;
		}
	} catch ( err ) {
		iframe?.contentWindow?.postMessage(
			{
				type: 'site-planner/deploy-website/result',
				payload: {
					status: 'error',
					error: err instanceof Error ? err.message : 'Deploy failed',
				},
			},
			origin
		);
	}
}

export function App() {
	const iframeRef = useRef< HTMLIFrameElement >( null );

	const iframeUrl = useMemo( () => getConfig()?.iframeUrl ?? '', [] );

	const allowedOrigin = useMemo( () => {
		try {
			return new URL( iframeUrl ).origin;
		} catch {
			return '';
		}
	}, [ iframeUrl ] );

	const handleMessage = useCallback(
		async ( event: MessageEvent ) => {
			if ( ! allowedOrigin ) {
				return;
			}

			if ( event.origin !== allowedOrigin ) {
				return;
			}

			if ( event.source !== iframeRef.current?.contentWindow ) {
				return;
			}

			const { type } = event.data ?? {};

			if ( type === 'get/referrer/info' ) {
				const iframe = iframeRef.current;
				if ( iframe?.contentWindow ) {
					sendReferrerInfo( iframe, event, allowedOrigin );
				}
				return;
			}

			if ( type === 'site-planner/deploy-website' ) {
				await handleDeploy( iframeRef.current, event );
			}
		},
		[ allowedOrigin ]
	);

	useEffect( () => {
		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ handleMessage ] );

	useEffect( () => {
		const wpApiSettings = ( window as unknown as { wpApiSettings?: { nonce?: string; root?: string } } )
			.wpApiSettings;
		const nonce = wpApiSettings?.nonce || '';
		if ( ! nonce ) {
			return;
		}

		const baseUrl = wpApiSettings?.root || '/wp-json/';
		const settingsUrl = `${ baseUrl }elementor/v1/site-builder/snapshot`;

		fetch( settingsUrl, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': nonce,
			},
			body: JSON.stringify( { value: {} } ),
		} ).catch( () => {} );
	}, [] );

	return (
		<iframe
			ref={ iframeRef }
			src={ iframeUrl }
			style={ iframeStyle }
			title="Website Planner"
			allow="clipboard-read; clipboard-write"
		/>
	);
}
