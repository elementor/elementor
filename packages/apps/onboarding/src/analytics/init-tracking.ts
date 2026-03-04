import type { ConnectSuccessData } from './events';

export function initializeAndEnableTracking(): void {
	const eventsManager = window.elementorCommon?.eventsManager as Record< string, unknown > | undefined;

	if ( ! eventsManager || typeof eventsManager.dispatchEvent !== 'function' ) {
		return;
	}

	if ( eventsManager.trackingEnabled ) {
		return;
	}

	if ( typeof eventsManager.isMixpanelReady === 'function' && eventsManager.isMixpanelReady() ) {
		( eventsManager.enableTracking as () => void )();
		return;
	}

	if ( typeof eventsManager.initializeMixpanel === 'function' ) {
		( eventsManager.initializeMixpanel as ( cb: () => void ) => void )(
			() => {
				( eventsManager.enableTracking as () => void )();
			},
		);
	}
}

export function updateLibraryConnectConfig( data: ConnectSuccessData ): void {
	const config = window.elementorCommon?.config as Record< string, Record< string, unknown > > | undefined;

	if ( ! config?.library_connect ) {
		return;
	}

	const lc = config.library_connect;
	lc.is_connected = true;
	lc.current_access_level = data.kits_access_level ?? data.access_level ?? 0;
	lc.current_access_tier = data.access_tier;
	lc.plan_type = data.plan_type;
	lc.user_id = data.user_id ?? null;
}

export function canSendEvents(): boolean {
	const editorEvents = ( window.elementorCommon?.config as Record< string, Record< string, unknown > > | undefined )
		?.editor_events;
	return !! editorEvents?.can_send_events;
}

export function setCanSendEvents( value: boolean ): void {
	const editorEvents = ( window.elementorCommon?.config as Record< string, Record< string, unknown > > | undefined )
		?.editor_events;

	if ( editorEvents ) {
		editorEvents.can_send_events = value;
	}
}
