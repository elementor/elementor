import { useEffect } from 'react';
import { __privateUseRouteStatus as useRouteStatus } from '@elementor/editor-v1-adapters';

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

		open();
	}, [ isActive, isOpen, isBlocked, selection, open ] );

	return null;
}
