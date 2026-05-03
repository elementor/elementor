import { useEffect, useRef, useState } from 'react';
import {
	__privateListenTo as listenTo,
	__privateOpenRoute as openRoute,
	routeOpenEvent,
} from '@elementor/editor-v1-adapters';

import { usePanelActions } from './variables-manager/variables-manager-panel';

const EVENT_NAME = 'elementor/open-variables-manager';
const DEFAULT_PANEL_ROUTE = 'panel/elements/categories';

export function OpenPanelFromEvent() {
	const { open } = usePanelActions();
	const pendingRef = useRef( false );
	const [ readyToOpen, setReadyToOpen ] = useState( false );

	useEffect( () => {
		if ( readyToOpen ) {
			setReadyToOpen( false );
			open();
		}
	}, [ readyToOpen, open ] );

	useEffect( () => {
		return listenTo( routeOpenEvent( DEFAULT_PANEL_ROUTE ), () => {
			if ( pendingRef.current ) {
				pendingRef.current = false;
				setReadyToOpen( true );
			}
		} );
	}, [] );

	useEffect( () => {
		const handler = () => {
			pendingRef.current = true;
			openRoute( DEFAULT_PANEL_ROUTE );
		};

		window.addEventListener( EVENT_NAME, handler );

		return () => window.removeEventListener( EVENT_NAME, handler );
	}, [] );

	return null;
}
