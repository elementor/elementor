import { useCallback, useEffect, useMemo, useRef } from 'react';
import type * as React from 'react';

import type { ConnectAuth } from '../connect-auth-schema';
import { deployWebsite } from '../deploy';
import { resolveEditorRedirectPageId } from '../deploy/can-redirect-after-deploy';
import {
	clearPendingEditorRedirect,
	completeEditorRedirectOnDeployAcknowledge,
	type PendingEditorRedirect,
	scheduleEditorRedirectAfterDeploy,
} from '../deploy/deploy-editor-redirect';
import type { DeployPayload } from '../deploy/types';
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

async function handleDeploy( iframe: HTMLIFrameElement | null, event: MessageEvent ): Promise< string | null > {
	const origin = event.origin || '*';
	const payload = event.data?.payload as DeployPayload | undefined;
	const isIncremental = payload?.mode === 'incremental';

	if ( ! payload ) {
		iframe?.contentWindow?.postMessage(
			{
				type: 'site-planner/deploy-website/result',
				payload: {
					status: 'error',
					error: 'Missing deploy payload',
				},
			},
			origin
		);
		return null;
	}

	try {
		const result = await deployWebsite( payload );

		iframe?.contentWindow?.postMessage(
			{
				type: 'site-planner/deploy-website/result',
				payload: result,
			},
			origin
		);

		const editorPageId = resolveEditorRedirectPageId( {
			isIncremental,
			homePageId: result.homePageId,
			pageIdMap: result.pageIdMap,
			pages: payload.pages,
			errors: result.errors,
		} );

		if ( editorPageId ) {
			return `/wp-admin/post.php?post=${ editorPageId }&action=elementor`;
		}

		return null;
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

		return null;
	}
}

type UseSiteBuilderIframeMessagingArgs = {
	iframeRef: React.RefObject< HTMLIFrameElement | null >;
	iframeUrl: string;
	siteBuilderParams: SiteBuilderParams;
	connectAuth: ConnectAuth | null;
	isConnectAuthResolved: boolean;
};

export function useSiteBuilderIframeMessaging( {
	iframeRef,
	iframeUrl,
	siteBuilderParams,
	connectAuth,
	isConnectAuthResolved,
}: UseSiteBuilderIframeMessagingArgs ): void {
	const pendingRedirectRef = useRef< PendingEditorRedirect | null >( null );
	const pendingHandshakeRef = useRef< MessageEvent | null >( null );

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
				if ( ! iframe?.contentWindow ) {
					return;
				}
				if ( ! isConnectAuthResolved ) {
					pendingHandshakeRef.current = event;
					return;
				}
				sendReferrerInfo( iframe, event, allowedOrigin, siteBuilderParams, connectAuth );
				return;
			}

			if ( type === 'site-planner/deploy-website' ) {
				clearPendingEditorRedirect( pendingRedirectRef.current );
				pendingRedirectRef.current = null;

				const redirectUrl = await handleDeploy( iframeRef.current, event );
				if ( redirectUrl ) {
					pendingRedirectRef.current = scheduleEditorRedirectAfterDeploy( redirectUrl );
				}
				return;
			}

			if ( type === 'site-planner/deploy-website/acknowledge' ) {
				completeEditorRedirectOnDeployAcknowledge( pendingRedirectRef.current );
				pendingRedirectRef.current = null;
				return;
			}

			if ( type === 'element-selector/close' ) {
				const exitTo = getSiteBuilderConfig()?.exitTo;
				if ( window.top && exitTo && typeof exitTo === 'string' ) {
					window.top.location.href = exitTo;
				}
			}
		},
		[ allowedOrigin, siteBuilderParams, connectAuth, isConnectAuthResolved, iframeRef ]
	);

	useEffect( () => {
		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ handleMessage ] );

	useEffect( () => {
		if ( ! isConnectAuthResolved ) {
			return;
		}
		const pending = pendingHandshakeRef.current;
		if ( ! pending ) {
			return;
		}
		const iframe = iframeRef.current;
		if ( ! iframe?.contentWindow ) {
			return;
		}
		sendReferrerInfo( iframe, pending, allowedOrigin, siteBuilderParams, connectAuth );
		pendingHandshakeRef.current = null;
	}, [ isConnectAuthResolved, connectAuth, allowedOrigin, siteBuilderParams, iframeRef ] );

	useEffect( () => {
		return () => clearPendingEditorRedirect( pendingRedirectRef.current );
	}, [] );
}
