import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
	__privateListenTo as listenTo,
	routeCloseEvent,
	routeOpenEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';

import { ProSetupPanelPromo } from './components/pro-setup-panel-promo';
import { showConnectSuccessNotificationAfterReloadIfPending } from './utils/post-reload-connect-success-notification';
import { PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM } from './utils/reload-editor-after-connect-success';

const NOTICE_AREA_ID = 'elementor-panel-elements-notice-area';
const ELEMENTS_PANEL_ROUTE_PREFIX = 'panel/elements/';
const WIDGETS_PANEL_ROUTE = 'panel/elements/categories';

function isWidgetsPanelActive(): boolean {
	const panelRoute = window.$e?.routes?.getCurrent?.()?.panel;

	return Boolean( panelRoute?.startsWith( WIDGETS_PANEL_ROUTE ) );
}

let reactRoot: Root | null = null;
let mountedContainer: HTMLElement | null = null;

function unmountNotice() {
	reactRoot?.unmount();
	reactRoot = null;
	mountedContainer = null;
}

function mountNotice() {
	if ( ! isWidgetsPanelActive() || ! window.elementor?.config?.proSetupPromotion ) {
		unmountNotice();
		return;
	}

	const container = document.getElementById( NOTICE_AREA_ID );

	if ( ! container ) {
		return;
	}

	if ( mountedContainer !== container ) {
		unmountNotice();
		reactRoot = createRoot( container );
		mountedContainer = container;
	}

	reactRoot?.render( React.createElement( ProSetupPanelPromo ) );
}

function syncNoticeWithActiveRoute() {
	if ( isWidgetsPanelActive() ) {
		mountNotice();
	} else {
		unmountNotice();
	}
}

function stripConnectReloadQueryParam() {
	try {
		const url = new URL( window.location.href );

		if ( ! url.searchParams.has( PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM ) ) {
			return;
		}

		url.searchParams.delete( PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM );
		window.history.replaceState( null, '', url.toString() );
	} catch {
		// ignore
	}
}

export function init() {
	listenTo( v1ReadyEvent(), () => {
		stripConnectReloadQueryParam();
		showConnectSuccessNotificationAfterReloadIfPending();
		syncNoticeWithActiveRoute();
	} );
	listenTo(
		[ routeOpenEvent( ELEMENTS_PANEL_ROUTE_PREFIX ), routeCloseEvent( ELEMENTS_PANEL_ROUTE_PREFIX ) ],
		syncNoticeWithActiveRoute
	);
}
