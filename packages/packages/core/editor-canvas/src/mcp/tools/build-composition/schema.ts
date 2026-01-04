import { z } from '@elementor/schema';

import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

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
	stylesConfig: z
		.record(
			z.string().describe( 'The configuration id' ),
			z.record(
				z.string().describe( 'StyleSchema property name' ),
				z.any().describe( `The PropValue for the style property. MANDATORY, refer to [${ STYLE_SCHEMA_URI }]` )
			)
		)
		.describe(
			`A record mapping element IDs to their styles configuration objects. Use the actual styles schema from [${ STYLE_SCHEMA_URI }].`
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
	llmInstructions: z.string().describe( 'Instructions for what to do next, Important to follow these instructions!' ),
};
