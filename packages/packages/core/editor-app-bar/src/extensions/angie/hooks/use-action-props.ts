import { useEffect } from 'react';
import { isAngieAvailable } from '@elementor/editor-mcp';
import { trackEvent } from '@elementor/events';
import { AngieIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';
const AI_WIDGET_CTA_VIEWED_EVENT = 'ai_widget_cta_viewed' as const;

const CREATE_WIDGET_PROMPT = `Create a widget for me.
Goal: [What should this widget help me accomplish?]
Placement: [Where will I see it in the editor/UI?]
How it should work: `;

export default function useActionProps() {
	const hasAngieInstalled = isAngieAvailable();
	const visible = ! hasAngieInstalled;

	useEffect( () => {
		if ( ! visible ) {
			return;
		}

		trackEvent( {
			eventName: AI_WIDGET_CTA_VIEWED_EVENT,
			entry_point: 'top_bar_icon',
			has_angie_installed: false,
		} );
	}, [ visible ] );

	return {
		title: __( 'Angie', 'elementor' ),
		icon: AngieIcon,
		onClick: () => {
			window.dispatchEvent(
				new CustomEvent( CREATE_WIDGET_EVENT, {
					detail: {
						prompt: CREATE_WIDGET_PROMPT,
						entry_point: 'top_bar_icon',
					},
				} )
			);
		},
		selected: false,
		visible,
	};
}
