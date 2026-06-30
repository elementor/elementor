import { z } from '@elementor/schema';

import { WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const inputSchema = {
	xmlStructure: z.string().describe( 'The XML structure representing the composition to be built' ),
	elementConfig: z
		.record(
			z.string().describe( 'The configuration id' ),
			z.record(
				z.string().describe( 'property name' ),
				z.any().describe( `The PropValue for the property, refer to ${ WIDGET_SCHEMA_URI }` )
			)
		)
		.describe( 'A record mapping element IDs to their configuration objects. REQUIRED' ),
	style: z
		.record(
			z.string().describe( 'The configuration id' ),
			z.record(
				z.string().describe( 'A CSS property name, e.g. "color", "padding".' ),
				z.string().describe( 'A CSS value, e.g. "6rem 4rem", "#2d2a26".' )
			)
		)
		.describe(
			'A record mapping element configuration IDs to their raw CSS declarations (property→value). Converted to native styles server-side; any declaration that cannot be converted is stored as the element custom CSS.'
		)
		.default( {} ),
};

export const outputSchema = {
	errors: z.string().describe( 'Error message if the composition building failed' ).optional(),
	xmlStructure: z
		.string()
		.describe(
			'The built XML structure as a string. Must use this XML after completion of building the composition, it contains real IDs.'
		)
		.optional(),
	llm_instructions: z
		.string()
		.describe( 'Instructions what to do next, Important to follow these instructions!' )
		.optional(),
};
