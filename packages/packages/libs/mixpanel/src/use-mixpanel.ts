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
