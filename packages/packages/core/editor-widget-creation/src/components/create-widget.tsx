import * as React from 'react';
import { useEffect } from 'react';
import { canCreateWidget, sendPromptToAngie } from '@elementor/editor-mcp';
import { trackEvent } from '@elementor/events';

type ShowModalEventDetail = {
	prompt?: string;
	entry_point: string;
};

const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';
const ANGIE_CTA_CLICKED_EVENT = 'ai_widget_cta_clicked' as const;

export function CreateWidget() {
	useEffect( () => {
		const handleShow = ( event: Event ) => {
			if ( ! canCreateWidget() ) {
				return;
			}

			const customEvent = event as CustomEvent< ShowModalEventDetail >;

			trackEvent( {
				eventName: ANGIE_CTA_CLICKED_EVENT,
				entry_point: customEvent.detail.entry_point,
				has_angie_installed: true,
			} );

			sendPromptToAngie( customEvent.detail?.prompt );
		};

		window.addEventListener( CREATE_WIDGET_EVENT, handleShow );

		return () => {
			window.removeEventListener( CREATE_WIDGET_EVENT, handleShow );
		};
	}, [] );

	return null;
}
