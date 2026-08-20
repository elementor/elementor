import type * as React from 'react';
import { act, renderHook } from '@testing-library/react';

import {
	type ConnectAuth,
	type SiteBuilderParams,
	useSiteBuilderIframeMessaging,
} from '../use-site-builder-iframe-messaging';

jest.mock( '../../site-builder-config', () => ( {
	getSiteBuilderConfig: () => ( { isAdmin: true, exitTo: '/exit' } ),
	getElementorAiCurrentContext: () => ( { siteTitle: 'Test', siteAbout: [] } ),
} ) );

jest.mock( '../../deploy', () => ( { deployWebsite: jest.fn() } ) );
jest.mock( '../../deploy/can-redirect-after-deploy', () => ( { resolveEditorRedirectPageId: jest.fn() } ) );
jest.mock( '../../deploy/deploy-editor-redirect', () => ( {
	clearPendingEditorRedirect: jest.fn(),
	completeEditorRedirectOnDeployAcknowledge: jest.fn(),
	scheduleEditorRedirectAfterDeploy: jest.fn(),
} ) );

const IFRAME_URL = 'https://planner.elementor.com/chat.html';
const IFRAME_ORIGIN = 'https://planner.elementor.com';

const validConnectAuth: ConnectAuth = {
	signature: 'sig',
	accessToken: 'tok',
	clientId: 'client',
	homeUrl: 'https://example.com/',
	siteKey: 'site-key',
};

type HookProps = {
	connectAuth: ConnectAuth | null;
	isConnectAuthResolved: boolean;
	siteBuilderParams?: SiteBuilderParams;
};

const setupHook = ( initial: HookProps ) => {
	const postMessage = jest.fn();
	const fakeContentWindow = { postMessage } as unknown as Window;
	const iframeRef = { current: { contentWindow: fakeContentWindow } as unknown as HTMLIFrameElement };

	const { rerender } = renderHook(
		( props: HookProps ) =>
			useSiteBuilderIframeMessaging( {
				iframeRef: iframeRef as React.RefObject< HTMLIFrameElement | null >,
				iframeUrl: IFRAME_URL,
				siteBuilderParams: props.siteBuilderParams ?? {},
				connectAuth: props.connectAuth,
				isConnectAuthResolved: props.isConnectAuthResolved,
			} ),
		{ initialProps: initial }
	);

	const dispatchGetReferrerInfo = () => {
		act( () => {
			const evt = new Event( 'message' ) as unknown as MessageEvent & {
				data: unknown;
				origin: string;
				source: Window;
			};
			( evt as unknown as { data: unknown } ).data = {
				type: 'get/referrer/info',
				payload: { instanceId: 'inst-1' },
			};
			( evt as unknown as { origin: string } ).origin = IFRAME_ORIGIN;
			( evt as unknown as { source: Window } ).source = fakeContentWindow;
			window.dispatchEvent( evt );
		} );
	};

	return { postMessage, rerender, dispatchGetReferrerInfo };
};

describe( 'useSiteBuilderIframeMessaging - handshake queueing', () => {
	it( 'queues get/referrer/info while auth is in-flight, then flushes with connectAuth once resolved', () => {
		const { postMessage, rerender, dispatchGetReferrerInfo } = setupHook( {
			connectAuth: null,
			isConnectAuthResolved: false,
		} );

		dispatchGetReferrerInfo();

		expect( postMessage ).not.toHaveBeenCalled();

		rerender( { connectAuth: validConnectAuth, isConnectAuthResolved: true } );

		expect( postMessage ).toHaveBeenCalledTimes( 1 );
		const [ message, targetOrigin ] = postMessage.mock.calls[ 0 ];
		expect( targetOrigin ).toBe( IFRAME_ORIGIN );
		expect( message ).toMatchObject( {
			type: 'referrer/info',
			instanceId: 'inst-1',
			info: { connectAuth: validConnectAuth },
		} );
	} );

	it( 'flushes queued handshake with connectAuth:null when auth fetch fails', () => {
		const { postMessage, rerender, dispatchGetReferrerInfo } = setupHook( {
			connectAuth: null,
			isConnectAuthResolved: false,
		} );

		dispatchGetReferrerInfo();

		expect( postMessage ).not.toHaveBeenCalled();

		rerender( { connectAuth: null, isConnectAuthResolved: true } );

		expect( postMessage ).toHaveBeenCalledTimes( 1 );
		const [ message ] = postMessage.mock.calls[ 0 ];
		expect( message ).toMatchObject( {
			type: 'referrer/info',
			info: { connectAuth: null },
		} );
	} );

	it( 'responds immediately when connectAuth is already resolved before handshake arrives', () => {
		const { postMessage, dispatchGetReferrerInfo } = setupHook( {
			connectAuth: validConnectAuth,
			isConnectAuthResolved: true,
		} );

		dispatchGetReferrerInfo();

		expect( postMessage ).toHaveBeenCalledTimes( 1 );
		expect( postMessage.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			type: 'referrer/info',
			info: { connectAuth: validConnectAuth },
		} );
	} );

	it( 'does not re-flush after handshake has already been answered', () => {
		const { postMessage, rerender, dispatchGetReferrerInfo } = setupHook( {
			connectAuth: null,
			isConnectAuthResolved: false,
		} );

		dispatchGetReferrerInfo();
		rerender( { connectAuth: validConnectAuth, isConnectAuthResolved: true } );

		expect( postMessage ).toHaveBeenCalledTimes( 1 );

		rerender( {
			connectAuth: validConnectAuth,
			isConnectAuthResolved: true,
			siteBuilderParams: { siteType: 'blog' },
		} );

		expect( postMessage ).toHaveBeenCalledTimes( 1 );
	} );
} );
