import { z } from '@elementor/schema';

export const inputSchema = {
	xmlStructure: z.string().describe( 'The XML structure representing the composition to be built' ),
	elementConfig: z
		.record(
			z.string().describe( 'The configuration id' ),
			z.record( z.string().describe( 'property name' ), z.any().describe( 'The PropValue for the property' ) )
		)
		.describe( 'A record mapping element IDs to their configuration objects. REQUIRED' ),
	stylesConfig: z
		.record(
			z.string().describe( 'The configuration id' ),
			z.record(
				z.string().describe( '_styles property name' ),
				z.any().describe( 'The PropValue for the style property. MANDATORY' )
			)
		)
		.describe( 'A record mapping element IDs to their styles configuration objects.' )
		.default( {} ),
};

export const outputSchema = {
	errors: z.string().describe( 'Error message if the composition building failed' ).optional(),
	xmlStructure: z.string().describe( 'The built XML structure as a string' ).optional(),
	llmInstructions: z.string().describe( 'Instructions used to further actions for you' ).optional(),
};
