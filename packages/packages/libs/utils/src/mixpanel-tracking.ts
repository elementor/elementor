type ExtendedWindow = Window & {
	elementorCommon?: {
		eventsManager?: {
			dispatchEvent: ( name: string, data: MixpanelEvent ) => void;
		};
	};
};

export type MixpanelEvent = {
	location: string;
	secondaryLocation: string;
	trigger: string;
	widget_type: string;
	eventName: string;
} & { [ key: string ]: unknown };

export const sendMixpanelEvent = ( event: MixpanelEvent ) => {
	const extendedWindow: ExtendedWindow = window;

	if ( extendedWindow.elementorCommon?.eventsManager ) {
		try {
			extendedWindow.elementorCommon.eventsManager.dispatchEvent( event.eventName, event );
		} catch {}
	}
};
