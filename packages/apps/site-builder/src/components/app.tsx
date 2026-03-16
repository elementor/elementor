import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { deployWebsite } from '../deploy';

const IFRAME_URL = 'http://localhost:4000/website-planner/chat';

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

	const handleMessage = useCallback( async ( event: MessageEvent ) => {
		const { type } = event.data ?? {};

		if ( type === 'get/referrer/info' ) {
			const iframe = iframeRef.current;
			if ( ! iframe?.contentWindow ) {
				return;
			}

			const config = getConfig();

			iframe.contentWindow.postMessage( {
				type: 'referrer/info',
				instanceId: event.data?.payload?.instanceId ?? '',
				info: {
					authToken: '',
					origin: window.location.origin,
					connectAuth: config?.connectAuth || undefined,
					page: {
						url: window.location.href,
						editorSessionId: 'site-builder',
						elementorAiCurrentContext: {},
						bodyStyle: {
							backgroundColor: '',
							backgroundImage: '',
						},
					},
					products: {
						core: { version: '4.1.0' },
						pro: { isPro: false, accessLevel: '', accessTier: '' },
						ai: {
							config: { usage: {} },
							hasSubscription: false,
							usagePercentage: 0,
							subscription: { id: '', type: '', usedQuota: 0, quota: 0, status: '' },
						},
					},
					user: { isAdmin: true },
				},
			}, '*' );

			return;
		}

		if ( type === 'site-planner/deploy-website' ) {
			const iframe = iframeRef.current;
			const origin = event.origin;
			const config = getConfig();

			if ( ! config?.wpRestUrl || ! config?.nonce ) {
				iframe?.contentWindow?.postMessage( {
					type: 'site-planner/deploy-website/result',
					payload: { status: 'error', error: 'Missing REST configuration' },
				}, origin || '*' );
				return;
			}

			try {
				const result = await deployWebsite( config, event.data.payload );

				iframe?.contentWindow?.postMessage( {
					type: 'site-planner/deploy-website/result',
					payload: result,
				}, origin || '*' );

				if ( result.status === 'success' && result.homePageId ) {
					window.location.href = `/wp-admin/post.php?post=${ result.homePageId }&action=elementor`;
				}
			} catch ( err ) {
				iframe?.contentWindow?.postMessage( {
					type: 'site-planner/deploy-website/result',
					payload: {
						status: 'error',
						error: err instanceof Error ? err.message : 'Deploy failed',
					},
				}, origin || '*' );
			}
		}
	}, [] );

	useEffect( () => {
		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ handleMessage ] );

	return (
		<iframe
			ref={ iframeRef }
			src={ IFRAME_URL }
			style={ iframeStyle }
			title="Website Planner"
			allow="clipboard-read; clipboard-write"
		/>
	);
}
