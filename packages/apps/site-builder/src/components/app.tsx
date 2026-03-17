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
			if ( allowedOrigin && event.origin !== allowedOrigin ) {
				return;
			}

			const { type } = event.data ?? {};

			if ( type === 'get/referrer/info' ) {
				const iframe = iframeRef.current;
				if ( ! iframe?.contentWindow ) {
					return;
				}

				const config = getConfig();

				iframe.contentWindow.postMessage(
					{
						type: 'referrer/info',
						instanceId: event.data?.payload?.instanceId ?? '',
						info: {
							connectAuth: config?.connectAuth,
							page: {
								url: window.location.href,
							},
							user: { isAdmin: true },
						},
					},
					allowedOrigin || '*'
				);

				return;
			}

			if ( type === 'site-planner/deploy-website' ) {
				const iframe = iframeRef.current;
				const origin = event.origin;

				try {
					const result = await deployWebsite( event.data.payload );

					iframe?.contentWindow?.postMessage(
						{
							type: 'site-planner/deploy-website/result',
							payload: result,
						},
						origin || '*'
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
						origin || '*'
					);
				}
			}
		},
		[ allowedOrigin ]
	);

	useEffect( () => {
		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ handleMessage ] );

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
