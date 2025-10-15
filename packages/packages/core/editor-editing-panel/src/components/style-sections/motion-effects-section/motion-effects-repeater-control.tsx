import * as React from 'react';
import { RepeatableControl } from '@elementor/editor-controls';
import { motionEffectPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { MotionEffectControl } from './motion-effect-control';

const MOTION_EFFECTS_LABEL = __( 'Motion Effects', 'elementor' );
const MOTION_EFFECT_LABEL = __( 'Motion Effect', 'elementor' );

const initialMotionEffectValue = {
	trigger: 'scroll-into-view',
	animation: 'fade',
	type: 'in',
	direction: 'left',
};

export const MotionEffectsRepeaterControl = () => {
	return (
		<RepeatableControl
			label={ MOTION_EFFECTS_LABEL }
			repeaterLabel={ MOTION_EFFECTS_LABEL }
			childControlConfig={ {
				component: MotionEffectControl,
				propTypeUtil: motionEffectPropTypeUtil,
				label: MOTION_EFFECT_LABEL,
			} }
			initialValues={ initialMotionEffectValue }
			showDuplicate={ true }
			showToggle={ true }
		/>
	);
};
