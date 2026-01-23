import { z } from '@elementor/schema';

import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const inputSchema = {
	propertiesToChange: z
		.record(
			z.string().describe( 'The property name.' ),
			z
				.any()
				.describe( `PropValue, refer to [${ WIDGET_SCHEMA_URI }] by correct type, as appears in elementType` ),
			z.any()
		)
		.describe( 'An object record containing property names and their new values to be set on the element' ),
	stylePropertiesToChange: z
		.record(
			z.string().describe( 'The style property name' ),
			z.any().describe( `The style PropValue, refer to [${ STYLE_SCHEMA_URI }] how to generate values` ),
			z.any()
		)
		.describe( 'An object record containing style property names and their new values to be set on the element' )
		.default( {} ),
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
