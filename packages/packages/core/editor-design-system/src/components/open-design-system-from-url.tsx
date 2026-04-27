import { useEffect, useRef } from 'react';
import { __privateListenTo as listenTo, routeOpenEvent } from '@elementor/editor-v1-adapters';

import { setInitialDesignSystemTab } from '../initial-tab';
import { usePanelActions } from '../design-system-panel';

const ACTIVE_PANEL_PARAM = 'active-panel';
const PANEL_ID = 'design-system';
const LEGACY_GLOBAL_CLASSES_PANEL = 'global-classes-manager';
const LEGACY_VARIABLES_PANEL = 'variables-manager';
const DEFAULT_PANEL_ROUTE = 'panel/elements';

/**
 * Opens the design system panel from `?active-panel=design-system` (or legacy class/variable panel ids) once the editor is ready.
 */
export function OpenDesignSystemFromUrl() {
	const { open } = usePanelActions();
	const hasOpened = useRef( false );

	useEffect( () => {
		const urlParams = new URLSearchParams( window.location.search );
		const activePanel = urlParams.get( ACTIVE_PANEL_PARAM );

		if ( ! activePanel ) {
			return;
		}

		let targetTab: 'variables' | 'classes' | null = null;

		if ( activePanel === PANEL_ID ) {
			const tab = urlParams.get( 'design-system-tab' );
			if ( tab === 'classes' ) {
				targetTab = 'classes';
			} else {
				targetTab = 'variables';
			}
		} else if ( activePanel === LEGACY_GLOBAL_CLASSES_PANEL ) {
			targetTab = 'classes';
		} else if ( activePanel === LEGACY_VARIABLES_PANEL ) {
			targetTab = 'variables';
		} else {
			return;
		}

		const cleanup = listenTo( routeOpenEvent( DEFAULT_PANEL_ROUTE ), () => {
			if ( hasOpened.current ) {
				return;
			}

			hasOpened.current = true;

			requestAnimationFrame( () => {
				if ( targetTab ) {
					setInitialDesignSystemTab( targetTab );
				}
				void open();
			} );
		} );

		return cleanup;
	}, [ open ] );

	return null;
}
