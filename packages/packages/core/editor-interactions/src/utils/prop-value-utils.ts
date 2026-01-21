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
import { generateTempInteractionId } from './temp-id-utils';

export const createString = ( value: string ): StringPropValue => ( {
	$$type: 'string',
	value,
} );

export const createNumber = ( value: number ): NumberPropValue => ( {
	$$type: 'number',
	value,
} );

export const createTimingConfig = ( duration: number, delay: number ): TimingConfigPropValue => ( {
	$$type: 'timing-config',
	value: {
		duration: createNumber( duration ),
		delay: createNumber( delay ),
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
	duration: number;
	delay: number;
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
			duration,
			delay,
			replay,
			relativeTo,
			offsetTop,
			offsetBottom,
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
