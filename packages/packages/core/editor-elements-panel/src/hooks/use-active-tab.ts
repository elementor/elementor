import {
	__privateUseListenTo as useListenTo,
	routeCloseEvent,
	routeOpenEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';

import { LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX } from '../consts';
import { getTab } from '../tabs';
import { getWindow } from '../utils/get-window';

export function useActiveTab() {
	return useListenTo(
		[
			v1ReadyEvent(),
			routeOpenEvent( LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX ),
			routeCloseEvent( LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX ),
		],
		() => {
			const panelRoute = getWindow().$e.routes.getCurrent()?.panel;

			if ( ! panelRoute || ! panelRoute.startsWith( LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX ) ) {
				return null;
			}

			const tab = panelRoute.replace( LEGACY_ELEMENTS_PANEL_ROUTE_PREFIX, '' );

			return getTab( tab ) ?? null;
		}
	);
}
