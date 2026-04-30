import { useEffect, useRef, useState } from 'react';
import {
	__privateListenTo as listenTo,
	__privateOpenRoute as openRoute,
	routeOpenEvent,
} from '@elementor/editor-v1-adapters';

import { usePanelActions, usePanelStatus } from '../design-system-panel';
import {
	type DesignSystemTab,
	getActiveDesignSystemTab,
	setPendingDesignSystemTab,
} from '../initial-tab';

const V1_ELEMENTS_PANEL_ROUTE = 'panel/elements/categories';

const EVENT_OPEN_VARIABLES = 'elementor/open-variables-manager';
const EVENT_OPEN_CLASSES = 'elementor/open-global-classes-manager';
const EVENT_TOGGLE = 'elementor/toggle-design-system';
const EVENT_SET_TAB = 'elementor/design-system/set-tab';

const ACTIVE_PANEL_PARAM = 'active-panel';
const PANEL_ID = 'design-system';
const LEGACY_GLOBAL_CLASSES_PANEL = 'global-classes-manager';
const LEGACY_VARIABLES_PANEL = 'variables-manager';

/**
 * Subscribes to URL query params, window events, and v1 route readiness for opening / toggling
 * the Design System panel. Replaces separate injectIntoLogic roots for URL, event, and toggle flows.
 */
export function DesignSystemEntrypoints() {
	const { open, close } = usePanelActions();
	const { isOpen } = usePanelStatus();

	// --- Toggle from entry (style tab, variables gear): close / switch tab / delegate to open events ---
	const isOpenRef = useRef( isOpen );

	useEffect( () => {
		isOpenRef.current = isOpen;
	}, [ isOpen ] );

	useEffect( () => {
		const handler = ( event: Event ) => {
			const tab = ( event as CustomEvent< { tab: DesignSystemTab } > ).detail?.tab;
			if ( tab !== 'variables' && tab !== 'classes' ) {
				return;
			}

			if ( isOpenRef.current && getActiveDesignSystemTab() === tab ) {
				void close();
				return;
			}

			if ( isOpenRef.current ) {
				window.dispatchEvent( new CustomEvent( EVENT_SET_TAB, { detail: { tab } } ) );
				return;
			}

			window.dispatchEvent(
				new CustomEvent( tab === 'variables' ? EVENT_OPEN_VARIABLES : EVENT_OPEN_CLASSES )
			);
		};

		window.addEventListener( EVENT_TOGGLE, handler as EventListener );

		return () => {
			window.removeEventListener( EVENT_TOGGLE, handler as EventListener );
		};
	}, [ close ] );

	// --- Open from window events (pending tab + openRoute + route ready) ---
	const pendingTabRef = useRef< DesignSystemTab | null >( null );
	const [ readyToOpenFromEvent, setReadyToOpenFromEvent ] = useState( false );

	useEffect( () => {
		if ( readyToOpenFromEvent ) {
			setReadyToOpenFromEvent( false );
			void open();
		}
	}, [ readyToOpenFromEvent, open ] );

	useEffect( () => {
		return listenTo( routeOpenEvent( V1_ELEMENTS_PANEL_ROUTE ), () => {
			const tab = pendingTabRef.current;
			if ( tab ) {
				pendingTabRef.current = null;
				setPendingDesignSystemTab( tab );
				setReadyToOpenFromEvent( true );
			}
		} );
	}, [] );

	useEffect( () => {
		const bind = ( eventName: string, tab: DesignSystemTab ) => {
			const handler = () => {
				pendingTabRef.current = tab;
				openRoute( V1_ELEMENTS_PANEL_ROUTE );
			};

			window.addEventListener( eventName, handler );

			return () => window.removeEventListener( eventName, handler );
		};

		const unlistenVariables = bind( EVENT_OPEN_VARIABLES, 'variables' );
		const unlistenClasses = bind( EVENT_OPEN_CLASSES, 'classes' );

		return () => {
			unlistenVariables();
			unlistenClasses();
		};
	}, [] );

	// --- Open from URL (?active-panel=design-system or legacy ids) ---
	const hasOpenedFromUrl = useRef( false );

	useEffect( () => {
		const urlParams = new URLSearchParams( window.location.search );
		const activePanel = urlParams.get( ACTIVE_PANEL_PARAM );

		if ( ! activePanel ) {
			return;
		}

		let targetTab: 'variables' | 'classes' | null = null;

		if ( activePanel === PANEL_ID ) {
			const tab = urlParams.get( 'design-system-tab' );
			targetTab = tab === 'classes' ? 'classes' : 'variables';
		} else if ( activePanel === LEGACY_GLOBAL_CLASSES_PANEL ) {
			targetTab = 'classes';
		} else if ( activePanel === LEGACY_VARIABLES_PANEL ) {
			targetTab = 'variables';
		} else {
			return;
		}

		const cleanup = listenTo( routeOpenEvent( V1_ELEMENTS_PANEL_ROUTE ), () => {
			if ( hasOpenedFromUrl.current ) {
				return;
			}

			hasOpenedFromUrl.current = true;

			requestAnimationFrame( () => {
				if ( targetTab ) {
					setPendingDesignSystemTab( targetTab );
				}
				void open();
			} );
		} );

		return cleanup;
	}, [ open ] );

	return null;
}
