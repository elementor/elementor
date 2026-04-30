import { useEffect, useRef, useState } from 'react';
import {
	__privateListenTo as listenTo,
	__privateOpenRoute as openRoute,
	routeOpenEvent,
} from '@elementor/editor-v1-adapters';

import { usePanelActions } from '../design-system-panel';
import { type DesignSystemTab, setPendingDesignSystemTab } from '../initial-tab';
import { DESIGN_SYSTEM_V1_READY_ROUTE } from '../v1-default-panel-route';

const EVENT_VARIABLES = 'elementor/open-variables-manager';
const EVENT_GLOBAL_CLASSES = 'elementor/open-global-classes-manager';

/**
 * Maps window events to the design system panel (initial tab: variables or classes).
 * - `elementor/open-variables-manager` — from the variable picker (matches variables shortcut).
 * - `elementor/open-global-classes-manager` — from the style tab class selector.
 */
export function OpenDesignSystemFromEvent() {
	const { open } = usePanelActions();
	/** When set, the next route-open callback will open the design system on this tab. */
	const pendingTabRef = useRef< DesignSystemTab | null >( null );
	const [ readyToOpen, setReadyToOpen ] = useState( false );

	useEffect( () => {
		if ( readyToOpen ) {
			setReadyToOpen( false );
			void open();
		}
	}, [ readyToOpen, open ] );

	useEffect( () => {
		return listenTo( routeOpenEvent( DESIGN_SYSTEM_V1_READY_ROUTE ), () => {
			const tab = pendingTabRef.current;
			if ( tab ) {
				pendingTabRef.current = null;
				setPendingDesignSystemTab( tab );
				setReadyToOpen( true );
			}
		} );
	}, [] );

	useEffect( () => {
		const bind = ( eventName: string, tab: DesignSystemTab ) => {
			const handler = () => {
				pendingTabRef.current = tab;
				openRoute( DESIGN_SYSTEM_V1_READY_ROUTE );
			};

			window.addEventListener( eventName, handler );

			return () => window.removeEventListener( eventName, handler );
		};

		const unlistenVariables = bind( EVENT_VARIABLES, 'variables' );
		const unlistenClasses = bind( EVENT_GLOBAL_CLASSES, 'classes' );

		return () => {
			unlistenVariables();
			unlistenClasses();
		};
	}, [] );

	return null;
}
