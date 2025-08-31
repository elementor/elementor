import { z } from 'zod';
import { GLOBAL_CLASSES_PROVIDER_KEY, StoreActions } from '@elementor/editor-global-classes';
import { stylesRepository } from '@elementor/editor-styles-repository';

export const RemoveGlobalClassParamsSchema = z
	// .union( [
	// 	z.strictObject( {
	// 		classId: z.string().describe( 'The unique identifier of the global class to remove' ),
	// 	} ),
	// 	z.strictObject( {
	// 		label: z.string().describe( 'The label/name of the global class to remove' ),
	// 	} ),
	// ] )
	.object( {
		classId: z.string().optional().describe( 'The unique identifier of the global class to remove' ),
		label: z.string().optional().describe( 'The label/name of the global class to remove' ),
	} )
	.describe( 'Parameters to identify the global class to remove, must either specify label or classId' );

export type RemoveGlobalClassInput = z.infer< typeof RemoveGlobalClassParamsSchema >;

export const RemoveGlobalClassOutputSchema = z.object( {
	removeClassLabel: z.string().describe( 'The label of the removed global class' ),
	message: z.string().describe( 'Result message' ),
} );

export async function removeGlobalClass(
	input: RemoveGlobalClassInput
): Promise< z.infer< typeof RemoveGlobalClassOutputSchema > > {
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

		if ( 'classId' in input && input.classId ) {
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
}
