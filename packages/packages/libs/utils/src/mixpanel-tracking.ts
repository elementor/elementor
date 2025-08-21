import { type ExtendedWindow } from '@elementor/editor-elements';

export type MixpanelEvent = {
	location: string;
	secondaryLocation: string;
	trigger: string;
	transition_type: string;
	widget_type: string;
	eventName: string;
};

export const sendMixpanelEvent = ( event: MixpanelEvent ) => {
	const extendedWindow: ExtendedWindow = window;

	if ( extendedWindow.elementorCommon?.eventsManager ) {
		try {
			extendedWindow.elementorCommon.eventsManager.dispatchEvent( event.eventName, event );
		} catch {}
	}
};
