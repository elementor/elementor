import { getSelectedElements } from '@elementor/editor-elements';
import { sendMixpanelEvent } from '@elementor/utils';

import { repeaterEventBus } from '../../services/repeater-event-bus';

interface TransitionItemValue {
	selection?: {
		value?: {
			value?: {
				value?: string;
			};
		};
	};
}

const transitionRepeaterMixpanelEvent = {
	eventName: 'click_added_transition',
	location: 'V4 Style Tab',
	secondaryLocation: 'Transition control',
	trigger: 'click',
};

export function subscribeToTransitionEvent() {
	repeaterEventBus.subscribe( 'transition-item-added', ( data ) => {
		const value = ( data?.itemValue as TransitionItemValue )?.selection?.value?.value?.value;
		const selectedElements = getSelectedElements();
		const widgetType = selectedElements[ 0 ].type ?? null;
		sendMixpanelEvent( {
			transition_type: value ?? 'unknown',
			...transitionRepeaterMixpanelEvent,
			widget_type: widgetType,
		} );
	} );
}

export function unsubscribeFromTransitionItemAdded() {
	repeaterEventBus.unsubscribe( 'transition-item-added' );
}
