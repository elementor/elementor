import { z } from 'zod';
import { GLOBAL_CLASSES_PROVIDER_KEY } from '@elementor/editor-global-classes';
import { stylesRepository } from '@elementor/editor-styles-repository';

export const GlobalClassInfoSchema = z.object( {
	id: z.string().describe( 'The unique identifier of the global class' ),
	label: z.string().describe( 'The label or name of the global class' ),
	variants: z
		.array(
			z.object( {
				meta: z
					.object( {
						breakpoint: z.string().nullable().describe( 'The breakpoint ID for the variant, if any' ),
					} )
					.describe( 'Metadata associated with the variant' ),
			} )
		)
		.describe( 'An array of variants for the global class' ),
} );

export function listGlobalClasses() {
	try {
		const globalCalssesProvider = stylesRepository.getProviderByKey( GLOBAL_CLASSES_PROVIDER_KEY ); // Ensure the provider is initialized
		const allClasses = globalCalssesProvider?.actions.all() || [];
		const data = allClasses.map( ( entry ) => ( {
			id: entry.id,
			label: entry.label,
			variants: entry.variants,
		} ) );
		return {
			data,
		};
	} catch ( error ) {
		throw new Error(
			`Failed to list global classes: ${ error instanceof Error ? error.message : 'Unknown error' }`
		);
	}
}
