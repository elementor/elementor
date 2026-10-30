import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { __privateListenTo as listenTo, routeOpenEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { ProSetupPanelPromo } from './components/pro-setup-panel-promo';

const NOTICE_AREA_ID = 'elementor-panel-elements-notice-area';
const ELEMENTS_PANEL_ROUTE_PREFIX = 'panel/elements/';

let reactRoot: Root | null = null;
let mountedContainer: HTMLElement | null = null;

function unmountNotice() {
	reactRoot?.unmount();
	reactRoot = null;
	mountedContainer = null;
}

function mountNotice() {
	if ( ! window.elementor?.config?.proSetupPromotion ) {
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

export function init() {
	listenTo( [ v1ReadyEvent(), routeOpenEvent( ELEMENTS_PANEL_ROUTE_PREFIX ) ], mountNotice );
}
