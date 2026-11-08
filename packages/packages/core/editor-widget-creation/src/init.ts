import { canCreateWidget, sendPromptToAngie } from '@elementor/editor-mcp';
import { trackEvent } from '@elementor/events';

const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';
const ANGIE_CTA_CLICKED_EVENT = 'ai_widget_cta_clicked' as const;

type CreateWidgetEventDetail = {
	prompt?: string;
	entry_point: string;
};

export function handleCreateWidgetEvent( event: Event ) {
	if ( ! canCreateWidget() ) {
		return;
	}

	const customEvent = event as CustomEvent< CreateWidgetEventDetail >;

	trackEvent( {
		eventName: ANGIE_CTA_CLICKED_EVENT,
		entry_point: customEvent.detail.entry_point,
		has_angie_installed: true,
	} );

	sendPromptToAngie( customEvent.detail?.prompt );
}

export function init() {
	window.addEventListener( CREATE_WIDGET_EVENT, handleCreateWidgetEvent );
}
