import {
	__privateUseListenTo as useListenTo,
	routeCloseEvent,
	routeOpenEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';

import { E_ROUTE_PREFIX } from '../consts';
import { getTab } from '../tabs';
import { getWindow } from '../utils/get-window';

export function useTab() {
	return useListenTo( [ v1ReadyEvent(), routeOpenEvent( E_ROUTE_PREFIX ), routeCloseEvent( E_ROUTE_PREFIX ) ], () => {
		const panelRoute = getWindow().$e.routes.getCurrent()?.panel;

		if ( ! panelRoute || ! panelRoute.startsWith( E_ROUTE_PREFIX ) ) {
			return null;
		}

		const tab = panelRoute.replace( E_ROUTE_PREFIX, '' );

		return getTab( tab ) ?? null;
	} );
}
