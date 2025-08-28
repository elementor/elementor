import { getSelectedElements } from '@elementor/editor-elements';
import { sendMixpanelEvent } from '@elementor/utils';

import { eventBus } from '../../services/event-bus';
import { type initialTransitionValue } from './data';

type TransitionItemValue = typeof initialTransitionValue;

const transitionRepeaterMixpanelEvent = {
	eventName: 'click_added_transition',
	location: 'V4 Style Tab',
	secondaryLocation: 'Transition control',
	trigger: 'click',
};

export function subscribeToTransitionEvent() {
	eventBus.subscribe( 'transition-item-added', ( data ) => {
		const payload = data as { itemValue?: TransitionItemValue };
		const value = payload?.itemValue?.selection?.value?.value?.value;
		const selectedElements = getSelectedElements();
		const widgetType = selectedElements[ 0 ]?.type ?? null;
		sendMixpanelEvent( {
			transition_type: value ?? 'unknown',
			...transitionRepeaterMixpanelEvent,
			widget_type: widgetType,
		} );
	} );
}
