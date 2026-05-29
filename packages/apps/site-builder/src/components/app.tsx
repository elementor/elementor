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
import { buildIframeUrl } from '../utils/build-iframe-url';
import { SiteBuilderLoader } from './site-builder-loader';

const iframeStyle: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100vw',
	height: '100vh',
	border: 'none',
	zIndex: 10000,
};

const AUTH_PATH = '/elementor/v1/site-builder/auth';
const HOME_SCREEN_PATH = '/elementor/v1/site-builder/home-screen';
const SNAPSHOT_PATH = '/elementor/v1/site-builder/snapshot';

type SiteBuilderAuthResponse = {
	success?: boolean;
	data?: unknown;
};

type HomeScreenResponse = {
	sessionId?: string | null;
	step?: number | null;
};

function parseHomeScreenSession( data: HomeScreenResponse | null | undefined ) {
	if ( ! data ) {
		return null;
	}

	const sessionId = typeof data.sessionId === 'string' ? data.sessionId.trim() : '';
	const step = Number.isFinite( data.step ) ? Number( data.step ) : null;

	if ( ! sessionId || step === null ) {
		return null;
	}

	return { sessionId, step };
}

export function App() {
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const [ siteBuilderParams, setSiteBuilderParams ] = useState< SiteBuilderParams >( {} );
	const [ connectAuth, setConnectAuth ] = useState< ConnectAuth | null >( null );
	const [ homeScreenSession, setHomeScreenSession ] = useState< ReturnType<typeof parseHomeScreenSession > >( null );
	const [ isHomeScreenFetchSettled, setIsHomeScreenFetchSettled ] = useState( false );

	const baseIframeUrl = useMemo( () => getSiteBuilderConfig()?.iframeUrl ?? '', [] );

	const iframeUrl = useMemo( () => {
		if ( ! isHomeScreenFetchSettled ) {
			return '';
		}

		return buildIframeUrl( baseIframeUrl, homeScreenSession );
	}, [ baseIframeUrl, homeScreenSession, isHomeScreenFetchSettled ] );

	useSiteBuilderIframeMessaging( {
		iframeRef,
		iframeUrl: iframeUrl || baseIframeUrl,
		siteBuilderParams,
		connectAuth,
	} );

	useEffect( () => {
		let cancelled = false;

		const fetchConnectAuth = async () => {
			try {
				const json = await apiFetch< SiteBuilderAuthResponse >( {
					path: AUTH_PATH,
				} );

				if ( cancelled ) {
					return;
				}

				if ( json.success && json.data && isValidConnectAuth( json.data ) ) {
					setConnectAuth( json.data );
				} else {
					throw new Error( 'Invalid auth response: missing required Connect fields' );
				}
			} catch ( err ) {
				if ( ! cancelled ) {
					// eslint-disable-next-line no-console
					console.error( 'Failed to fetch connectAuth:', err );
				}
			}
		};

		const fetchHomeScreen = async () => {
			try {
				const data = await apiFetch< HomeScreenResponse >( {
					path: HOME_SCREEN_PATH,
				} );

				if ( ! cancelled ) {
					setHomeScreenSession( parseHomeScreenSession( data ) );
				}
			} catch {
				if ( ! cancelled ) {
					setHomeScreenSession( null );
				}
			} finally {
				if ( ! cancelled ) {
					setIsHomeScreenFetchSettled( true );
				}
			}
		};

		void fetchConnectAuth();
		void fetchHomeScreen();

		return () => {
			cancelled = true;
		};
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
			path: SNAPSHOT_PATH,
			method: 'POST',
			data: { value: {} },
		} ).catch( () => {} );
	}, [] );

	if ( ! iframeUrl ) {
		return <SiteBuilderLoader />;
	}

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
