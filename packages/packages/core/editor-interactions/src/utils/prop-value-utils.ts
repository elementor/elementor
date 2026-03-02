import { type Unit } from '@elementor/editor-controls';
import { type PropValue, sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

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
	type SizeStringValue,
	type StringPropValue,
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

export const createTimingConfig = ( duration: SizeStringValue, delay: SizeStringValue ): TimingConfigPropValue => ( {
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
	start = 85,
	end = 15,
}: {
	replay: boolean;
	easing?: string;
	relativeTo?: string;
	start?: SizeStringValue;
	end?: SizeStringValue;
} ): ConfigPropValue => ( {
	$$type: 'config',
	value: {
		replay: createBoolean( replay ),
		easing: createString( easing ),
		relativeTo: createString( relativeTo ),
		start: createSize( start, '%' ),
		end: createSize( end, '%' ),
	},
} );

const createSize = ( value?: SizeStringValue, defaultUnit?: Unit, defaultValue?: SizeStringValue ) => {
	if ( ! value ) {
		return;
	}

	return sizePropTypeUtil.create( parseSizeValue( value, [ '%' ], defaultValue, defaultUnit ) );
};

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
	start,
	end,
	customEffects,
}: {
	effect: string;
	type: string;
	direction?: string;
	duration: SizeStringValue;
	delay: SizeStringValue;
	replay: boolean;
	easing?: string;
	relativeTo?: string;
	start?: SizeStringValue;
	end?: SizeStringValue;
	customEffects?: PropValue;
} ): AnimationPresetPropValue => ( {
	$$type: 'animation-preset-props',
	value: {
		effect: createString( effect ),
		custom_effect: customEffects,
		type: createString( type ),
		direction: createString( direction ?? '' ),
		timing_config: createTimingConfig( duration, delay ),
		config: createConfig( {
			replay,
			easing,
			relativeTo,
			start,
			end,
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
	start,
	end,
	excludedBreakpoints,
	customEffects,
}: {
	trigger?: string;
	effect?: string;
	type?: string;
	direction?: string;
	duration?: SizeStringValue;
	delay?: SizeStringValue;
	interactionId?: string;
	replay?: boolean;
	easing?: string;
	relativeTo?: string;
	start?: number;
	end?: number;
	excludedBreakpoints?: string[];
	customEffects?: PropValue;
} ): InteractionItemPropValue => ( {
	$$type: 'interaction-item',
	value: {
		...( interactionId && { interaction_id: createString( interactionId ) } ),
		trigger: createString( trigger ?? '' ),
		animation: createAnimationPreset( {
			effect: effect ?? '',
			type: type ?? '',
			direction,
			duration: duration ?? 0,
			delay: delay ?? 0,
			replay,
			easing,
			relativeTo,
			start,
			end,
			customEffects,
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

export const extractSize = ( prop?: SizePropValue, defaultValue?: SizeStringValue ): SizeStringValue => {
	if ( ! prop?.value ) {
		return defaultValue as SizeStringValue;
	}

	return formatSizeValue( prop.value );
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
