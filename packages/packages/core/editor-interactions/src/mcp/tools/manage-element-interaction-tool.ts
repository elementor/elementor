import { updateElementInteractions } from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';
import { isProUser } from '@elementor/utils';

import { interactionsRepository } from '../../interactions-repository';
import { type ElementInteractions } from '../../types';
import { createInteractionItem, extractString } from '../../utils/prop-value-utils';
import { generateTempInteractionId } from '../../utils/temp-id-utils';
import { MAX_INTERACTIONS_PER_ELEMENT } from '../constants';
import { INTERACTIONS_SCHEMA_URI } from '../resources/interactions-schema-resource';
import { baseSchema, proSchema } from './schema';

const EMPTY_INTERACTIONS: ElementInteractions = {
	version: 1,
	items: [],
};

export const initManageElementInteractionTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;
	const extendedSchema = isProUser() ? { ...baseSchema, ...proSchema } : baseSchema;
	const schema = {
		elementId: z.string().describe( 'The ID of the element to read or modify interactions on' ),
		action: z
			.enum( [ 'get', 'add', 'update', 'delete', 'clear' ] )
			.describe( 'Operation to perform. Use "get" first to inspect existing interactions.' ),
		interactionId: z
			.string()
			.optional()
			.describe( 'Interaction ID — required for update and delete. Obtain from a prior "get" call.' ),
		...extendedSchema,
	};

	addTool( {
		name: 'manage-element-interaction',
		description: `Manage the element interaction.`,
		schema,
		requiredResources: [
			{ uri: INTERACTIONS_SCHEMA_URI, description: 'Interactions schema with all available options' },
		],
		isDestructive: true,
		outputSchema: {
			success: z.boolean().describe( 'Whether the action was successful' ),
			action: z
				.enum( [ 'get', 'add', 'update', 'delete', 'clear' ] )
				.describe( 'Operation to perform. Use "get" first to inspect existing interactions.' ),
			elementId: z.string().optional().describe( 'The ID of the element to read or modify interactions on' ),
			interactions: z.array( z.any() ).optional().describe( 'The interactions on the element' ),
			count: z.number().optional().describe( 'The number of interactions on the element' ),
		},
		handler: ( input: {
			elementId: string;
			action: 'get' | 'add' | 'update' | 'delete' | 'clear';
			interactionId?: string;
			[ key: string ]: any;
		} ) => {
			const { elementId, action, interactionId, ...animationData } = input;

			const allInteractions = interactionsRepository.all();
			const elementData = allInteractions.find( ( data ) => data.elementId === elementId );
			const currentInteractions: ElementInteractions = elementData?.interactions ?? EMPTY_INTERACTIONS;

			if ( action === 'get' ) {
				return {
					success: true,
					elementId,
					action,
					interactions: currentInteractions.items,
					count: currentInteractions.items.length,
				};
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
						...animationData,
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
						throw new Error(
							`Interaction with ID "${ interactionId }" not found on element "${ elementId }".`
						);
					}

					const updatedItem = createInteractionItem( {
						interactionId,
						...animationData,
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
						throw new Error(
							`Interaction with ID "${ interactionId }" not found on element "${ elementId }".`
						);
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

			try {
				updateElementInteractions( { elementId, interactions: updatedInteractions } );
			} catch ( error ) {
				throw new Error(
					`Failed to update interactions for element "${ elementId }": ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				);
			}

			return {
				success: true,
				action,
				elementId,
				count: updatedItems.length,
			};
		},
	} );
};
