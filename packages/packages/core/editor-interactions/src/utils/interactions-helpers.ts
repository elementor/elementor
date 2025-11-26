import { type TransformablePropValue } from '@elementor/editor-props';
import { type InteractionItem, type InteractionItemValue } from '@elementor/editor-elements';

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
	return `temp-${ Math.random().toString( 36 ).substring( 2, 10 ) }`;
};

export const isTempInteractionId = ( id: string ): boolean => {
	return id.startsWith( 'temp-' );
};

// Parse InteractionItem to flat structure for controls
export const parseInteractionItem = ( item: InteractionItem | undefined ): InteractionDetailsForUI => {
	if ( ! item ) {
		return {
			trigger: DEFAULT_INTERACTION_DETAILS.trigger,
			effect: DEFAULT_INTERACTION_DETAILS.effect,
			type: DEFAULT_INTERACTION_DETAILS.type,
			direction: DEFAULT_INTERACTION_DETAILS.direction,
			duration: String( DEFAULT_INTERACTION_DETAILS.duration ),
			delay: String( DEFAULT_INTERACTION_DETAILS.delay ),
		};
	}

	// Unwrap the item value
	const itemValue = getPropValue( item, {} as InteractionItemValue );

	const trigger = getPropValue( itemValue.trigger, DEFAULT_INTERACTION_DETAILS.trigger );
	const animation = getPropValue( itemValue.animation, {} as any );
	
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
	const existingValue = existingItem ? getPropValue( existingItem, {} as InteractionItemValue ) : undefined;
	const existingId = existingValue?.interaction_id?.value || generateInteractionId();

	const interactionId = existingId && ! isTempInteractionId( existingId ) 
		? existingId 
		: generateInteractionId();

	const itemValue: InteractionItemValue = {
		interaction_id: createPropValue( 'string', interactionId ),
		trigger: createPropValue( 'string', details.trigger ),
		animation: createPropValue( 'animation-preset-props', {
			effect: createPropValue( 'string', details.effect ),
			type: createPropValue( 'string', details.type ),
			direction: createPropValue( 'string', details.direction ),
			timing_config: createPropValue( 'timing-config', {
				duration: createPropValue( 'number', parseInt( details.duration, 10 ) ),
				delay: createPropValue( 'number', parseInt( details.delay, 10 ) ),
			} ),
		} ),
	};

	return createPropValue( 'interaction-item', itemValue );
};

export const sanitizeInteractionItemForSave = ( item: InteractionItem ): InteractionItem => {
	const itemValue = getPropValue( item, {} as InteractionItemValue );
	const interactionId = itemValue.interaction_id?.value;
	
	// If ID is temporary, remove it so backend generates a real one
	if ( isTempInteractionId( interactionId ) ) {
		const sanitizedValue: InteractionItemValue = {
			...itemValue,
			interaction_id: createPropValue( 'string', '' ), // Empty string or omit entirely
		};
		return createPropValue( 'interaction-item', sanitizedValue );
	}
	
	// Return as-is if it's a real ID
	return item;
};

// Sanitize all interactions before saving
export const sanitizeInteractionsForSave = ( interactions: InteractionItem[] ): InteractionItem[] => {
	return interactions.map( sanitizeInteractionItemForSave );
};

export const getInteractionLabel = ( item: InteractionItem ): string => {
	const details = parseInteractionItem( item );
	
	// Map values to human-readable labels
	const triggerLabels: Record<string, string> = {
		load: 'On page load',
		scrollIn: 'Scroll into view',
		scrollOut: 'Scroll out of view',
	};
	
	const effectLabels: Record<string, string> = {
		fade: 'Fade',
		slide: 'Slide',
		scale: 'Scale',
	};
	
	const typeLabels: Record<string, string> = {
		in: 'In',
		out: 'Out',
	};
	
	const triggerLabel = triggerLabels[ details.trigger ] || details.trigger;
	const effectLabel = effectLabels[ details.effect ] || details.effect;
	const typeLabel = typeLabels[ details.type ] || details.type;
	
	return `${ triggerLabel }: ${ effectLabel } ${ typeLabel }`;
};