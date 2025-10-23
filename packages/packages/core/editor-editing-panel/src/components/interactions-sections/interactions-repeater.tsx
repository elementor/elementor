import * as React from 'react';
import { RepeatableControl } from '@elementor/editor-controls';
import { interactionPropTypeUtil } from '../../../../../libs/editor-props/src/prop-types/interaction';
import { __ } from '@wordpress/i18n';
import { TextControl } from '@elementor/editor-controls';


const MOTION_EFFECTS_LABEL = 'Motion Effects';
const MOTION_EFFECT_LABEL = 'Motion Effects';

const initialMotionEffectValue = {
	trigger: 'scroll-into-view',
	animation: 'fade',
	type: 'in',
	direction: 'left',
};



export const InteractionsRepeaterControl = () => {
	return (
		<RepeatableControl
			label={ MOTION_EFFECTS_LABEL }
			repeaterLabel={ MOTION_EFFECTS_LABEL }
            propKey="interactions"
			childControlConfig={ {
				component: InteractionControl,
				propTypeUtil: interactionPropTypeUtil,
				label: MOTION_EFFECT_LABEL,
			} }
			initialValues={ initialMotionEffectValue }
			showDuplicate={ true }
			showToggle={ true }
		/>
        // <div>hele</div>
	);
};

const InteractionControl = () => {
	return (
		<div>test interaction </div> 
	);
};