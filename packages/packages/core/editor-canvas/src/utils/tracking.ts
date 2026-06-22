import { trackEvent } from "@elementor/events";

type ElementEventData = {
	eventName: 'add_element';
	element_name: string;
	element_type: string;
	widget_type: string;
	location?: string;
	executed_by: 'user' | 'mcp_tool' | 'system';
};

export const trackCanvasEvent = ( data: ElementEventData ) => {
	trackEvent( data );
};
