import { getMixpanel } from '@elementor/events';

import { type AllowedHtmlTag } from '../allowed-tags';

type EventMap = {
	panelOpened: object;
	tagSaved: { tag: AllowedHtmlTag; action: 'set' | 'unset'; sections_modified: string[] };
	saveFailed: { tags_changed_count: number };
	changesDiscarded: { tags_discarded: AllowedHtmlTag[]; tags_discarded_count: number };
};

export type DefaultStylesTrackingEvent = {
	[ K in keyof EventMap ]: { event: K } & EventMap[ K ];
}[ keyof EventMap ];

const EVENT_PROPERTIES: Record< keyof EventMap, Record< string, string > > = {
	panelOpened: {
		target_type: 'tab',
		target_name: 'defaults_tab',
		target_location: 'design_system_panel',
		interaction_result: 'panel_opened',
	},
	tagSaved: {
		target_type: 'button',
		target_name: 'save_changes',
		target_location: 'design_system_panel',
		interaction_result: 'tag_saved',
		executed_by: 'user',
	},
	saveFailed: {
		target_type: 'button',
		target_name: 'save_changes',
		target_location: 'design_system_panel',
		interaction_result: 'save_failed',
		executed_by: 'user',
	},
	changesDiscarded: {
		target_type: 'button',
		target_name: 'discard_changes',
		target_location: 'dialog',
		interaction_result: 'changes_discarded',
	},
};

export const trackDefaultStyles = ( payload: DefaultStylesTrackingEvent ) => {
	const { dispatchEvent, config } = getMixpanel();
	const name = config?.names?.default_styles?.[ payload.event ];

	if ( ! name ) {
		return;
	}

	const { event, ...eventData } = payload;

	try {
		dispatchEvent?.( name, {
			window_name: config?.appTypes?.editor,
			app_type: config?.appTypes?.editor,
			interaction_type: 'click',
			...EVENT_PROPERTIES[ event ],
			...eventData,
		} );
	} catch {
		// Silently ignore tracking errors so they don't break the user flow.
	}
};
