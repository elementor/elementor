import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';

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

export function App() {
	const iframeRef = useRef< HTMLIFrameElement >( null );

	const handleMessage = useCallback( ( event: MessageEvent ) => {
		if ( event.data?.type !== 'get/referrer/info' ) {
			return;
		}

		const iframe = iframeRef.current;
		if ( ! iframe?.contentWindow ) {
			return;
		}

		iframe.contentWindow.postMessage( {
			type: 'referrer/info',
			instanceId: event.data?.payload?.instanceId ?? '',
			info: {
				authToken: '',
				origin: window.location.origin,
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
