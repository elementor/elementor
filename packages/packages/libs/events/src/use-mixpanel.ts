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

export const getMixpanel = () => {
	const eventsManager = window.elementorCommon?.eventsManager || {};
	return {
		dispatchEvent: eventsManager.dispatchEvent?.bind( eventsManager ),
		config: eventsManager.config,
	};
};

export const canSendEvents = (): boolean => {
	return !! window.elementorCommon?.config?.editor_events?.can_send_events;
};

export const isEventsManagerAvailable = (): boolean => {
	const eventsManager = window.elementorCommon?.eventsManager;
	return !! eventsManager && 'function' === typeof eventsManager.dispatchEvent;
};

export const safeDispatch = ( eventName: string, payload: Record< string, unknown > = {} ): boolean => {
	if ( ! isEventsManagerAvailable() || ! canSendEvents() ) {
		return false;
	}

	try {
		window.elementorCommon?.eventsManager?.dispatchEvent?.( eventName, payload );
		return true;
	} catch {
		return false;
	}
};
