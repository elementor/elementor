import type {
	AnimationPresetPropValue,
	InteractionItemPropValue,
	InteractionItemValue,
	ElementInteractions,
	NumberPropValue,
	StringPropValue,
	TimingConfigPropValue,
} from '../types';

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

export const createAnimationPreset = (
	effect: string,
	type: string,
	direction: string,
	duration: number,
	delay: number
): AnimationPresetPropValue => ( {
	$$type: 'animation-preset-props',
	value: {
		effect: createString( effect ),
		type: createString( type ),
		direction: createString( direction ),
		timing_config: createTimingConfig( duration, delay ),
	},
} );

export const createInteractionItem = (
	trigger: string,
	effect: string,
	type: string,
	direction: string,
	duration: number,
	delay: number,
    interactionId?: string
): InteractionItemPropValue => ( {
	$$type: 'interaction-item',
	value: {
		...( interactionId && { interaction_id: createString( interactionId ) } ),
		trigger: createString( trigger ),
		animation: createAnimationPreset( effect, type, direction, duration, delay ),
	},
} );

export const createDefaultInteractionItem = (): InteractionItemPropValue => {
	return createInteractionItem(
		'load',
		'fade',
		'in',
		'',
		300,
		0
	);
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
    console.log('item', item);
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