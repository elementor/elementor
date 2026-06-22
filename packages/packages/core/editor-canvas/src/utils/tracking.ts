type ElementEventData = {
	action: 'add_element';
	element_name: string;
	element_type: string;
	widget_type: string;
	location?: string;
	executedBy: 'user' | 'mcp_tool' | 'system';
};

export const trackCanvasEvent = ( data: ElementEventData ) => {
	if ( typeof window === 'undefined' || ! window.elementorCommon?.eventsManager?.dispatchEvent ) {
		return;
	}

	window.elementorCommon.eventsManager.dispatchEvent( data.action, {
		...data,
	} );
};
