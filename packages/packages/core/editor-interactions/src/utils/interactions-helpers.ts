import { type TransformablePropValue } from '@elementor/editor-props';
import { type InteractionItem } from '@elementor/editor-elements';

export const DEFAULT_INTERACTION_DETAILS = {
	trigger: 'load',
	effect: 'fade',
	type: 'in',
	direction: '',
	duration: 300,
	delay: 0,
};

export type InteractionDetailsForUI = {
	trigger: string;
	effect: string;
	type: string;
	direction: string;
	duration: string;  // String for UI controls
	delay: string;     // String for UI controls
};

// Helper to extract value from TransformablePropValue
export const getPropValue = <T>( prop: TransformablePropValue<string, T> | undefined, defaultValue: T ): T => {
	if ( ! prop || typeof prop !== 'object' || ! ( 'value' in prop ) ) {
		return defaultValue;
	}
	return prop.value !== undefined ? prop.value : defaultValue;
};

// Helper to create TransformablePropValue
export const createPropValue = <TType extends string, TValue>( 
	type: TType, 
	value: TValue 
): TransformablePropValue<TType, TValue> => ( {
	$$type: type,
	value,
} );

// Generate unique ID for new interactions
export const generateInteractionId = (): string => {
	return Math.random().toString( 36 ).substring( 2, 10 );
};

// Parse InteractionItem to flat structure for controls
export const parseInteractionItem = ( item: InteractionItem | undefined ) => {
	if ( ! item ) {
		return {
            trigger: DEFAULT_INTERACTION_DETAILS.trigger,
			effect: DEFAULT_INTERACTION_DETAILS.effect,
			type: DEFAULT_INTERACTION_DETAILS.type,
			direction: DEFAULT_INTERACTION_DETAILS.direction,
			duration: String( DEFAULT_INTERACTION_DETAILS.duration ),  // ← Convert to string
			delay: String( DEFAULT_INTERACTION_DETAILS.delay ),  
        };
	}

	const trigger = getPropValue( item.trigger, DEFAULT_INTERACTION_DETAILS.trigger );
	const animation = getPropValue( item.animation, {} as any );
	
	const effect = getPropValue( animation.effect, DEFAULT_INTERACTION_DETAILS.effect );
	const type = getPropValue( animation.type, DEFAULT_INTERACTION_DETAILS.type );
	const direction = getPropValue( animation.direction, DEFAULT_INTERACTION_DETAILS.direction );
	
	const timingConfig = getPropValue( animation.timing_config, {} as any );
	const duration = getPropValue( timingConfig.duration, DEFAULT_INTERACTION_DETAILS.duration );
	const delay = getPropValue( timingConfig.delay, DEFAULT_INTERACTION_DETAILS.delay );

	return {
		trigger,
		effect,
		type,
		direction: direction || '',
		duration: String( duration ),
		delay: String( delay ),
	};
};

// Build InteractionItem from flat structure
export const buildInteractionItem = (
	details: InteractionDetailsForUI,
	existingItem?: InteractionItem
): InteractionItem => {
	const interactionId = existingItem?.interaction_id?.value || generateInteractionId();

	return {
		interaction_id: createPropValue( 'string' as const, interactionId ),
		trigger: createPropValue( 'string' as const, details.trigger ),
		animation: createPropValue( 'animation-preset-props' as const, {
			effect: createPropValue( 'string' as const, details.effect ),
			type: createPropValue( 'string' as const, details.type ),
			direction: createPropValue( 'string' as const, details.direction ),
			timing_config: createPropValue( 'timing-config' as const, {
				duration: createPropValue( 'number' as const, parseInt( details.duration, 10 ) ),
				delay: createPropValue( 'number' as const, parseInt( details.delay, 10 ) ),
			} ),
		} ),
	};
};

// Get display label from interaction item
export const getInteractionLabel = ( item: InteractionItem ): string => {
	const details = parseInteractionItem( item );
	return `${ details.trigger }-${ details.effect }-${ details.type }`;
};