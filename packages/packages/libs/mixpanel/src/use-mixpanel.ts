export const useMixpanel = () => {
	const { dispatchEvent, config } = window.elementorCommon?.eventsManager || {};

	return {
		trackEvent: dispatchEvent,
		mixpanelConfig: config,
	};
};

export const trackEvent = <T extends { eventName: string } & Record< string, unknown >>( event: T ) => {
	const { trackEvent } = useMixpanel();
	trackEvent?.( event.eventName, event );
};
