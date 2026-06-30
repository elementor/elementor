import { getElementLabel } from '@elementor/editor-elements';
import { getMixpanel } from '@elementor/events';

import type { InteractionItemPropValue } from '../types';
import { extractString } from './prop-value-utils';

const TRIGGER_LABELS: Record< string, string > = {
	load: 'On page load',
	scrollIn: 'Scroll into view',
	scrollOut: 'Scroll out of view',
	scrollOn: 'While scrolling',
	hover: 'Hover',
	click: 'Click',
};

const capitalize = ( s: string ) => s.charAt( 0 ).toUpperCase() + s.slice( 1 );

export const trackInteractionCreated = ( elementId: string, item: InteractionItemPropValue ) => {
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.interactions?.created ) {
		return;
	}

	const trigger = extractString( item.value.trigger );
	const effect = extractString( item.value.animation.value.effect );
	const type = extractString( item.value.animation.value.type );

	dispatchEvent?.( config.names.interactions.created, {
		app_type: config?.appTypes?.editor,
		window_name: config?.appTypes?.editor,
		interaction_type: config?.triggers?.click,
		target_name: getElementLabel( elementId ),
		interaction_result: 'interaction_created',
		target_location: config?.locations?.widgetPanel,
		location_l1: getElementLabel( elementId ),
		location_l2: 'interactions',
		interaction_description: 'interaction_created',
		interaction_trigger: TRIGGER_LABELS[ trigger ] ?? capitalize( trigger ),
		interaction_effect:
			effect === 'custom' ? capitalize( effect ) : `${ capitalize( effect ) } ${ capitalize( type ) }`,
	} );
};
