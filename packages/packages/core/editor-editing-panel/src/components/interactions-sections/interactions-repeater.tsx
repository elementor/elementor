import * as React from 'react';
import { RepeatableControl } from '@elementor/editor-controls';
import { interactionPropTypeUtil } from '../../../../../libs/editor-props/src/prop-types/interaction';
import { __ } from '@wordpress/i18n';
import { TextControl } from '@elementor/editor-controls';

const MOTION_EFFECTS_LABEL = 'Motion Effects';
const MOTION_EFFECT_LABEL = 'Motion Effect';

const INITIAL_MOTION_EFFECT_VALUE = {
	animation: 'fade-in-left',
};

export const InteractionsRepeaterControl = () => {
	return (
		<RepeatableControl
			label={ MOTION_EFFECTS_LABEL }
			repeaterLabel={ MOTION_EFFECT_LABEL }
            propKey="interactions"
			childControlConfig={ {
				component: InteractionControl,
				propTypeUtil: interactionPropTypeUtil,
				label: MOTION_EFFECT_LABEL,
			} }
			initialValues={ INITIAL_MOTION_EFFECT_VALUE }
			showDuplicate={ true }
			showToggle={ true }
		/>
	);
};

const InteractionControl = () => {
	return (
		<TextControl
			propKey="animation"
			label="Animation"
			placeholder="e.g. fade-in-left, slide-up, zoom-in"
		/>
	);
};