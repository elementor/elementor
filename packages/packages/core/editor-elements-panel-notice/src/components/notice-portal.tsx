import * as React from 'react';
import { Portal } from '@elementor/ui';
import { __privateUseListenTo as useListenTo, routeOpenEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { NoticeBanner } from './notice-banner';

const NOTICE_AREA_ID = 'elementor-panel-elements-notice-area';
const ELEMENTS_PANEL_ROUTE_PREFIX = 'panel/elements/';

export function NoticePortal() {
	const container = useListenTo(
		[ v1ReadyEvent(), routeOpenEvent( ELEMENTS_PANEL_ROUTE_PREFIX ) ],
		() => document.getElementById( NOTICE_AREA_ID )
	);

	// eslint-disable-next-line no-console
	console.log( '[notice] NoticePortal render — container:', container );

	return container ? (
		<Portal container={ container }>
			<NoticeBanner />
		</Portal>
	) : null;
}
