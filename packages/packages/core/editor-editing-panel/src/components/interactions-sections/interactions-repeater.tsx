import * as React from 'react';
import { RepeatableControl } from '@elementor/editor-controls';
import { interactionsPropTypeUtil } from '../../../../../libs/editor-props/src/prop-types/interactions';


const MOTION_EFFECTS_LABEL = __( 'Motion Effects', 'elementor' );
const MOTION_EFFECT_LABEL = __( 'Motion Effect', 'elementor' );

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
			childControlConfig={ {
				component: InteractionControl,
				propTypeUtil: interactionsPropTypeUtil,
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
		<div>
			<h1>Interaction Control</h1>
		</div>
	);
};