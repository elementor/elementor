import * as React from 'react';
import { __privateUseListenTo as useListenTo, routeOpenEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';
import { Portal } from '@elementor/ui';

const NOTICE_AREA_ID = 'elementor-panel-elements-notice-area';
const ELEMENTS_PANEL_ROUTE_PREFIX = 'panel/elements/';

type Props = { component: React.ComponentType };

export function NoticePortal( { component: Component }: Props ) {
	const container = useListenTo( [ v1ReadyEvent(), routeOpenEvent( ELEMENTS_PANEL_ROUTE_PREFIX ) ], () =>
		document.getElementById( NOTICE_AREA_ID )
	);

	return container ? (
		<Portal container={ container }>
			<Component />
		</Portal>
	) : null;
}
