export const getMixpanel = () => {
	const eventsManager = window.elementorCommon?.eventsManager || {};
	return {
		dispatchEvent: eventsManager.dispatchEvent?.bind( eventsManager ),
		config: eventsManager.config,
		canSendEvents: eventsManager.canSendEvents?.bind( eventsManager ),
		initializeMixpanel: eventsManager.initializeMixpanel?.bind( eventsManager ),
		enableTracking: eventsManager.enableTracking?.bind( eventsManager ),
		isMixpanelReady: eventsManager.isMixpanelReady?.bind( eventsManager ),
		trackingEnabled: eventsManager.trackingEnabled ?? false,
		getMixpanelInstance: eventsManager.getMixpanelInstance?.bind( eventsManager ),
	};
};

export const useMixpanel = () => {
	const { dispatchEvent, config } = getMixpanel();

	return {
		dispatchEvent,
		config,
	};
};

export const trackEvent = < T extends { eventName: string } & Record< string, unknown > >( event: T ) => {
	const { dispatchEvent } = getMixpanel();
	dispatchEvent?.( event.eventName, event );
};

export const canSendEvents = (): boolean => getMixpanel().canSendEvents?.() ?? false;

export const setCanSendEvents = ( value: boolean ): void => {
	const editorEvents = window.elementorCommon?.config?.editor_events;
	if ( editorEvents ) {
		editorEvents.can_send_events = value;
	}
};

export const isMixpanelReady = (): boolean => getMixpanel().isMixpanelReady?.() ?? false;

export const isTrackingEnabled = (): boolean => getMixpanel().trackingEnabled;

export const enableTracking = (): void => getMixpanel().enableTracking?.();

export const initializeMixpanel = ( onLoaded?: () => void ): void =>
	getMixpanel().initializeMixpanel?.( onLoaded ?? ( () => {} ) );

export function initializeAndEnableTracking(
	onReady?: ( mpInstance?: unknown ) => void
): void {
	const mixpanel = getMixpanel();

	if ( ! mixpanel.dispatchEvent ) {
		return;
	}

	if ( mixpanel.trackingEnabled ) {
		onReady?.( mixpanel.getMixpanelInstance?.() );
		return;
	}

	if ( mixpanel.isMixpanelReady?.() ) {
		mixpanel.enableTracking?.();
		onReady?.( mixpanel.getMixpanelInstance?.() );
		return;
	}

	mixpanel.initializeMixpanel?.( ( mpInstance: unknown ) => {
		mixpanel.enableTracking?.();
		onReady?.( mpInstance );
	} );
}
