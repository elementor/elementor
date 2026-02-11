import { type Unit } from '@elementor/editor-controls';
import {
	type CustomEffectProperties,
	type CustomEffectPropertiesPropValue,
	type MovementDimensions,
	type MovementDimensionsPropValue,
} from '@elementor/editor-elements';
import {
	type BooleanPropValue,
	type NumberPropValue,
	sizePropTypeUtil,
	type SizePropValue,
	type StringPropValue,
} from '@elementor/editor-props';

import { DEFAULT_TIME_UNIT, TIME_UNITS } from '../configs/time-constants';
import {
	type AnimationPresetPropValue,
	type ConfigPropValue,
	type CustomEffect,
	type CustomEffectPropValue,
	type ElementInteractions,
	type ExcludedBreakpointsPropValue,
	type InteractionBreakpointsPropValue,
	type InteractionItemPropValue,
	type InteractionItemValue,
	type SizeStringValue,
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
	offsetTop = 0,
	offsetBottom = 85,
}: {
	replay: boolean;
	easing?: string;
	relativeTo?: string;
	offsetTop?: SizeStringValue;
	offsetBottom?: SizeStringValue;
} ): ConfigPropValue => ( {
	$$type: 'config',
	value: {
		replay: createBoolean( replay ),
		easing: createString( easing ),
		relativeTo: createString( relativeTo ),
		offsetTop: createSize( offsetTop, '%' ),
		offsetBottom: createSize( offsetBottom, '%' ),
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
	return breakpoints?.value.excluded.value.map( ( bp: StringPropValue ) => bp.value ?? '' ) ?? [];
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
	custom,
}: {
	effect: string;
	type: string;
	direction?: string;
	duration: SizeStringValue;
	delay: SizeStringValue;
	replay: boolean;
	easing?: string;
	relativeTo?: string;
	offsetTop?: SizeStringValue;
	offsetBottom?: SizeStringValue;
	custom?: CustomEffect;
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
		custom: createCustomEffect( custom ),
	},
} );

const EMPTY_CUSTOM_EFFECT_PROP_VALUE: CustomEffectPropValue = {
	$$type: 'custom-effect',
	value: {},
};

export const createCustomEffect = ( custom?: CustomEffect ): CustomEffectPropValue => {
	if ( ! custom ) {
		return EMPTY_CUSTOM_EFFECT_PROP_VALUE;
	}

	return {
		$$type: 'custom-effect',
		value: {
			from: createCustomEffectProperties( custom.from ),
			to: createCustomEffectProperties( custom.to ),
		},
	};
};

export const createCustomEffectProperties = (
	custom?: CustomEffectProperties
): CustomEffectPropertiesPropValue | undefined => {
	if ( ! custom ) {
		return undefined;
	}

	return {
		$$type: 'custom-effect-properties',
		value: {
			opacity: custom.opacity ? createNumber( custom.opacity ) : undefined,
			scale: custom.scale ? createMovementDimensions( custom.scale ) : undefined,
			move: custom.move ? createMovementDimensions( custom.move ) : undefined,
			rotate: custom.rotate ? createMovementDimensions( custom.rotate ) : undefined,
			skew: custom.skew ? createMovementDimensions( custom.skew ) : undefined,
		},
	};
};

export const createMovementDimensions = ( custom?: MovementDimensions ): MovementDimensionsPropValue | undefined => {
	if ( ! custom ) {
		return undefined;
	}

	return {
		$$type: 'movement-dimensions',
		value: {
			x: createNumber( custom.x ),
			y: createNumber( custom.y ),
			z: createNumber( custom.z ),
		},
	};
};

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
	custom,
}: {
	trigger: string;
	effect: string;
	type: string;
	direction?: string;
	duration: SizeStringValue;
	delay: SizeStringValue;
	interactionId?: string;
	replay: boolean;
	easing?: string;
	relativeTo?: string;
	offsetTop?: number;
	offsetBottom?: number;
	excludedBreakpoints?: string[];
	custom?: CustomEffect;
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
			custom,
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

export const extractNumber = ( prop: NumberPropValue | undefined, fallback = 0 ): number => {
	return prop?.value ?? fallback;
};

export const extractMovementDimensions = (
	prop: MovementDimensionsPropValue | undefined,
	fallback?: MovementDimensions
): MovementDimensions | undefined => {
	if ( ! prop?.value ) {
		return fallback;
	}

	return {
		x: extractNumber( prop.value.x ),
		y: extractNumber( prop.value.y ),
		z: extractNumber( prop.value.z ),
	};
};

export const extractCustomEffect = (
	prop: CustomEffectPropValue | undefined,
	fallback?: CustomEffect
): CustomEffect | undefined => {
	if ( ! prop?.value ) {
		return fallback;
	}

	const from = prop.value.from
		? {
				opacity: extractNumber( prop.value.from.value.opacity ),
				scale: extractMovementDimensions( prop.value.from.value.scale ),
				move: extractMovementDimensions( prop.value.from.value.move ),
				rotate: extractMovementDimensions( prop.value.from.value.rotate ),
				skew: extractMovementDimensions( prop.value.from.value.skew ),
		  }
		: undefined;
	const to = prop.value.to
		? {
				opacity: extractNumber( prop.value.to.value.opacity ),
				scale: extractMovementDimensions( prop.value.to.value.scale ),
				move: extractMovementDimensions( prop.value.to.value.move ),
				rotate: extractMovementDimensions( prop.value.to.value.rotate ),
				skew: extractMovementDimensions( prop.value.to.value.skew ),
		  }
		: undefined;

	return {
		from,
		to,
	};
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
