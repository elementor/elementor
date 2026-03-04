import { canSendEvents, initializeAndEnableTracking, setCanSendEvents } from '@elementor/events';

import type { ConnectSuccessData } from './events';

export function updateLibraryConnectConfig( data: ConnectSuccessData ): void {
	const config = window.elementorCommon?.config;

	if ( ! config?.library_connect ) {
		return;
	}

	const libraryConnectConfig = config.library_connect;
	libraryConnectConfig.is_connected = true;
	libraryConnectConfig.current_access_level = data.kits_access_level ?? data.access_level ?? 0;
	libraryConnectConfig.current_access_tier = data.access_tier;
	libraryConnectConfig.plan_type = data.plan_type;
	libraryConnectConfig.user_id = data.user_id ? String( data.user_id ) : null;
}

export { canSendEvents, initializeAndEnableTracking, setCanSendEvents };
