import {
	__privateUseListenTo as useListenTo,
	routeCloseEvent,
	routeOpenEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';

import { SITE_SETTINGS_ROUTE_PREFIX } from '../consts';
import { getSiteSettingsTab } from '../tabs';

export function useActiveSiteSettingsTab() {
	return useListenTo(
		[ v1ReadyEvent(), routeOpenEvent( SITE_SETTINGS_ROUTE_PREFIX ), routeCloseEvent( SITE_SETTINGS_ROUTE_PREFIX ) ],
		() => {
			const panelRoute = window.$e?.routes?.getCurrent?.()?.panel;

			if ( ! panelRoute || ! panelRoute.startsWith( SITE_SETTINGS_ROUTE_PREFIX ) ) {
				return null;
			}

			const tabId = panelRoute.replace( SITE_SETTINGS_ROUTE_PREFIX, '' );

			return getSiteSettingsTab( tabId ) ?? null;
		}
	);
}
