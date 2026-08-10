import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import apiFetch from '@wordpress/api-fetch';

import { isValidConnectAuth } from '../connect-auth-schema';
import {
	type ConnectAuth,
	type SiteBuilderParams,
	useSiteBuilderIframeMessaging,
} from '../hooks/use-site-builder-iframe-messaging';
import { getSiteBuilderConfig } from '../site-builder-config';

const iframeStyle: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100vw',
	height: '100vh',
	border: 'none',
	zIndex: 10000,
};

type SiteBuilderAuthResponse = {
	success?: boolean;
	data?: unknown;
};

export function App() {
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const [ siteBuilderParams, setSiteBuilderParams ] = useState< SiteBuilderParams >( {} );
	const [ connectAuth, setConnectAuth ] = useState< ConnectAuth | null >( null );
	const [ isConnectAuthResolved, setIsConnectAuthResolved ] = useState( false );

	const iframeUrl = useMemo( () => getSiteBuilderConfig()?.iframeUrl ?? '', [] );

	useSiteBuilderIframeMessaging( {
		iframeRef,
		iframeUrl,
		siteBuilderParams,
		connectAuth,
		isConnectAuthResolved,
	} );

	useEffect( () => {
		const fetchConnectAuth = async () => {
			try {
				const json = await apiFetch< SiteBuilderAuthResponse >( {
					path: '/elementor/v1/site-builder/auth',
				} );

				if ( json.success && json.data && isValidConnectAuth( json.data ) ) {
					setConnectAuth( json.data );
				} else {
					throw new Error( 'Invalid auth response: missing required Connect fields' );
				}
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to fetch connectAuth:', err );
			} finally {
				setIsConnectAuthResolved( true );
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

	useEffect( () => {
		const wpApiSettings = window.wpApiSettings;
		const nonce = wpApiSettings?.nonce || '';
		if ( ! nonce ) {
			return;
		}

		apiFetch( {
			path: '/elementor/v1/site-builder/snapshot',
			method: 'POST',
			data: { value: {} },
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
