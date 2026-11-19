import * as React from 'react';
import {
	__privateUseListenTo as useListenTo,
	__privateUseRouteStatus as useRouteStatus,
	routeOpenEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';
import { Box, Portal } from '@elementor/ui';

import { ELEMENTS_ROUTE, PANEL_HEADER_ID } from '../consts';
import { usePanelActions, usePanelStatus } from '../panel';
import { ElementsPanelSwitcher } from './elements-panel-switcher';

export function LegacyPanelSwitcher() {
	const { isActive } = useRouteStatus( ELEMENTS_ROUTE );
	const { isBlocked } = usePanelStatus();
	const { open, close } = usePanelActions();

	const container = useListenTo( [ v1ReadyEvent(), routeOpenEvent( `${ ELEMENTS_ROUTE }/` ) ], () =>
		document.getElementById( PANEL_HEADER_ID )
	);

	return isActive && container ? (
		<Portal container={ container }>
			<Box sx={ { display: 'flex', alignItems: 'center', px: 1.5 } }>
				<ElementsPanelSwitcher value="non_atomic" isBlocked={ isBlocked } open={ open } close={ close } />
			</Box>
		</Portal>
	) : null;
}
