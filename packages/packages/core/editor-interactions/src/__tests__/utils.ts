import type { InteractionItemValue } from '../types';
import { createAnimationPreset, createInteractionBreakpoints, createString } from '../utils/prop-value-utils';

type Props = {
	interactionId?: string;
	trigger?: string;
	effect?: string;
	type?: string;
	direction?: string;
	duration?: number;
	delay?: number;
	replay?: boolean;
	easing?: string;
	relativeTo?: string;
	start?: number;
	end?: number;
	excludedBreakpoints?: string[];
};

export const createInteractionItemValue = ( overrides: Props = {} ): InteractionItemValue => {
	const {
		interactionId = 'test-id',
		trigger = 'load',
		effect = 'fade',
		type = 'in',
		direction = '',
		duration = 600,
		delay = 0,
		replay = false,
		easing = 'easeIn',
	} = overrides;

	const baseValue: InteractionItemValue = {
		interaction_id: createString( interactionId ),
		trigger: createString( trigger ),
		animation: createAnimationPreset( {
			effect,
			type,
			direction,
			duration,
			delay,
			replay,
			easing,
		} ),
	};

	const { excludedBreakpoints } = overrides;

	if ( excludedBreakpoints && excludedBreakpoints.length > 0 ) {
		baseValue.breakpoints = createInteractionBreakpoints( excludedBreakpoints );
	}

	return baseValue;
};
