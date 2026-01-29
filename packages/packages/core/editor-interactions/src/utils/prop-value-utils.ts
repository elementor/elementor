import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

import { DEFAULT_TIME_UNIT, TIME_UNITS } from '../configs/time-constants';
import {
	type AnimationPresetPropValue,
	type BooleanPropValue,
	type ConfigPropValue,
	type ElementInteractions,
	type ExcludedBreakpointsPropValue,
	type InteractionBreakpointsPropValue,
	type InteractionItemPropValue,
	type InteractionItemValue,
	type NumberPropValue,
	type StringPropValue,
	type TimeValue,
	type TimingConfigPropValue,
} from '../types';
import { formatSizeValue, parseSizeValue } from '../utils/size-transform-utils';
import { generateTempInteractionId } from './temp-id-utils';

export const createString = ( value: string ): StringPropValue => ( {
	$$type: 'string',
	value,
} );

export const createNumber = ( value: number ): NumberPropValue => ( {
	$$type: 'number',
	value,
} );

export const createTimingConfig = ( duration: TimeValue, delay: TimeValue ): TimingConfigPropValue => ( {
	$$type: 'timing-config',
	value: {
		duration: sizePropTypeUtil.create( parseSizeValue( duration, TIME_UNITS, undefined, DEFAULT_TIME_UNIT ) ),
		delay: sizePropTypeUtil.create( parseSizeValue( delay, TIME_UNITS, undefined, DEFAULT_TIME_UNIT ) ),
	},
} );

export const createBoolean = ( value: boolean ): BooleanPropValue => ( {
	$$type: 'boolean',
	value,
} );

export const createConfig = ( {
	replay,
	easing = 'easeIn',
	relativeTo = '',
	offsetTop = 0,
	offsetBottom = 100,
}: {
	replay: boolean;
	easing?: string;
	relativeTo?: string;
	offsetTop?: number;
	offsetBottom?: number;
} ): ConfigPropValue => ( {
	$$type: 'config',
	value: {
		replay: createBoolean( replay ),
		easing: createString( easing ),
		relativeTo: createString( relativeTo ),
		offsetTop: createNumber( offsetTop ),
		offsetBottom: createNumber( offsetBottom ),
	},
} );

export const extractBoolean = ( prop: BooleanPropValue | undefined, fallback = false ): boolean => {
	return prop?.value ?? fallback;
};

export const createExcludedBreakpoints = ( breakpoints: string[] ): ExcludedBreakpointsPropValue => ( {
	$$type: 'excluded-breakpoints',
	value: breakpoints.map( createString ),
} );

export const createInteractionBreakpoints = ( excluded: string[] ): InteractionBreakpointsPropValue => ( {
	$$type: 'interaction-breakpoints',
	value: {
		excluded: createExcludedBreakpoints( excluded ),
	},
} );

export const extractExcludedBreakpoints = ( breakpoints: InteractionBreakpointsPropValue | undefined ): string[] => {
	return breakpoints?.value.excluded.value.map( ( bp: StringPropValue ) => bp.value ) ?? [];
};

export const createAnimationPreset = ( {
	effect,
	type,
	direction,
	duration,
	delay,
	replay = false,
	easing = 'easeIn',
	relativeTo,
	offsetTop,
	offsetBottom,
}: {
	effect: string;
	type: string;
	direction?: string;
	duration: TimeValue;
	delay: TimeValue;
	replay: boolean;
	easing?: string;
	relativeTo?: string;
	offsetTop?: number;
	offsetBottom?: number;
} ): AnimationPresetPropValue => ( {
	$$type: 'animation-preset-props',
	value: {
		effect: createString( effect ),
		type: createString( type ),
		direction: createString( direction ?? '' ),
		timing_config: createTimingConfig( duration, delay ),
		config: createConfig( {
			replay,
			easing,
			relativeTo,
			offsetTop,
			offsetBottom,
		} ),
	},
} );

export const createInteractionItem = ( {
	trigger,
	effect,
	type,
	direction,
	duration,
	delay,
	interactionId,
	replay = false,
	easing = 'easeIn',
	relativeTo,
	offsetTop,
	offsetBottom,
	excludedBreakpoints,
}: {
	trigger: string;
	effect: string;
	type: string;
	direction?: string;
	duration: TimeValue;
	delay: TimeValue;
	interactionId?: string;
	replay: boolean;
	easing?: string;
	relativeTo?: string;
	offsetTop?: number;
	offsetBottom?: number;
	excludedBreakpoints?: string[];
} ): InteractionItemPropValue => ( {
	$$type: 'interaction-item',
	value: {
		...( interactionId && { interaction_id: createString( interactionId ) } ),
		trigger: createString( trigger ),
		animation: createAnimationPreset( {
			effect,
			type,
			direction,
			duration,
			delay,
			replay,
			easing,
			relativeTo,
			offsetTop,
			offsetBottom,
		} ),
		...( excludedBreakpoints &&
			excludedBreakpoints.length > 0 && {
				breakpoints: createInteractionBreakpoints( excludedBreakpoints ),
			} ),
	},
} );

export const createDefaultInteractionItem = (): InteractionItemPropValue => {
	return createInteractionItem( {
		trigger: 'load',
		effect: 'fade',
		type: 'in',
		duration: 600,
		delay: 0,
		replay: false,
		easing: 'easeIn',
		interactionId: generateTempInteractionId(),
	} );
};

export const createDefaultInteractions = (): ElementInteractions => ( {
	version: 1,
	items: [ createDefaultInteractionItem() ],
} );

export const extractString = ( prop: StringPropValue | undefined, fallback = '' ): string => {
	return prop?.value ?? fallback;
};

export const extractSize = ( prop: SizePropValue ): TimeValue => {
	return formatSizeValue( prop?.value );
};

export const extractNumber = ( prop: NumberPropValue | undefined, fallback = 0 ): number => {
	return prop?.value ?? fallback;
};

const TRIGGER_LABELS: Record< string, string > = {
	load: 'On page load',
	scrollIn: 'Scroll into view',
	scrollOut: 'Scroll out of view',
	scrollOn: 'While scrolling',
};

const capitalize = ( str: string ): string => {
	return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
};

export const buildDisplayLabel = ( item: InteractionItemValue ): string => {
	const trigger = extractString( item.trigger );
	const effect = extractString( item.animation.value.effect );
	const type = extractString( item.animation.value.type );

	const triggerLabel = TRIGGER_LABELS[ trigger ] || capitalize( trigger );
	const effectLabel = capitalize( effect );
	const typeLabel = capitalize( type );

	return `${ triggerLabel }: ${ effectLabel } ${ typeLabel }`;
};
