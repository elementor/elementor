import * as React from 'react';
import {
	__privateUseListenTo as useListenTo,
	__privateUseRouteStatus as useRouteStatus,
	routeOpenEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';
import { Box, Portal } from '@elementor/ui';

import { ELEMENTS_ROUTE, NOTICE_AREA_ID } from '../consts';
import { ElementsPanelSwitcher } from './elements-panel-switcher';

export function LegacyPanelSwitcher() {
	const { isActive } = useRouteStatus( ELEMENTS_ROUTE );

	const container = useListenTo( [ v1ReadyEvent(), routeOpenEvent( `${ ELEMENTS_ROUTE }/` ) ], () =>
		document.getElementById( NOTICE_AREA_ID )
	);

	return isActive && container ? (
		<Portal container={ container }>
			<Box sx={ { display: 'flex', justifyContent: 'flex-end', px: 2, py: 1 } }>
				<ElementsPanelSwitcher value="non_atomic" />
			</Box>
		</Portal>
	) : null;
}
