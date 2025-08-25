import { getSelectedElements } from '@elementor/editor-elements';
import { type MixpanelEvent, sendMixpanelEvent } from '@elementor/utils';

import { repeaterEventBus, type RepeaterEventType } from '../../services/repeater-event-bus';

const transitionRepeaterMixpanelEvent = {
	eventName: 'click_added_transition',
	location: 'V4 Style Tab',
	secondaryLocation: 'Transition control',
	trigger: 'click',
};

export function subscribeToTransitionEvent() {
	repeaterEventBus.subscribe( 'transition-item-added', ( data ) => {
		const value = ( data?.itemValue ).selection.value.value.value;
		const selectedElements = getSelectedElements();
		const widgetType = selectedElements[ 0 ].type ?? null;
		sendMixpanelEvent( {
			value ,
			...transitionRepeaterMixpanelEvent,
			widget_type: widgetType,
		} );
	} );
}

export function unsubscribeFromTransitionItemAdded() {
	repeaterEventBus.unsubscribe( 'transition-item-added' );
}
