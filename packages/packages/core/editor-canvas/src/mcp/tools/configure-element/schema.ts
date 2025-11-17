import { z } from '@elementor/schema';

export const inputSchema = {
	propertiesToChange: z
		.record(
			z
				.string()
				.describe(
					'The property name. If nested property, provide the root property name, and the object delta only.'
				),
			z.any().describe( "The property's value" )
		)
		.describe( 'An object record containing property names and their new values to be set on the element' )
		.optional(),
	elementType: z.string().describe( 'The type of the element to retreive the schema' ),
	elementId: z.string().describe( 'The unique id of the element to configure' ),
};

export const outputSchema = {
	success: z
		.boolean()
		.describe(
			'Whether the configuration change was successful, only if propertyName and propertyValue are provided'
		),
};
