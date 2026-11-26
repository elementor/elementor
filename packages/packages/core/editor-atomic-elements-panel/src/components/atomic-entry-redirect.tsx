import { useEffect } from 'react';
import {
	__privateIsRouteActive as isRouteActive,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';

import { ELEMENTS_ROUTE } from '../consts';
import { useElementsPanelSelection } from '../elements-panel-selection';
import { usePanelActions, usePanelStatus } from '../panel';

export function AtomicEntryRedirect() {
	const selection = useElementsPanelSelection();
	const { isActive } = useRouteStatus( ELEMENTS_ROUTE );
	const { isOpen, isBlocked } = usePanelStatus();
	const { open } = usePanelActions();

	useEffect( () => {
		if ( ! isActive || isOpen || isBlocked || selection !== 'atomic' ) {
			return;
		}

		// Other panels (e.g. Design System) pass through the elements route on their way to `panel/v2`, and their
		// `open()` may run earlier in the same commit. Re-check the live route so we don't steal the slot from them.
		// Relies on a V2 panel `open()` switching the route to `panel/v2` synchronously (editor-panels `sync.ts`).
		if ( ! isRouteActive( ELEMENTS_ROUTE ) ) {
			return;
		}

		open();
	}, [ isActive, isOpen, isBlocked, selection, open ] );

	return null;
}
