import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

function wpRestFetch( path: string, init?: RequestInit ) {
	const wpApiSettings = window.wpApiSettings;
	const nonce = wpApiSettings?.nonce || '';
	const baseUrl = wpApiSettings?.root || '/wp-json/';
	
	return fetch( `${ baseUrl }${ path }`, {
		credentials: 'include',
		...init,
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': nonce,
			...init?.headers,
		},
	} );
}

type SiteBuilderParams = {
	siteType?: string;
	pageTitle?: string;
	isOnePage?: boolean;
};

type ConnectAuth = {
	signature: string;
	accessToken: string;
	clientId: string;
	homeUrl: string;
	siteKey: string;
};

function isValidConnectAuth( data: unknown ): data is ConnectAuth {
	if ( ! data || typeof data !== 'object' ) {
		return false;
	}

	const auth = data as Record< string, unknown >;

	return (
		typeof auth.signature === 'string' && auth.signature.length > 0 &&
		typeof auth.accessToken === 'string' && auth.accessToken.length > 0 &&
		typeof auth.clientId === 'string' && auth.clientId.length > 0 &&
		typeof auth.homeUrl === 'string' && auth.homeUrl.length > 0 &&
		typeof auth.siteKey === 'string' && auth.siteKey.length > 0
	);
}

function sendReferrerInfo(
	iframe: HTMLIFrameElement,
	event: MessageEvent,
	targetOrigin: string,
	siteBuilderParams: SiteBuilderParams,
	connectAuth: ConnectAuth | null
) {
	const config = getConfig();

	iframe.contentWindow?.postMessage(
		{
			type: 'referrer/info',
			instanceId: event.data?.payload?.instanceId ?? '',
			info: {
				connectAuth,
				exitTo: config?.exitTo,
				page: {
					url: window.location.href,
					elementorAiCurrentContext: getElementorAiCurrentContext(),
				},
				user: { isAdmin: config?.isAdmin ?? false },
				siteBuilderParams,
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
	const [ siteBuilderParams, setSiteBuilderParams ] = useState< SiteBuilderParams >( {} );
	const [ connectAuth, setConnectAuth ] = useState< ConnectAuth | null >( null );

	const iframeUrl = useMemo( () => getConfig()?.iframeUrl ?? '', [] );

	const allowedOrigin = useMemo( () => {
		try {
			return new URL( iframeUrl ).origin;
		} catch {
			return '';
		}
	}, [ iframeUrl ] );

	useEffect( () => {
		const fetchConnectAuth = async () => {
			try {
				const response = await wpRestFetch( 'elementor/v1/site-builder/auth', {
					method: 'GET',
				} );

				if ( ! response.ok ) {
					throw new Error( 'Failed to fetch auth credentials' );
				}

				const json = await response.json();

				if ( json.success && json.data && isValidConnectAuth( json.data ) ) {
					setConnectAuth( json.data );
				} else {
					throw new Error( 'Invalid auth response: missing required Connect fields' );
				}
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to fetch connectAuth:', err );
			}
		};

		fetchConnectAuth();
	}, [] );

	useEffect( () => {
		if ( ! window.opener ) {
			return;
		}

		const onInit = ( event: MessageEvent ) => {
			if ( event.source !== window.opener ) {
				return;
			}
			if ( event.origin !== window.location.origin ) {
				return;
			}
			if ( event.data?.type !== 'site-builder/init' ) {
				return;
			}
			setSiteBuilderParams( event.data.payload ?? {} );
			window.removeEventListener( 'message', onInit );
		};

		window.addEventListener( 'message', onInit );
		window.opener.postMessage( { type: 'site-builder/ready' }, window.location.origin );

		return () => window.removeEventListener( 'message', onInit );
	}, [] );

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
				sendReferrerInfo( iframe, event, allowedOrigin, siteBuilderParams, connectAuth );
			}
			return;
		}

		if ( type === 'site-planner/deploy-website' ) {
			await handleDeploy( iframeRef.current, event );
		}

		if ( type === 'element-selector/close' ) {
			const exitTo = getConfig()?.exitTo;
			if ( window.top && exitTo && typeof exitTo === 'string' ) {
				window.top.location.href = exitTo;
			}
		}
		},
		[ allowedOrigin, siteBuilderParams, connectAuth ]
	);

	useEffect( () => {
		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ handleMessage ] );

	useEffect( () => {
		const wpApiSettings = window.wpApiSettings;
		const nonce = wpApiSettings?.nonce || '';
		if ( ! nonce ) {
			return;
		}

		wpRestFetch( 'elementor/v1/site-builder/snapshot', {
			method: 'POST',
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
