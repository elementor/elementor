import { useCallback, useEffect, useMemo } from 'react';
import type * as React from 'react';

import type { ConnectAuth } from '../connect-auth-schema';
import { deployWebsite } from '../deploy';
import { getElementorAiCurrentContext, getSiteBuilderConfig } from '../site-builder-config';

export type SiteBuilderParams = {
	siteType?: string;
	pageTitle?: string;
	isOnePage?: boolean;
};

export type { ConnectAuth };

function sendReferrerInfo(
	iframe: HTMLIFrameElement,
	event: MessageEvent,
	targetOrigin: string,
	siteBuilderParams: SiteBuilderParams,
	connectAuth: ConnectAuth | null
) {
	const config = getSiteBuilderConfig();

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

type UseSiteBuilderIframeMessagingArgs = {
	iframeRef: React.RefObject< HTMLIFrameElement | null >;
	iframeUrl: string;
	siteBuilderParams: SiteBuilderParams;
	connectAuth: ConnectAuth | null;
};

export function useSiteBuilderIframeMessaging( {
	iframeRef,
	iframeUrl,
	siteBuilderParams,
	connectAuth,
}: UseSiteBuilderIframeMessagingArgs ): void {
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
					sendReferrerInfo( iframe, event, allowedOrigin, siteBuilderParams, connectAuth );
				}
				return;
			}

			if ( type === 'site-planner/deploy-website' ) {
				await handleDeploy( iframeRef.current, event );
			}

			if ( type === 'element-selector/close' ) {
				const exitTo = getSiteBuilderConfig()?.exitTo;
				if ( window.top && exitTo && typeof exitTo === 'string' ) {
					window.top.location.href = exitTo;
				}
			}
		},
		[ allowedOrigin, siteBuilderParams, connectAuth, iframeRef ]
	);

	useEffect( () => {
		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ handleMessage ] );
}
