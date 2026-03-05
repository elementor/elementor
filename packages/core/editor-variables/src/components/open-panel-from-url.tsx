import { useEffect, useRef } from 'react';
import { __privateListenTo as listenTo, routeOpenEvent } from '@elementor/editor-v1-adapters';

import { usePanelActions } from './variables-manager/variables-manager-panel';

const ACTIVE_PANEL_PARAM = 'active-panel';
const PANEL_ID = 'variables-manager';
const DEFAULT_PANEL_ROUTE = 'panel/elements';

export function OpenPanelFromUrl() {
	const { open } = usePanelActions();
	const hasOpened = useRef( false );

	useEffect( () => {
		const urlParams = new URLSearchParams( window.location.search );
		const activePanel = urlParams.get( ACTIVE_PANEL_PARAM );

		if ( activePanel !== PANEL_ID ) {
			return;
		}

		// Listen for the default panel route to open - this signals Elementor initialization is complete
		const cleanup = listenTo( routeOpenEvent( DEFAULT_PANEL_ROUTE ), () => {
			if ( hasOpened.current ) {
				return;
			}

			hasOpened.current = true;

			// Open panel after default route is established
			requestAnimationFrame( () => {
				open();
			} );
		} );

		return cleanup;
	}, [ open ] );

	return null;
}
