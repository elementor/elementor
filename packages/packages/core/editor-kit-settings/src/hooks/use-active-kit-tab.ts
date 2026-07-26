import {
	__privateUseListenTo as useListenTo,
	routeCloseEvent,
	routeOpenEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';

import { KIT_SETTINGS_ROUTE_PREFIX } from '../consts';
import { getKitTab } from '../tabs';
import { getWindow } from '../utils/get-window';

export function useActiveKitTab() {
	return useListenTo(
		[ v1ReadyEvent(), routeOpenEvent( KIT_SETTINGS_ROUTE_PREFIX ), routeCloseEvent( KIT_SETTINGS_ROUTE_PREFIX ) ],
		() => {
			const panelRoute = getWindow().$e.routes.getCurrent()?.panel;

			if ( ! panelRoute || ! panelRoute.startsWith( KIT_SETTINGS_ROUTE_PREFIX ) ) {
				return null;
			}

			const tabId = panelRoute.replace( KIT_SETTINGS_ROUTE_PREFIX, '' );

			return getKitTab( tabId ) ?? null;
		}
	);
}
