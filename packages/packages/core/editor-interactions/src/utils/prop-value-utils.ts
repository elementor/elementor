import type {
	AnimationPresetPropValue,
	BooleanPropValue,
	ConfigPropValue,
	ElementInteractions,
	InteractionItemPropValue,
	InteractionItemValue,
	NumberPropValue,
	StringPropValue,
	TimingConfigPropValue,
} from '../types';
import { INTERACTION_DEFAULT_CONFIG } from './interaction-default-config';
import { generateTempInteractionId } from './temp-id-utils';

export const createString = ( value: string ): StringPropValue => ( {
	$$type: 'string',
	value,
} );

export const createNumber = ( value: number ): NumberPropValue => ( {
	$$type: 'number',
	value,
} );

export const createTimingConfig = ( duration: NumberPropValue, delay: NumberPropValue ): TimingConfigPropValue => ( {
	$$type: 'timing-config',
	value: {
		duration,
		delay,
	},
} );

export const createBoolean = ( value: boolean ): BooleanPropValue => ( {
	$$type: 'boolean',
	value,
} );

export const createConfig = (
	replay: boolean,
	relativeTo?: string,
	offsetTop?: number,
	offsetBottom?: number
): ConfigPropValue => ( {
	$$type: 'config',
	value: {
		replay: createBoolean( replay ),
		relativeTo: createString( relativeTo ?? '' ),
		offsetTop: createNumber( offsetTop ?? 0 ),
		offsetBottom: createNumber( offsetBottom ?? 100 ),
	},
} );

export const extractBoolean = ( prop: BooleanPropValue | undefined, fallback = false ): boolean => {
	return prop?.value ?? fallback;
};

export const createAnimationPreset = ( {
	effect,
	type,
	direction,
	duration,
	delay,
	replay = false,
	relativeTo,
	offsetTop,
	offsetBottom,
}: {
	effect: string;
	type: string;
	direction?: string;
	duration: NumberPropValue;
	delay: NumberPropValue;
	replay: boolean;
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
		config: createConfig( replay, relativeTo, offsetTop, offsetBottom ),
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
	relativeTo,
	offsetTop,
	offsetBottom,
}: {
	trigger: string;
	effect: string;
	type: string;
	direction?: string;
	duration: number;
	delay: number;
	interactionId?: string;
	replay: boolean;
	relativeTo?: string;
	offsetTop?: number;
	offsetBottom?: number;
} ): InteractionItemPropValue => ( {
	$$type: 'interaction-item',
	value: {
		...( interactionId && { interaction_id: createString( interactionId ) } ),
		trigger: createString( trigger ),
		animation: createAnimationPreset( {
			effect,
			type,
			direction,
			duration: createNumber( duration ),
			delay: createNumber( delay ),
			replay,
			relativeTo,
			offsetTop,
			offsetBottom,
		} ),
	},
} );

export const createDefaultInteractionItem = (): InteractionItemPropValue => {
	return createInteractionItem( {
		...INTERACTION_DEFAULT_CONFIG,
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

export const extractNumber = ( prop: NumberPropValue | undefined, fallback = 0 ): number => {
	return prop?.value ?? fallback;
};

export const buildAnimationIdString = ( item: InteractionItemValue ): string => {
	const trigger = extractString( item.trigger );
	const effect = extractString( item.animation.value.effect );
	const type = extractString( item.animation.value.type );
	const direction = extractString( item.animation.value.direction );
	const duration = extractNumber( item.animation.value.timing_config.value.duration );
	const delay = extractNumber( item.animation.value.timing_config.value.delay );

	return [ trigger, effect, type, direction, duration, delay ].join( '-' );
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
