import { useEffect, useRef } from 'react';
import { __privateUseRouteStatus as useRouteStatus } from '@elementor/editor-v1-adapters';

import { ELEMENTS_ROUTE } from '../consts';
import { useElementsPanelSelection } from '../elements-panel-selection';
import { usePanelActions, usePanelStatus } from '../panel';

export function AtomicEntryRedirect() {
	const selection = useElementsPanelSelection();
	const { isActive } = useRouteStatus( ELEMENTS_ROUTE );
	const { isOpen, isBlocked } = usePanelStatus();
	const { open } = usePanelActions();
	const hasFailed = useRef( false );

	useEffect( () => {
		if ( ! isActive || isOpen || isBlocked || hasFailed.current || selection !== 'atomic' ) {
			return;
		}

		open().catch( () => {
			hasFailed.current = true;
		} );
	}, [ isActive, isOpen, isBlocked, selection, open ] );

	return null;
}
