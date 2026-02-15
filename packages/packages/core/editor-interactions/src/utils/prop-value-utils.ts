import { type Unit } from '@elementor/editor-controls';
import {
	type AnimationKeyframe,
	type AnimationKeyframeStopPropValue,
	type KeyframeStopSettings,
	type KeyframeStopSettingsPropValue,
	type Transform3d,
	type Transform3dPropValue,
	type Transform2d,
	type Transform2dPropValue,
} from '@elementor/editor-elements';
import {
	type BooleanPropValue,
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

const createSizeValue = ( size: number, unit: Unit ): SizePropValue =>
	sizePropTypeUtil.create( { size, unit } as SizePropValue[ 'value' ] );

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
		...( custom && { custom: createCustomEffect( custom ) } ),
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

export const createTransform3d = ( t: Transform3d, unit: Unit ): Transform3dPropValue => ( {
	$$type: 'transform-3d',
	value: {
		x: createSizeValue( t.x, unit ),
		y: createSizeValue( t.y, unit ),
		z: createSizeValue( t.z, unit ),
	},
} );

export const createTransform2d = ( t: Transform2d, unit: Unit ): Transform2dPropValue => ( {
	$$type: 'transform-2d',
	value: {
		x: createSizeValue( t.x, unit ),
		y: createSizeValue( t.y, unit ),
	},
} );

export const createKeyframeStopSettings = ( settings: KeyframeStopSettings ): KeyframeStopSettingsPropValue => ( {
	$$type: 'keyframe-stop-settings',
	value: {
		opacity: settings.opacity !== undefined ? createSizeValue( settings.opacity, '%' ) : undefined,
		scale: settings.scale ? createTransform3d( settings.scale, '%' ) : undefined,
		move: settings.move ? createTransform3d( settings.move, 'px' ) : undefined,
		rotate: settings.rotate ? createTransform3d( settings.rotate, 'deg' ) : undefined,
		skew: settings.skew ? createTransform2d( settings.skew, 'deg' ) : undefined,
	},
} );

export const createAnimationKeyframeStop = ( kf: AnimationKeyframe ): AnimationKeyframeStopPropValue => ( {
	$$type: 'animation-keyframe-stop',
	value: {
		stop: createSizeValue( kf.stop, '%' ),
		settings: createKeyframeStopSettings( kf.settings ),
	},
} );

export const createCustomEffect = ( custom: CustomEffect ): CustomEffectPropValue => ( {
	$$type: 'custom-effect',
	value: {
		keyframes: {
			$$type: 'animation-keyframes',
			value: custom.keyframes.map( createAnimationKeyframeStop ),
		},
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

const extractSizeNumber = ( prop?: SizePropValue, fallback = 0 ): number => {
	if ( ! prop?.value || typeof prop.value.size !== 'number' ) {
		return fallback;
	}
	return prop.value.size;
};

export const extractTransform3d = (
	prop: Transform3dPropValue | undefined,
	fallback?: Transform3d
): Transform3d | undefined => {
	if ( ! prop?.value ) {
		return fallback;
	}

	return {
		x: extractSizeNumber( prop.value.x ),
		y: extractSizeNumber( prop.value.y ),
		z: extractSizeNumber( prop.value.z ),
	};
};

export const extractTransform2d = (
	prop: Transform2dPropValue | undefined,
	fallback?: Transform2d
): Transform2d | undefined => {
	if ( ! prop?.value ) {
		return fallback;
	}

	return {
		x: extractSizeNumber( prop.value.x ),
		y: extractSizeNumber( prop.value.y ),
	};
};

export const extractKeyframeStopSettings = (
	prop: KeyframeStopSettingsPropValue | undefined
): KeyframeStopSettings => {
	if ( ! prop?.value ) {
		return {};
	}

	return {
		opacity: prop.value.opacity ? extractSizeNumber( prop.value.opacity ) : undefined,
		scale: extractTransform3d( prop.value.scale ),
		move: extractTransform3d( prop.value.move ),
		rotate: extractTransform3d( prop.value.rotate ),
		skew: extractTransform2d( prop.value.skew ),
	};
};

export const extractAnimationKeyframe = ( prop: AnimationKeyframeStopPropValue ): AnimationKeyframe => ( {
	stop: extractSizeNumber( prop.value.stop ),
	settings: extractKeyframeStopSettings( prop.value.settings ),
} );

export const extractCustomEffect = (
	prop: CustomEffectPropValue | undefined,
	fallback?: CustomEffect
): CustomEffect | undefined => {
	if ( ! prop?.value?.keyframes ) {
		return fallback;
	}

	return {
		keyframes: prop.value.keyframes.value.map( extractAnimationKeyframe ),
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
