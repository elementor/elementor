import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { updateElementInteractions } from '@elementor/editor-elements';
import { z } from '@elementor/schema';

import { type ElementInteractions } from '../../types';
import { interactionsRepository } from '../../interactions-repository';
import {
	createInteractionItem,
	extractExcludedBreakpoints,
	extractString,
	extractSize,
} from '../../utils/prop-value-utils';
import { generateTempInteractionId } from '../../utils/temp-id-utils';
import { INTERACTIONS_SCHEMA_URI } from '../resources/interactions-schema-resource';

const MAX_INTERACTIONS_PER_ELEMENT = 5;

const EMPTY_INTERACTIONS: ElementInteractions = {
	version: 1,
	items: [],
};

export const initManageElementInteractionTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'manage-element-interaction',
		description: `Read or manage interactions (animations) on an element. Always call with action=get first to see existing interactions before making changes.

Actions:
- get: Read the current interactions on the element.
- add: Add a new interaction (max ${ MAX_INTERACTIONS_PER_ELEMENT } per element).
- update: Update an existing interaction by its interactionId.
- delete: Remove a specific interaction by its interactionId.
- clear: Remove all interactions from the element.

For add/update, provide: trigger, effect, effectType, direction (empty string for non-slide effects), duration, delay, easing.
Use excludedBreakpoints to disable the animation on specific responsive breakpoints (e.g. ["mobile", "tablet"]).`,
		schema: {
			elementId: z.string().describe( 'The ID of the element to read or modify interactions on' ),
			action: z
				.enum( [ 'get', 'add', 'update', 'delete', 'clear' ] )
				.describe( 'Operation to perform. Use "get" first to inspect existing interactions.' ),
			interactionId: z
				.string()
				.optional()
				.describe( 'Interaction ID — required for update and delete. Obtain from a prior "get" call.' ),
			trigger: z
				.enum( [ 'load', 'scrollIn' ] )
				.optional()
				.describe( 'Event that triggers the animation' ),
			effect: z
				.enum( [ 'fade', 'slide', 'scale' ] )
				.optional()
				.describe( 'Animation effect type' ),
			effectType: z
				.enum( [ 'in', 'out' ] )
				.optional()
				.describe( 'Whether the animation plays in or out' ),
			direction: z
				.enum( [ 'top', 'bottom', 'left', 'right', '' ] )
				.optional()
				.describe( 'Direction for slide effect. Use empty string for fade/scale.' ),
			duration: z
				.number()
				.min( 0 )
				.max( 10000 )
				.optional()
				.describe( 'Animation duration in milliseconds' ),
			delay: z
				.number()
				.min( 0 )
				.max( 10000 )
				.optional()
				.describe( 'Animation delay in milliseconds' ),
			easing: z
				.string()
				.optional()
				.describe( 'Easing function. See interactions schema for options.' ),
			excludedBreakpoints: z
				.array( z.string() )
				.optional()
				.describe(
					'Breakpoint IDs on which this interaction is disabled (e.g. ["mobile", "tablet"]). Omit to enable on all breakpoints.'
				),
		},
		requiredResources: [
			{ uri: INTERACTIONS_SCHEMA_URI, description: 'Interactions schema with all available options' },
		],
		isDestructive: true,
		handler: ( input ) => {
			const {
				elementId,
				action,
				interactionId,
				trigger,
				effect,
				effectType,
				direction,
				duration,
				delay,
				easing,
				excludedBreakpoints,
			} = input;

			const allInteractions = interactionsRepository.all();
			const elementData = allInteractions.find( ( data ) => data.elementId === elementId );
			const currentInteractions: ElementInteractions = elementData?.interactions ?? EMPTY_INTERACTIONS;

			if ( action === 'get' ) {
				const summary = currentInteractions.items.map( ( item ) => {
					const { value } = item;
					const animValue = value.animation.value;
					const timingValue = animValue.timing_config.value;
					const configValue = animValue.config.value;

					return {
						id: extractString( value.interaction_id ),
						trigger: extractString( value.trigger ),
						effect: extractString( animValue.effect ),
						effectType: extractString( animValue.type ),
						direction: extractString( animValue.direction ),
						duration: extractSize( timingValue.duration ),
						delay: extractSize( timingValue.delay ),
						easing: extractString( configValue.easing ),
						excludedBreakpoints: extractExcludedBreakpoints( value.breakpoints ),
					};
				} );

				return JSON.stringify( {
					elementId,
					interactions: summary,
					count: summary.length,
				} );
			}

			let updatedItems = [ ...currentInteractions.items ];

			switch ( action ) {
				case 'add': {
					if ( updatedItems.length >= MAX_INTERACTIONS_PER_ELEMENT ) {
						throw new Error(
							`Cannot add more than ${ MAX_INTERACTIONS_PER_ELEMENT } interactions per element. Current count: ${ updatedItems.length }. Delete an existing interaction first.`
						);
					}

					const newItem = createInteractionItem( {
						interactionId: generateTempInteractionId(),
						trigger: trigger ?? 'load',
						effect: effect ?? 'fade',
						type: effectType ?? 'in',
						direction: direction ?? '',
						duration: duration ?? 600,
						delay: delay ?? 0,
						replay: false,
						easing: easing ?? 'easeIn',
						excludedBreakpoints,
					} );

					updatedItems = [ ...updatedItems, newItem ];
					break;
				}

				case 'update': {
					if ( ! interactionId ) {
						throw new Error( 'interactionId is required for the update action.' );
					}

					const itemIndex = updatedItems.findIndex(
						( item ) => extractString( item.value.interaction_id ) === interactionId
					);

					if ( itemIndex === -1 ) {
						throw new Error( `Interaction with ID "${ interactionId }" not found on element "${ elementId }".` );
					}

					const existingItem = updatedItems[ itemIndex ];
					const existingValue = existingItem.value;
					const existingAnimation = existingValue.animation.value;
					const existingTiming = existingAnimation.timing_config.value;
					const existingConfig = existingAnimation.config.value;
					const existingExcludedBreakpoints = extractExcludedBreakpoints( existingValue.breakpoints );

					const updatedItem = createInteractionItem( {
						interactionId,
						trigger: trigger ?? extractString( existingValue.trigger ),
						effect: effect ?? extractString( existingAnimation.effect ),
						type: effectType ?? extractString( existingAnimation.type ),
						direction: direction !== undefined ? direction : extractString( existingAnimation.direction ),
						duration: duration !== undefined ? duration : ( extractSize( existingTiming.duration ) as number ),
						delay: delay !== undefined ? delay : ( extractSize( existingTiming.delay ) as number ),
						replay: existingConfig.replay?.value ?? false,
						easing: easing ?? extractString( existingConfig.easing ),
						excludedBreakpoints: excludedBreakpoints !== undefined ? excludedBreakpoints : existingExcludedBreakpoints,
					} );

					updatedItems = [
						...updatedItems.slice( 0, itemIndex ),
						updatedItem,
						...updatedItems.slice( itemIndex + 1 ),
					];
					break;
				}

				case 'delete': {
					if ( ! interactionId ) {
						throw new Error( 'interactionId is required for the delete action.' );
					}

					const beforeCount = updatedItems.length;
					updatedItems = updatedItems.filter(
						( item ) => extractString( item.value.interaction_id ) !== interactionId
					);

					if ( updatedItems.length === beforeCount ) {
						throw new Error( `Interaction with ID "${ interactionId }" not found on element "${ elementId }".` );
					}
					break;
				}

				case 'clear': {
					updatedItems = [];
					break;
				}
			}

			const updatedInteractions: ElementInteractions = {
				...currentInteractions,
				items: updatedItems,
			};

			updateElementInteractions( { elementId, interactions: updatedInteractions } );

			return JSON.stringify( {
				success: true,
				action,
				elementId,
				interactionCount: updatedItems.length,
			} );
		},
	} );
};
