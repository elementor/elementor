import { z } from 'zod';
import { GLOBAL_CLASSES_PROVIDER_KEY, StoreActions } from '@elementor/editor-global-classes';
import { stylesRepository } from '@elementor/editor-styles-repository';

import { type addTool } from '../../init';

const RemoveGlobalClassParamsSchema = z
	.object( {
		classId: z.string().optional().describe( 'The unique identifier of the global class to remove' ),
		label: z.string().optional().describe( 'The label/name of the global class to remove' ),
	} )
	.describe( 'Parameters to identify the global class to remove, must either specify label or classId' );

export type RemoveGlobalClassInput = z.ZodType< typeof RemoveGlobalClassParamsSchema >;

export const RemoveGlobalClassOutputSchema = z.object( {
	removeClassLabel: z.string().describe( 'The label of the removed global class' ),
	message: z.string().describe( 'Result message' ),
} );

export default ( _addTool: typeof addTool ) =>
	_addTool( {
		name: 'remove-global-class',
		description: getDescription(),
		schema: RemoveGlobalClassParamsSchema,
		outputSchema: z.object( {
			message: z.string().describe( 'Result message to be displayed to the user' ),
			removeClassLabel: z.string().describe( 'The label of the removed global class' ),
		} ), //RemoveGlobalClassOutputSchema,
		handler: async ( input, server ) => {
			const response = await server.server.request(
				{
					method: 'elicitation/create',
					params: {
						prompt: 'Please confirm you want to remove this global class. This action will unapply it from all elements that use it across the site. Reply with "yes" to confirm or "no" to cancel.',
						maxTokens: 50,
						temperature: 0,
					},
				},
				z.object( { userConfirmed: z.boolean().describe( 'User explicit confirmation, "yes" or "no"' ) } )
			);
			debugger;
			console.log( response );
			try {
				const globalClassesProvider = stylesRepository.getProviderByKey( GLOBAL_CLASSES_PROVIDER_KEY );
				if ( ! globalClassesProvider ) {
					throw new Error( 'Global classes provider not found' );
				}
				if ( ! globalClassesProvider.actions.delete ) {
					throw new Error( 'Delete action not available or not allowed' );
				}

				let classToRemove;
				let classId: string;

				if ( !! input && 'classId' in input && input.classId ) {
					classId = input.classId;
					classToRemove = globalClassesProvider.actions.get( classId );
				} else if ( input.label ) {
					const allClasses = globalClassesProvider.actions.all();
					classToRemove = allClasses.find( ( cls ) => cls.label === input.label );
					if ( classToRemove ) {
						classId = classToRemove.id;
					}
				}

				if ( ! classToRemove ) {
					const identifier = 'classId' in input ? input.classId : input.label;
					throw new Error( `Global class with ${ identifier } not found` );
				}
				StoreActions.deleteClass( classToRemove.id );
				return {
					removeClassLabel: classToRemove.label,
					message: `Global class '${ classToRemove.label }' removed successfully. Please note that if you publish the page, the removed class will affect all usages across your site.`,
				};
			} catch ( error ) {
				throw new Error(
					`Failed to remove global class: ${ error instanceof Error ? error.message : 'Unknown error' }`
				);
			}
		},
	} );

function getDescription() {
	return `Use this tool to remove a global class (or "global style") by its ID or label, and unapply it from all elements that use it.

## When to use this tool
- When a user, tool, or agent, wants to delete a specific global class from the editor.
- When a user, tool, or agent, needs to clean up unused or redundant global styles.
- When a user, tool, or agent, wants to ensure that a particular style is no longer available for application across elements.

<important>
Be cautious when using this tool, as removing a global class will unapply it from all elements that use it across the site. Ensure that the user is aware of the implications of this action before proceeding.
Ask for user confirmation before executing this, as this action has effects over other pages.
The user must be informed beforehand that this action will unapply the class from all elements that use it across the site.
The user must confirm they understand and approve this action.
</important>
`;
}
