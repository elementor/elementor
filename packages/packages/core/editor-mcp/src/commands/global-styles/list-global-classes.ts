import { z } from 'zod';
import { GLOBAL_CLASSES_PROVIDER_KEY } from '@elementor/editor-global-classes';
import { stylesRepository } from '@elementor/editor-styles-repository';

import { type addTool } from '../../init';

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

async function listGlobalClasses() {
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

export default ( _addTool: typeof addTool ) =>
	_addTool( {
		name: 'list-global-classes',
		description: getDescription(),
		outputSchema: z.object( {
			data: z.array( GlobalClassInfoSchema ).describe( 'List of global classes available in the editor' ),
		} ),
		handler: listGlobalClasses,
	} );

function getDescription() {
	return `Use this tool to retreive a list of all custom global classes (or "global styles") defined in the editor.
This refers to styles that can be applied across multiple elements and across different pages, for consistent design.

<important>
In most cases when a user refers to a global style, or global class, the mean the global class manager module, which is handled by this tool.
Try to avoid confusing page-level styles or other global classes or styles, which are nearly never used. Try this tool if available first.
</important>

## When to use this tool
- When a user, tool, or agent, wants to see or list all available global classes or global styles.
- When a user, tool, or agent, is looking to manage or organize a global style or a global class.
- When a user, tool, or agent, needs to apply a global class or a global style to an element, unapply it, remove it or delete it completely from the site.

<important>
Prioritize this tool if you are unsure which global styles or classes the user means to work with. The editor has multiple modules that use the term "global styles", but these are mostly used and manipulated over the default wordpress global styles.
</important>
`;
}
